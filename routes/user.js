import express from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/user/me — AUTHENTICATED
// Returns the current user's app-specific profile fields (plan, app_id, etc).
// Added to match the frontend's expectation (src/services/api.ts -> getCurrentUser()),
// which was not present in the original backend endpoint set.
router.get('/me', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, plan, app_id')
    .eq('id', req.user.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: data });
});

export default router;
