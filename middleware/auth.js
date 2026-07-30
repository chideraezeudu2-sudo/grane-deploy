import { supabaseForUser } from '../db/supabase.js';

/**
 * Verifies the Supabase JWT sent in the Authorization header.
 * On success, attaches:
 *   req.user       -> { id, email }
 *   req.supabase   -> a Supabase client scoped to this user's JWT (RLS applies)
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const scopedClient = supabaseForUser(token);
  const { data, error } = await scopedClient.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = { id: data.user.id, email: data.user.email };
  req.supabase = scopedClient;
  next();
}

export { requireAuth };
