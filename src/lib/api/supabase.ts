/**
 * Supabase 클라이언트 — 싱글턴 인스턴스
 * Parity: APP-001
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  '';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  '';

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
}

export function getSupabasePublicConfig(): { url: string; anonKey: string } {
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  };
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const msg = '[APP-001] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY 환경변수를 설정해주세요.';
  if (__DEV__) {
    console.error(msg);
  } else {
    throw new Error(msg);
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
