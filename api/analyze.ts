// POST /api/analyze
// Triggers on-demand Gemini AI analysis of plant health.
// Only runs when user explicitly clicks the Analyse button.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiClient, getGeminiModel } from './_shared/geminiClient.js';
import { VALID_PLANT_IDS, VALID_GROWTH_STAGES } from './_shared/types.js';

// Plant data for context (mirrors predefinedPlants.ts)
const PLANT_DATA: Record<string, { name: string; botanical: string; min: number; max: number; watering: string }> = {
  'tomato': { name: 'Tomato', botanical: 'Solanum lycopersicum', min: 60, max: 80, watering: 'Deep, consistent watering; keep moist during flowering/fruit set.' },
  'basil': { name: 'Basil', botanical: 'Ocimum basilicum', min: 50, max: 70, watering: 'Moist, well-drained soil; water when top inch feels dry.' },
  'aloe-vera': { name: 'Aloe Vera', botanical: 'Aloe barbadensis miller', min: 15, max: 30, watering: 'Infrequent soak-and-dry cycle; avoid wet feet.' },
  'money-plant': { name: 'Money Plant', botanical: 'Epipremnum aureum', min: 40, max: 60, watering: 'Allow top 25-30% to dry between waterings.' },
  'mint': { name: 'Mint', botanical: 'Mentha spicata', min: 60, max: 80, watering: 'Consistently moist soil; fast-growing and thirsty.' },
  'rose': { name: 'Rose', botanical: 'Rosa spp.', min: 50, max: 70, watering: 'Deep root hydration; avoid wetting foliage.' },
  'cucumber': { name: 'Cucumber', botanical: 'Cucumis sativus', min: 60, max: 80, watering: 'High moisture demand; steady hydration prevents bitter fruit.' },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { plant_id, growth_stage, active_telemetry, recent_history_summary } = req.body || {};

    // --- Validation ---
    if (!plant_id || !VALID_PLANT_IDS.includes(plant_id)) {
      return res.status(400).json({ success: false, error: 'Invalid plant_id' });
    }

    if (!growth_stage || !VALID_GROWTH_STAGES.includes(growth_stage)) {
      return res.status(400).json({ success: false, error: 'Invalid growth_stage' });
    }

    const plant = PLANT_DATA[plant_id];
    if (!plant) {
      return res.status(400).json({ success: false, error: 'Plant data not found' });
    }

    // --- Build Gemini Prompt ---
    const systemInstruction = `You are an expert botanical scientist and precision agriculture AI assistant.
Your task is to analyze soil moisture telemetry and recent historical trends for a specific plant and growth stage.

Strict Rules:
1. Base your moisture evaluation ONLY on the provided predefined moisture thresholds for this plant. Do NOT invent new moisture thresholds.
2. Clearly identify whether the evaluated data came from a physical sensor (exact percentage) or manual observation (Dry/Damp/Wet).
3. If the telemetry is marked as stale or missing, clearly state that in your analysis and do not make false definitive claims.
4. Output your response strictly as valid JSON matching the schema provided.`;

    let telemetryDescription = 'No telemetry data is currently available.';
    if (active_telemetry) {
      if (active_telemetry.source === 'sensor') {
        telemetryDescription = `Physical sensor reading: ${active_telemetry.moisture_pct}% moisture (raw ADC: ${active_telemetry.raw_adc}), recorded at ${active_telemetry.timestamp}. Stale: ${active_telemetry.is_stale ? 'Yes' : 'No'}.`;
      } else {
        telemetryDescription = `Manual observation: "${active_telemetry.moisture_status}", recorded at ${active_telemetry.timestamp}.`;
      }
    }

    let historyDescription = 'No recent history available.';
    if (recent_history_summary && recent_history_summary.length > 0) {
      const historyLines = recent_history_summary.map((h: { timestamp: string; source: string; moisture_pct?: number; moisture_status?: string }) => {
        if (h.source === 'sensor') {
          return `  - ${h.timestamp}: Sensor reading ${h.moisture_pct}%`;
        }
        return `  - ${h.timestamp}: Manual observation "${h.moisture_status}"`;
      });
      historyDescription = `Recent moisture history:\n${historyLines.join('\n')}`;
    }

    const userPrompt = `Analyze the following plant's current condition:

Plant: ${plant.name} (${plant.botanical})
Growth Stage: ${growth_stage}
Recommended Moisture Range: ${plant.min}% - ${plant.max}%
Watering Guidance: ${plant.watering}

Current Telemetry:
${telemetryDescription}

${historyDescription}

Respond with a JSON object containing these fields:
- plant_name (string)
- growth_stage (string)
- evaluation_timestamp (string, current ISO timestamp)
- data_source_evaluated (string: "sensor", "manual", or "none")
- moisture_status_assessment (string: e.g. "Optimal", "Under-watered", "Over-watered", "No data")
- current_condition_summary (string: 2-3 sentence summary)
- trend_interpretation (string: interpretation of recent history trends)
- care_recommendations (array of strings: 2-4 actionable recommendations)
- warnings (array of strings: any critical warnings, can be empty)`;

    // --- Call Gemini ---
    const genai = getGeminiClient();
    const model = getGeminiModel();

    let responseText = '';
    try {
      const interaction = await genai.interactions.create({
        model,
        input: userPrompt,
        system_instruction: systemInstruction,
      });
      responseText = interaction.output_text || '';
    } catch {
      const response = await genai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });
      responseText = response.text || '';
    }

    if (!responseText) {
      return res.status(502).json({
        success: false,
        error: 'Gemini returned an empty response',
      });
    }

    // Clean markdown code blocks if present
    let cleanedJson = responseText.trim();
    if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(cleanedJson);
    } catch {
      console.error('Failed to parse Gemini response:', responseText);
      return res.status(502).json({
        success: false,
        error: 'Gemini returned invalid JSON',
      });
    }

    return res.status(200).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    console.error('analyze error:', error);

    // Handle Gemini rate limits specifically
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    const status = errorMessage.includes('429') || errorMessage.includes('quota') ? 429 : 500;

    return res.status(status).json({
      success: false,
      error: status === 429
        ? 'AI analysis rate limit reached. Please wait a moment and try again.'
        : errorMessage,
    });
  }
}
