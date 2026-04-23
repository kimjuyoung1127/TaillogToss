/**
 * 인증 API — Toss Login → Edge Function → Supabase Auth
 * Parity: AUTH-001
 */
import { supabase } from './supabase';
import { isSupabaseConfigured } from './supabase';
import type { TossLoginResponse } from 'types/auth';

type TossLoginReferrer = 'DEFAULT' | 'SANDBOX' | string;
type EdgeEnvelope<T> = {
  ok?: boolean;
  status?: number;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
};

function createClientNonce(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeReferrer(referrer?: TossLoginReferrer): 'DEFAULT' | 'SANDBOX' {
  const raw = referrer?.trim();
  if (!raw) return 'DEFAULT';
  if (raw.toUpperCase() === 'SANDBOX') return 'SANDBOX';
  return 'DEFAULT';
}

/** Toss 로그인 (Edge Function 호출) */
export async function loginWithToss(
  authCode: string,
  referrer?: TossLoginReferrer
): Promise<TossLoginResponse> {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_ENV_MISSING');
  }

  const { data, error } = await supabase.functions.invoke('login-with-toss', {
    body: {
      authorizationCode: authCode,
      referrer: normalizeReferrer(referrer),
      nonce: createClientNonce(),
    },
  });
  if (error) throw error;

  const envelope = data as EdgeEnvelope<TossLoginResponse> | null;
  if (envelope && typeof envelope === 'object' && ('ok' in envelope || 'data' in envelope)) {
    if (envelope.ok === false || !envelope.data) {
      const code = envelope.error?.code ?? 'EDGE_RESPONSE_ERROR';
      const message = envelope.error?.message ?? 'Invalid edge response';
      throw new Error(`${code}: ${message}`);
    }
    return envelope.data;
  }

  return data as TossLoginResponse;
}

function isJwtLike(token: string): boolean {
  return token.split('.').length === 3;
}

/**
 * Edge 브릿지 응답 토큰으로 Supabase 세션을 설정한다.
 * 현재 mock 토큰 형식(sb_access_...)이면 세션 설정을 건너뛴다.
 */
export async function setSessionFromBridgeResponse(payload: TossLoginResponse): Promise<boolean> {
  if (!payload?.access_token || !payload?.refresh_token) {
    throw new Error('INVALID_BRIDGE_TOKENS');
  }

  // Supabase refresh token은 JWT가 아닐 수 있으므로 access token만 판별한다.
  if (!isJwtLike(payload.access_token)) {
    return false;
  }

  const { error } = await supabase.auth.setSession({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
  });
  if (error) throw error;

  const { data: userData, error: userError } = await supabase.auth.getUser(payload.access_token);
  if (userError || !userData.user) {
    await supabase.auth.signOut();
    return false;
  }
  return true;
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * 회원탈퇴 — withdraw-user Edge Function 호출.
 * public.users CASCADE 삭제 → auth.users 삭제 (서버에서 service_role로 처리).
 * Toss 연동해제는 toss-disconnect 콜백에서 Toss가 별도 호출.
 */
export async function withdrawUser(userId: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) throw new Error('NO_SESSION');

  const { error: invokeError, data } = await supabase.functions.invoke('withdraw-user', {
    body: { userId },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (invokeError) throw invokeError;
  if (!(data as { ok?: boolean })?.ok) {
    throw new Error((data as { error?: { code?: string } })?.error?.code ?? 'WITHDRAW_FAILED');
  }

  await logout();
}

/** 현재 세션 확인 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * B2B 역할 자동 부여 — 셀프 가입 플로우.
 * assign-b2b-role Edge Function 호출 후 세션 갱신.
 * 갱신된 세션의 user_metadata.role에 새 역할이 반영됨.
 */
export async function assignB2BRole(role: 'org_owner' | 'trainer' = 'org_owner'): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) throw new Error('NO_SESSION');

  const { error, data } = await supabase.functions.invoke('assign-b2b-role', {
    body: { role },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw error;
  if (!(data as { ok?: boolean })?.ok) {
    throw new Error((data as { error?: { code?: string } })?.error?.code ?? 'ASSIGN_ROLE_FAILED');
  }

  // 세션 갱신 → user_metadata.role이 새 역할로 업데이트됨
  await supabase.auth.refreshSession();
}
