// Google Gemini AI client for Vercel Serverless Functions

import { GoogleGenAI } from '@google/genai';

let genaiInstance: GoogleGenAI | null = null;

/**
 * Get an initialized GoogleGenAI client.
 * The API key is read from GEMINI_API_KEY environment variable (server-side only).
 */
export function getGeminiClient(): GoogleGenAI {
  if (genaiInstance) {
    return genaiInstance;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not configured: set GEMINI_API_KEY environment variable');
  }

  genaiInstance = new GoogleGenAI({ apiKey });
  return genaiInstance;
}

/**
 * Get the configured Gemini model name.
 * Defaults to gemini-3.5-flash if not set.
 */
export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.5-flash';
}

/**
 * Generate content with automatic model fallback and timeout protection.
 * Prevents Vercel serverless function timeouts when a specific model encounters
 * temporary rate limits (429), high-load spikes (503), or model retirement (404).
 */
export async function generateContentWithFallback(
  contents: any,
  config: any,
  timeoutMs = 15000
): Promise<string> {
  const genai = getGeminiClient();
  const configuredModel = getGeminiModel();

  // Deduplicated candidate models in order of priority
  const candidateModels = Array.from(
    new Set([configuredModel, 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.6-flash'])
  );

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await Promise.race([
        genai.models.generateContent({
          model,
          contents,
          config,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Model ${model} timed out after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);

      const text = response.text || '';
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All candidate Gemini models failed to return a response');
}
