// GET /api/manual-history
// Fetches recent manual moisture readings from Supabase.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from './_shared/supabaseClient.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const plantId = req.query.plant_id ? String(req.query.plant_id) : undefined;
    const limitParam = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const limit = Math.min(Math.max(limitParam, 1), 100);

    const supabase = getSupabaseClient();

    let query = supabase
      .from('moisture_readings')
      .select('*')
      .eq('input_source', 'manual')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (plantId) {
      query = query.eq('plant_id', plantId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        error: `Database error: ${error.message}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        readings: data || [],
      },
    });
  } catch (error) {
    console.error('manual-history error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch manual history',
    });
  }
}
