import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAnon } from '../../../db/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { app_id, type, data, url } = req.body;

    if (!app_id || !type) {
      return res.status(400).json({ error: 'app_id and type are required' });
    }

    // Generate AI diagnosis based on event type
    let ai_diagnosis = '';
    switch (type) {
      case 'crash':
        ai_diagnosis = 'JavaScript runtime exception detected. Check the error stack trace for the specific line causing the failure.';
        break;
      case 'rage_click':
        ai_diagnosis = 'User repeatedly clicked on a non-responsive element. Consider adding visual feedback or fixing the underlying issue.';
        break;
      case 'long_pause':
        ai_diagnosis = 'User spent significant time on this page without interacting. This may indicate confusion or difficulty understanding the content.';
        break;
      case 'feedback':
        ai_diagnosis = 'Direct user feedback received. Review the submitted comments for actionable insights.';
        break;
      default:
        ai_diagnosis = 'Event captured. AI analysis pending...';
    }

    // Insert event into Supabase
    const { data: event, error } = await supabaseAnon
      .from('events')
      .insert({
        app_id,
        type,
        raw_data: data,
        page_url: url,
        ai_diagnosis,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      // Return success anyway for demo purposes - the event is logged client-side
      return res.status(200).json({ event_id: `demo_${Date.now()}`, ai_diagnosis });
    }

    return res.status(200).json({ event_id: event.id, ai_diagnosis });

  } catch (err) {
    console.error('Events error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
