/**
 * Supabase 클라이언트 — 싱글턴 인스턴스
 * Parity: APP-001
 */
import { createClient } from '@supabase/supabase-js';

// TODO: 사업자등록 후 실제 Supabase 프로젝트 URL/key로 교체
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
