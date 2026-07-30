import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/analytics/events-over-time
 * Returns daily counts per event type for the last 30 days.
 * Shape: [{ date: '2026-07-01', crash: 3, rage_click: 1, long_pause: 0, feedback: 2 }, ...]
 * Aggregation is done in-memory here for simplicity; for larger datasets,
 * consider a Postgres view or RPC function instead.
 */
router.get('/events-over-time', requireAuth, async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await req.supabase
    .from('events')
    .select('type, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (error) return res.status(500).json({ error: error.message });

  const byDate = {};
  for (const event of data) {
    const day = event.created_at.slice(0, 10); // YYYY-MM-DD
    if (!byDate[day]) byDate[day] = { date: day, crash: 0, rage_click: 0, long_pause: 0, feedback: 0 };
    byDate[day][event.type]++;
  }

  const series = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  return res.json({ series });
});

/**
 * GET /api/analytics/top-pages
 * Returns top 5 page_urls ranked by event count.
 * Shape: [{ page_url: '/checkout', count: 42 }, ...]
 */
router.get('/top-pages', requireAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from('events')
    .select('page_url')
    .not('page_url', 'is', null);

  if (error) return res.status(500).json({ error: error.message });

  const counts = {};
  for (const row of data) {
    counts[row.page_url] = (counts[row.page_url] || 0) + 1;
  }

  const topPages = Object.entries(counts)
    .map(([page_url, count]) => ({ page_url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return res.json({ top_pages: topPages });
});

export default router;
