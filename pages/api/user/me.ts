import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAnon, supabaseAdmin } from '../../../db/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile from database
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('id, email, plan, app_id')
      .eq('id', user.id)
      .single();

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        plan: profile?.plan || 'free',
        app_id: profile?.app_id || user.id // fallback to user id if no app_id
      }
    });

  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
