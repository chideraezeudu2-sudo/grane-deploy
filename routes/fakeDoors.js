import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { supabaseAdmin } from '../db/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { getPlanLimits } from '../services/planLimits.js';
import { analyzeFakeDoorSentiment } from '../services/aiService.js';
import { redactPii } from '../services/redact.js';

const router = express.Router();

// GET /api/fake-doors — AUTHENTICATED
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from('fake_doors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ fake_doors: data });
});

// POST /api/fake-doors — AUTHENTICATED, enforces plan cap on active count
router.post(
  '/',
  requireAuth,
  [body('feature_name').isString().isLength({ min: 1, max: 200 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    // Look up plan to enforce Fake Door count cap.
    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('plan')
      .eq('id', req.user.id)
      .single();

    const limits = getPlanLimits(userRow.plan);

    const { count: activeCount } = await req.supabase
      .from('fake_doors')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    if ((activeCount || 0) >= limits.fakeDoors.max) {
      return res.status(403).json({
        error: `Your plan allows ${limits.fakeDoors.max} active Fake Door(s). Upgrade to add more.`
      });
    }

    const { feature_name, feature_description, button_text } = req.body;

    const { data, error } = await req.supabase
      .from('fake_doors')
      .insert({
        user_id: req.user.id,
        feature_name,
        feature_description,
        button_text: button_text || 'Notify Me'
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ fake_door: data });
  }
);

// PUT /api/fake-doors/:id — AUTHENTICATED
router.put('/:id', requireAuth, [param('id').isUUID()], async (req, res) => {
  const allowedFields = ['feature_name', 'feature_description', 'button_text', 'is_active'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await req.supabase
    .from('fake_doors')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ fake_door: data });
});

// DELETE /api/fake-doors/:id — AUTHENTICATED
router.delete('/:id', requireAuth, [param('id').isUUID()], async (req, res) => {
  const { error } = await req.supabase.from('fake_doors').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

/**
 * POST /api/fake-doors/:id/clicks
 * PUBLIC — called from the user's actual app when someone clicks the
 * Fake Door button. No auth; this is a public-facing signal from an
 * end-user of the AppPulse customer's app, not from the customer themselves.
 */
router.post(
  '/:id/clicks',
  [param('id').isUUID(), body('feedback_text').optional().isString().isLength({ max: 1000 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { id } = req.params;
    const feedbackText = req.body.feedback_text ? redactPii(req.body.feedback_text) : null;

    const { data: fakeDoor, error: fetchError } = await supabaseAdmin
      .from('fake_doors')
      .select('id, user_id, feature_name, total_clicks')
      .eq('id', id)
      .single();

    if (fetchError || !fakeDoor) return res.status(404).json({ error: 'Fake Door not found' });

    await supabaseAdmin.from('fake_door_clicks').insert({ fake_door_id: id, feedback_text: feedbackText });

    const newTotal = (fakeDoor.total_clicks || 0) + 1;
    await supabaseAdmin.from('fake_doors').update({ total_clicks: newTotal }).eq('id', id);

    return res.status(201).json({ message: 'Click recorded', total_clicks: newTotal });
  }
);

/**
 * POST /api/fake-doors/:id/analyze
 * AUTHENTICATED — triggers (or re-triggers) AI sentiment analysis on demand.
 * Gated by plan (Basic+ only) — Free tier gets raw click counts, no AI.
 */
router.post('/:id/analyze', requireAuth, [param('id').isUUID()], async (req, res) => {
  const { data: userRow } = await supabaseAdmin.from('users').select('plan').eq('id', req.user.id).single();
  const limits = getPlanLimits(userRow.plan);

  if (!limits.fakeDoors.aiSentiment) {
    return res.status(403).json({ error: 'AI sentiment analysis requires Basic plan or higher' });
  }

  const { data: fakeDoor, error } = await req.supabase.from('fake_doors').select('*').eq('id', req.params.id).single();
  if (error || !fakeDoor) return res.status(404).json({ error: 'Fake Door not found' });

  const { data: clicks } = await req.supabase
    .from('fake_door_clicks')
    .select('feedback_text')
    .eq('fake_door_id', req.params.id)
    .not('feedback_text', 'is', null);

  const feedbackTexts = (clicks || []).map((c) => c.feedback_text).filter(Boolean);

  const result = await analyzeFakeDoorSentiment({
    featureName: fakeDoor.feature_name,
    totalClicks: fakeDoor.total_clicks,
    feedbackTexts
  });

  await req.supabase
    .from('fake_doors')
    .update({ sentiment_score: result.score, sentiment_summary: result.summary })
    .eq('id', req.params.id);

  return res.json({ sentiment_score: result.score, sentiment_summary: result.summary });
});

export default router;
