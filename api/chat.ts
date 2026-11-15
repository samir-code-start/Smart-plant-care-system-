// POST /api/chat
// Plant-contextual AI chat assistant using Gemini.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateContentWithFallback } from './_shared/geminiClient.js';
import { VALID_PLANT_IDS, VALID_GROWTH_STAGES } from './_shared/types.js';

const PLANT_NAMES: Record<string, string> = {
  'tomato': 'Tomato', 'basil': 'Basil', 'aloe-vera': 'Aloe Vera',
  'money-plant': 'Money Plant', 'mint': 'Mint', 'rose': 'Rose', 'cucumber': 'Cucumber',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { plant_id, growth_stage, message, conversation_history } = req.body || {};

    // --- Validation ---
    if (!plant_id || !VALID_PLANT_IDS.includes(plant_id)) {
      return res.status(400).json({ success: false, error: 'Invalid plant_id' });
    }

    if (!growth_stage || !VALID_GROWTH_STAGES.includes(growth_stage)) {
      return res.status(400).json({ success: false, error: 'Invalid growth_stage' });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({ success: false, error: 'Message too long (max 2000 characters)' });
    }

    const plantName = PLANT_NAMES[plant_id] || plant_id;

    // --- Build conversation with system context ---
    const systemInstruction = `You are a friendly, knowledgeable horticulturist assistant helping a gardener care for their ${plantName} plant, currently in the ${growth_stage} growth stage.

Rules:
- Keep answers clear, practical, concise, and focused on botanical health and plant care.
- Only answer questions related to plants and gardening.
- If asked about something unrelated, politely redirect the conversation back to plant care.
- Do not provide medical, legal, or financial advice.`;

    // Build contents from conversation history
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (conversation_history && Array.isArray(conversation_history)) {
      // Limit history to last 10 exchanges to keep context manageable
      const recentHistory = conversation_history.slice(-20);
      for (const msg of recentHistory) {
        if (msg.role && msg.text) {
          contents.push({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }],
          });
        }
      }
    }

    // Add the current message if not already the last entry
    const lastEntry = contents[contents.length - 1];
    if (!lastEntry || lastEntry.role !== 'user' || lastEntry.parts[0]?.text !== message.trim()) {
      contents.push({
        role: 'user',
        parts: [{ text: message.trim() }],
      });
    }

    // --- Call Gemini with automatic model fallback ---
    const reply = await generateContentWithFallback(contents, {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    if (!reply) {
      return res.status(502).json({
        success: false,
        error: 'AI returned an empty response',
      });
    }

    return res.status(200).json({
      success: true,
      data: { reply: reply.trim() },
    });
  } catch (error) {
    console.error('chat error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Chat failed';
    const status = errorMessage.includes('429') || errorMessage.includes('quota') ? 429 : 500;

    return res.status(status).json({
      success: false,
      error: status === 429
        ? 'Chat rate limit reached. Please wait a moment and try again.'
        : errorMessage,
    });
  }
}
