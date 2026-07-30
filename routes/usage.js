import express from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { getPlanLimits } from '../services/planLimits.js';

const router = express.Router();

// GET /api/usage — AUTHENTICATED
router.get('/', requireAuth, async (req, res) => {
  const { data: userRow, error: userError } = await supabaseAdmin
    .from('users')
    .select('plan, current_period_start, current_period_end')
    .eq('id', req.user.id)
    .single();

  if (userError) return res.status(500).json({ error: userError.message });

  const limits = getPlanLimits(userRow.plan);

  const { count, error } = await req.supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', userRow.current_period_start);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    plan: userRow.plan,
    events_used: count || 0,
    events_limit: limits.eventsPerMonth,
    percent_used: Math.min(100, Math.round(((count || 0) / limits.eventsPerMonth) * 100)),
    period_start: userRow.current_period_start,
    period_end: userRow.current_period_end
  });
});

export default router;
