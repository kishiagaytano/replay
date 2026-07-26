import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is configured entirely through public env vars (safe to ship to the
 * browser — the anon key is designed for client use, protected by Row Level
 * Security). When they're absent, the app transparently falls back to
 * localStorage, so nothing breaks in local dev.
 *
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseEnabled = url.length > 0 && anonKey.length > 0;

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url, anonKey, {
      auth: { persistSession: false },
    })
  : null;
