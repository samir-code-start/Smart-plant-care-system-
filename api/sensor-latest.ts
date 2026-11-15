// GET /api/sensor-latest
// Fetches the latest ThingSpeak reading and computes stale/online status.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchLatestFeed } from './_shared/thingspeakClient.js';

const STALE_THRESHOLD = parseInt(process.env.STALE_THRESHOLD_SECONDS || '120', 10);
const OFFLINE_THRESHOLD = parseInt(process.env.OFFLINE_THRESHOLD_SECONDS || '300', 10);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const reading = await fetchLatestFeed();

    if (!reading) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No sensor readings available',
        connection_status: 'offline',
      });
    }

    const readingTime = new Date(reading.timestamp).getTime();
    const now = Date.now();
    const secondsSinceUpdate = Math.floor((now - readingTime) / 1000);

    let connectionStatus: 'online' | 'stale' | 'offline';
    if (secondsSinceUpdate > OFFLINE_THRESHOLD) {
      connectionStatus = 'offline';
    } else if (secondsSinceUpdate > STALE_THRESHOLD) {
      connectionStatus = 'stale';
    } else {
      connectionStatus = 'online';
    }

    return res.status(200).json({
      success: true,
      data: {
        entry_id: reading.entry_id,
        timestamp: reading.timestamp,
        raw_adc: reading.raw_adc,
        moisture_pct: reading.moisture_pct,
        sensor_status: reading.sensor_status,
        plant_id: reading.plant_id,
        connection_status: connectionStatus,
        is_stale: connectionStatus !== 'online',
        seconds_since_update: secondsSinceUpdate,
        stale_threshold_seconds: STALE_THRESHOLD,
      },
    });
  } catch (error) {
    console.error('sensor-latest error:', error);
    return res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sensor data',
      connection_status: 'offline',
    });
  }
}
