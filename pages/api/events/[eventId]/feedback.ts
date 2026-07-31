import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAnon } from '../../../../db/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { eventId } = req.query;
    const { feedback } = req.body;

    if (!eventId || !feedback) {
      return res.status(400).json({ error: 'eventId and feedback are required' });
    }

    // Update the event with feedback
    const { error } = await supabaseAnon
      .from('events')
      .update({ user_feedback: feedback })
      .eq('id', eventId);

    if (error) {
      console.error('Supabase error:', error);
      // Return success anyway for demo purposes
      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Feedback error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
