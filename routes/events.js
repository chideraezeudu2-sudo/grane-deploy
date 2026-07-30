import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { supabaseAdmin } from '../db/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { getPlanLimits, canUseAiForEventType } from '../services/planLimits.js';
import { isWithinAiBudget, logAiCall, translateCrash, translateUxFriction } from '../services/aiService.js';
import { redactPii } from '../services/redact.js';

const router = express.Router();

/**
 * POST /api/events
 * PUBLIC — called by the widget, no user JWT (widget doesn't know the user's
 * session, only the app_id embedded in the snippet).
 * Authenticates the request by looking up the user via app_id.
 *
 * CRITICAL: returns { event_id } in the response. This is what the widget's
 * sendEvent() needs to correctly link a later feedback submission back to
 * this event — the bug fixed from the original spec.
 */
router.post(
  '/',
  [
    body('app_id').notEmpty(),
    body('type').isIn(['feedback', 'rage_click', 'crash', 'long_pause']),
    body('data').isObject()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { app_id, type, data, url } = req.body;

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, plan')
      .eq('app_id', app_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Invalid app_id' });
    }

    // Enforce monthly event cap before inserting.
    const limits = getPlanLimits(user.plan);
    const startOfPeriod = new Date();
    startOfPeriod.setDate(startOfPeriod.getDate() - 30); // simplified rolling window; swap for real billing period if needed

    const { count: eventsThisPeriod } = await supabaseAdmin
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfPeriod.toISOString());

    if ((eventsThisPeriod || 0) >= limits.eventsPerMonth) {
      return res.status(429).json({ error: 'Event limit reached for current plan' });
    }

    // Insert the event first (always happens, regardless of AI availability).
    const { data: insertedEvent, error: insertError } = await supabaseAdmin
      .from('events')
      .insert({
        user_id: user.id,
        type,
        page_url: url || data?.url || null,
        raw_data: data
      })
      .select('id')
      .single();

    if (insertError) {
      return res.status(500).json({ error: 'Failed to record event' });
    }

    const eventId = insertedEvent.id;

    // Fire-and-forget AI diagnosis — don't block the widget's response on this.
    // The widget only needs event_id back immediately; AI diagnosis populates
    // asynchronously and shows up next time the dashboard is loaded.
    maybeRunAiDiagnosis({ eventId, userId: user.id, appId: app_id, plan: user.plan, type, data });

    return res.status(201).json({ event_id: eventId });
  }
);

async function maybeRunAiDiagnosis({ eventId, userId, appId, plan, type, data }) {
  try {
    if (!canUseAiForEventType(plan, type) || type === 'feedback') return;

    const withinBudget = await isWithinAiBudget(appId);
    if (!withinBudget) {
      await supabaseAdmin.from('events').update({ ai_skipped_reason: 'budget_exceeded' }).eq('id', eventId);
      return;
    }

    let diagnosis;
    if (type === 'crash') {
      diagnosis = await translateCrash({
        errorMessage: data.message,
        stackTrace: data.stack,
        browserInfo: data.user_agent,
        pageUrl: data.url
      });
    } else if (type === 'rage_click' || type === 'long_pause') {
      diagnosis = await translateUxFriction({
        pageUrl: data.url,
        timeSpent: data.time_spent || 'unknown',
        buttonText: data.button_text || 'a button',
        clicks: data.click_count || 'several'
      });
    }

    await logAiCall(userId, appId);
    await supabaseAdmin.from('events').update({ ai_diagnosis: diagnosis }).eq('id', eventId);
  } catch (err) {
    console.error('AI diagnosis failed for event', eventId, err.message);
    // Event already saved; AI diagnosis simply stays null. Non-fatal.
  }
}

/**
 * POST /api/events/:id/feedback
 * PUBLIC — called by the widget's feedback modal after sendEvent() returns
 * an event_id. This is the fix for the original spec's broken linkage.
 */
router.post(
  '/:id/feedback',
  [param('id').isUUID(), body('feedback').isString().isLength({ min: 1, max: 2000 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { id } = req.params;
    const cleanFeedback = redactPii(req.body.feedback);

    const { error } = await supabaseAdmin
      .from('events')
      .update({ user_feedback: cleanFeedback })
      .eq('id', id);

    if (error) return res.status(500).json({ error: 'Failed to attach feedback' });
    return res.status(200).json({ message: 'Feedback recorded' });
  }
);

/**
 * GET /api/events
 * AUTHENTICATED — dashboard event feed. RLS via req.supabase ensures the
 * user only ever sees their own events.
 */
router.get('/', requireAuth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;

  const { data, error } = await req.supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ events: data });
});

/**
 * GET /api/events/:id
 * AUTHENTICATED — single event detail.
 */
router.get('/:id', requireAuth, [param('id').isUUID()], async (req, res) => {
  const { data, error } = await req.supabase
    .from('events')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Event not found' });
  return res.json({ event: data });
});

export default router;
