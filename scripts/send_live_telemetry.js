#!/usr/bin/env node

/**
 * =============================================================================
 * Smart Plant Care System — Live ThingSpeak Telemetry Feeder / Simulator
 * =============================================================================
 * This script sends live sensor telemetry to your ThingSpeak channel.
 * Useful for testing the dashboard, verifying live graphs, and testing alerts
 * without needing the physical ESP8266 powered on.
 *
 * Usage:
 *   node scripts/send_live_telemetry.js <YOUR_THINGSPEAK_WRITE_API_KEY> [interval_seconds]
 *
 * Example:
 *   node scripts/send_live_telemetry.js ABC123WRITEKEY 20
 * =============================================================================
 */

import https from 'https';

const writeKey = process.argv[2] || process.env.THINGSPEAK_WRITE_API_KEY;
const intervalSec = parseInt(process.argv[3] || '20', 10);

if (!writeKey) {
  console.error('\n❌ Error: ThingSpeak Write API Key is required!');
  console.log('\nUsage:');
  console.log('  node scripts/send_live_telemetry.js <YOUR_WRITE_API_KEY> [interval_seconds]\n');
  console.log('Example:');
  console.log('  node scripts/send_live_telemetry.js 9XQ1EXAMPLEKEY 20\n');
  console.log('To get your Write API Key:');
  console.log('  1. Go to https://thingspeak.mathworks.com/channels/3579888');
  console.log('  2. Click "API Keys" tab');
  console.log('  3. Copy your "Write API Key"\n');
  process.exit(1);
}

console.log('=================================================================');
console.log(' 🌱 Smart Plant Care System — Live ThingSpeak Feeder Active');
console.log('=================================================================');
console.log(`Channel Target:   ThingSpeak Update Endpoint`);
console.log(`Update Interval:  ${intervalSec} seconds (min 15s for free tier)`);
console.log(`Write Key:        ${writeKey.substring(0, 4)}...${writeKey.substring(writeKey.length - 4)}`);
console.log('Press Ctrl+C to stop.\n');

// Initial simulated plant moisture state (starts optimal for Tomato)
let moisturePct = 68.5;
const plantId = 1; // 1 = Tomato
let count = 0;

async function sendReading() {
  count++;
  // Slightly drift moisture to simulate natural soil drying or minor fluctuations
  const drift = (Math.random() - 0.48) * 1.2;
  moisturePct = Math.max(15, Math.min(85, Math.round((moisturePct + drift) * 10) / 10));

  // Map 0-100% back to typical ADC values (820 air -> 380 water)
  const rawADC = Math.round(820 - (moisturePct / 100) * (820 - 380));
  const status = 1; // 1 = normal

  const url = `https://api.thingspeak.com/update?api_key=${writeKey}&field1=${rawADC}&field2=${moisturePct}&field3=${plantId}&field4=${status}`;

  const timestamp = new Date().toLocaleTimeString();

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const entryId = parseInt(data.trim(), 10);
        if (res.statusCode === 200 && entryId > 0) {
          console.log(`[${timestamp}] #️⃣ ${count} -> SUCCESS! Feed Entry #${entryId} | Moisture: ${moisturePct}% | ADC: ${rawADC} | Plant ID: ${plantId}`);
        } else if (data.trim() === '0') {
          console.warn(`[${timestamp}] ⚠️ Update throttled (0). ThingSpeak free tier requires >=15s between posts.`);
        } else {
          console.error(`[${timestamp}] ❌ ThingSpeak rejected update. Code: ${res.statusCode}, Body: ${data}`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.error(`[${timestamp}] ❌ Network error:`, err.message);
      resolve();
    });
  });
}

// Send first reading immediately, then on interval
sendReading();
setInterval(sendReading, intervalSec * 1000);
