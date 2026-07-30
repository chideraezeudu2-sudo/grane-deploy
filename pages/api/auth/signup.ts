import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, supabaseAnon } from '../../../db/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const { data, error } = await supabaseAnon.auth.signUp({ email, password });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Upsert user profile - handle both trigger-created and new inserts
    if (data.user) {
      const { error: upsertError } = await supabaseAdmin
        .from('users')
        .upsert({ id: data.user.id, email }, { onConflict: 'id' })
        .select('id, email, plan, app_id')
        .single();

      if (upsertError) {
        console.error('User upsert error:', upsertError);
      }
    }

    return res.status(201).json({
      user: data.user,
      session: data.session
    });

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
