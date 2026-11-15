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
 * Defaults to gemini-2.5-flash if not set.
 */
export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.8-flash';
}
