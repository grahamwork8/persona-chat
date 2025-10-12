import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Returns a Supabase client with optional JWT auth.
 * Use this in API routes or server components where you have a Clerk token.
 */
export function getSupabaseClient(token?: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  });
}

/**
 * Singleton client for public access (no auth).
 * Use this in static pages, RSCs, or when auth isn't required.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


