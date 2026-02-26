/**
 * 인증 API — Toss Login → Edge Function → Supabase Auth
 * Parity: AUTH-001
 */
import { supabase } from './supabase';
import type { TossLoginResponse } from 'types/auth';

function createClientNonce(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Toss 로그인 (Edge Function 호출) */
export async function loginWithToss(authCode: string): Promise<TossLoginResponse> {
  const { data, error } = await supabase.functions.invoke('login-with-toss', {
    body: { authorizationCode: authCode, nonce: createClientNonce() },
  });
  if (error) throw error;
  return data as TossLoginResponse;
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** 현재 세션 확인 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
