// ThingSpeak HTTP client — fetches sensor data from ThingSpeak REST API

import type { ThingSpeakChannelResponse, ThingSpeakFeed } from './types';

const THINGSPEAK_BASE_URL = 'https://api.thingspeak.com';

export interface ParsedSensorReading {
  entry_id: number;
  timestamp: string;
  raw_adc: number;
  moisture_pct: number;
  plant_id: string | null;
  sensor_status: string;
}

/**
 * Fetch the latest single feed entry from the ThingSpeak channel.
 */
export async function fetchLatestFeed(): Promise<ParsedSensorReading | null> {
  const channelId = process.env.THINGSPEAK_CHANNEL_ID;
  const readKey = process.env.THINGSPEAK_READ_API_KEY;

  if (!channelId || !readKey) {
    throw new Error('ThingSpeak configuration missing: THINGSPEAK_CHANNEL_ID or THINGSPEAK_READ_API_KEY');
  }

  const url = `${THINGSPEAK_BASE_URL}/channels/${channelId}/feeds.json?api_key=${readKey}&results=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ThingSpeak API error: ${response.status} ${response.statusText}`);
  }

  const data: ThingSpeakChannelResponse = await response.json();

  if (!data.feeds || data.feeds.length === 0) {
    return null;
  }

  return parseFeed(data.feeds[0]);
}

/**
 * Fetch recent feed entries from the ThingSpeak channel for historical charting.
 */
export async function fetchRecentFeeds(results: number = 30): Promise<{
  channel_id: string;
  readings: ParsedSensorReading[];
}> {
  const channelId = process.env.THINGSPEAK_CHANNEL_ID;
  const readKey = process.env.THINGSPEAK_READ_API_KEY;

  if (!channelId || !readKey) {
    throw new Error('ThingSpeak configuration missing: THINGSPEAK_CHANNEL_ID or THINGSPEAK_READ_API_KEY');
  }

  const clamped = Math.min(Math.max(results, 1), 100);
  const url = `${THINGSPEAK_BASE_URL}/channels/${channelId}/feeds.json?api_key=${readKey}&results=${clamped}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ThingSpeak API error: ${response.status} ${response.statusText}`);
  }

  const data: ThingSpeakChannelResponse = await response.json();

  const readings = (data.feeds || [])
    .map(parseFeed)
    .filter((r): r is ParsedSensorReading => r !== null);

  return { channel_id: channelId, readings };
}

/**
 * Parse a raw ThingSpeak feed entry into a structured reading.
 */
function parseFeed(feed: ThingSpeakFeed): ParsedSensorReading | null {
  if (!feed.field1 && !feed.field2) {
    return null; // Skip entries with no sensor data
  }

  const rawAdc = feed.field1 ? parseInt(feed.field1, 10) : 0;
  const moisturePct = feed.field2 ? parseFloat(feed.field2) : 0;

  // Validate parsed numbers
  if (isNaN(rawAdc) || isNaN(moisturePct)) {
    return null;
  }

  return {
    entry_id: feed.entry_id,
    timestamp: feed.created_at,
    raw_adc: rawAdc,
    moisture_pct: Math.round(moisturePct * 10) / 10, // 1 decimal place
    plant_id: feed.field3 || null,
    sensor_status: feed.field4 === '2' ? 'out_of_range' : feed.field4 === '0' ? 'boot' : 'ok',
  };
}
