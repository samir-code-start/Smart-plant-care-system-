// GET /api/sensor-history
// Fetches recent ThingSpeak feeds for trend charting.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchRecentFeeds } from './_shared/thingspeakClient.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const resultsParam = req.query.results;
    const results = resultsParam ? parseInt(String(resultsParam), 10) : 30;

    if (isNaN(results) || results < 1 || results > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid results parameter. Must be between 1 and 100.',
      });
    }

    const { channel_id, readings } = await fetchRecentFeeds(results);

    return res.status(200).json({
      success: true,
      data: {
        channel_id,
        count: readings.length,
        readings: readings.map((r) => ({
          entry_id: r.entry_id,
          timestamp: r.timestamp,
          raw_adc: r.raw_adc,
          moisture_pct: r.moisture_pct,
          source: 'sensor' as const,
        })),
      },
    });
  } catch (error) {
    console.error('sensor-history error:', error);
    return res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sensor history',
    });
  }
}
