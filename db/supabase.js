import { createClient } from '@supabase/supabase-js';

// Service role client — bypasses RLS. Used ONLY for:
// 1. Public widget endpoints (no user JWT available to authenticate as)
// 2. Server-side admin operations (plan updates from Stripe webhooks, etc.)
// NEVER expose this client or its key to the frontend.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Creates a client scoped to a specific user's JWT — respects RLS.
// Used for all authenticated dashboard requests so RLS policies apply.
function supabaseForUser(userJwt) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${userJwt}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export { supabaseAdmin, supabaseForUser };
