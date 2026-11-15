// POST /api/manual-reading
// Validates and stores a manual moisture reading in Supabase.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from './_shared/supabaseClient';
import { VALID_PLANT_IDS, VALID_GROWTH_STAGES, VALID_MOISTURE_STATUSES } from './_shared/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { plant_id, growth_stage, moisture_status, notes } = req.body || {};

    // --- Validation ---
    if (!plant_id || !VALID_PLANT_IDS.includes(plant_id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid plant_id. Must be one of: ${VALID_PLANT_IDS.join(', ')}`,
      });
    }

    if (!growth_stage || !VALID_GROWTH_STAGES.includes(growth_stage)) {
      return res.status(400).json({
        success: false,
        error: `Invalid growth_stage. Must be one of: ${VALID_GROWTH_STAGES.join(', ')}`,
      });
    }

    if (!moisture_status || !VALID_MOISTURE_STATUSES.includes(moisture_status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid moisture_status. Must be one of: ${VALID_MOISTURE_STATUSES.join(', ')}`,
      });
    }

    // --- Insert into Supabase ---
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('moisture_readings')
      .insert({
        plant_id,
        growth_stage,
        moisture_status,
        input_source: 'manual',
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({
        success: false,
        error: `Database error: ${error.message}`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Manual reading recorded successfully',
      data,
    });
  } catch (error) {
    console.error('manual-reading error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save manual reading',
    });
  }
}
