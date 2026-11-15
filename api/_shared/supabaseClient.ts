// Supabase server-side client for Vercel Serverless Functions

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get a Supabase client configured for server-side use.
 * Uses the service role key for full database access from backend functions.
 * Falls back to the publishable key if service role is not set.
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const key = serviceRoleKey || publishableKey;

  if (!supabaseUrl || !key) {
    throw new Error(
      'Supabase configuration missing: set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)'
    );
  }

  supabaseInstance = createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseInstance;
}
