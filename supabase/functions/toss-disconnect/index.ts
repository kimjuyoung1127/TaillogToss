/**
 * toss-disconnect — 토스 연결 끊기 콜백 Edge Function.
 * 토스 앱 설정에서 사용자가 연결 해제 시 토스 서버가 호출.
 * Basic Auth 인증, verify_jwt=false.
 * Parity: AUTH-001
 */

import { fail, ok } from '../_shared/contracts.ts';
import { safeLogPayload } from '../_shared/piiGuard.ts';

type DisconnectReferrer = 'UNLINK' | 'WITHDRAWAL_TERMS' | 'WITHDRAWAL_TOSS';

interface DisconnectRequest {
  userKey: number;
  referrer: DisconnectReferrer;
}

const VALID_REFERRERS: DisconnectReferrer[] = ['UNLINK', 'WITHDRAWAL_TERMS', 'WITHDRAWAL_TOSS'];

/** 허용 CORS origin: 콘솔 테스트 + Sandbox */
const ALLOWED_ORIGINS = [
  'https://apps-in-toss.toss.im',
  'https://taillog-toss.private-apps.tossmini.com',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function verifyBasicAuth(authHeader: string | null): boolean {
  if (!authHeader?.startsWith('Basic ')) return false;

  const expectedId = Deno.env.get('TOSS_CALLBACK_AUTH_ID');
  const expectedPw = Deno.env.get('TOSS_CALLBACK_AUTH_PW');
  if (!expectedId || !expectedPw) return false;

  try {
    const decoded = atob(authHeader.slice(6));
    const [id, pw] = decoded.split(':');
    return id === expectedId && pw === expectedPw;
  } catch {
    return false;
  }
}

function hashUserKey(userKey: number): string {
  const str = String(userKey);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `uk_${Math.abs(hash).toString(36)}`;
}

async function handleUnlink(userKey: number): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // toss_user_key → NULL (재연결 가능, 30일 유예 후 데이터 삭제)
  const res = await fetch(`${supabaseUrl}/rest/v1/users?toss_user_key=eq.${encodeURIComponent(String(userKey))}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      toss_user_key: null,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`UNLINK PATCH failed: ${res.status}`);
}

async function handleWithdrawalTerms(userKey: number): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // PII 삭제 + 익명화 (user_xxxxx)
  const anonymId = `user_${String(userKey).slice(-5).padStart(5, '0')}`;

  const res = await fetch(`${supabaseUrl}/rest/v1/users?toss_user_key=eq.${encodeURIComponent(String(userKey))}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      toss_user_key: anonymId,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`WITHDRAWAL_TERMS PATCH failed: ${res.status}`);
}

async function handleWithdrawalToss(userKey: number): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // 사용자 조회
  const userRes = await fetch(
    `${supabaseUrl}/rest/v1/users?toss_user_key=eq.${encodeURIComponent(String(userKey))}&select=id`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    }
  );
  if (!userRes.ok) throw new Error(`WITHDRAWAL_TOSS lookup failed: ${userRes.status}`);
  const users = await userRes.json();

  if (users.length > 0) {
    const userId = users[0].id;

    // Supabase Auth 사용자 삭제 → CASCADE로 관련 데이터 삭제
    // 결제 이력은 ON DELETE SET NULL 또는 별도 보존 테이블로 5년 보존
    const delRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    });
    if (!delRes.ok) throw new Error(`WITHDRAWAL_TOSS delete failed: ${delRes.status}`);
  }
}

async function logDisconnect(
  userKeyHash: string,
  referrer: DisconnectReferrer,
  success: boolean
): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/noti_history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        type: 'toss_disconnect',
        payload: safeLogPayload({
          user_key_hash: userKeyHash,
          referrer,
          success,
          processed_at: new Date().toISOString(),
        }),
      }),
    });
  } catch {
    // 로그 실패는 무시 (메인 처리에 영향 없음)
  }
}

async function checkAlreadyProcessed(
  userKeyHash: string,
  referrer: DisconnectReferrer,
): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return false;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/noti_history?type=eq.toss_disconnect&select=payload&limit=1&order=created_at.desc&payload->>user_key_hash=eq.${encodeURIComponent(userKeyHash)}&payload->>referrer=eq.${encodeURIComponent(referrer)}&payload->>success=eq.true`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      },
    );
    if (!res.ok) return false;
    const rows = await res.json();
    return rows.length > 0;
  } catch {
    return false; // 조회 실패 시 처리 진행 (fail-open)
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // CORS preflight (콘솔 테스트 + Sandbox 버튼용)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const headers = { 'Content-Type': 'application/json', ...corsHeaders };

  // Basic Auth 검증
  const authHeader = req.headers.get('Authorization');
  if (!verifyBasicAuth(authHeader)) {
    return new Response(
      JSON.stringify(fail('UNAUTHORIZED', 'Invalid credentials', 401)),
      { status: 401, headers }
    );
  }

  try {
    let body: DisconnectRequest;

    if (req.method === 'GET') {
      // GET 방식: query param으로 전달
      const url = new URL(req.url);
      body = {
        userKey: Number(url.searchParams.get('userKey') || 0),
        referrer: (url.searchParams.get('referrer') || '') as DisconnectReferrer,
      };
    } else if (req.method === 'POST') {
      body = await req.json();
    } else {
      return new Response(
        JSON.stringify(fail('METHOD_NOT_ALLOWED', 'Use GET or POST', 405)),
        { status: 405, headers }
      );
    }

    const { userKey, referrer } = body;

    if (!userKey || isNaN(userKey) || userKey <= 0 || !VALID_REFERRERS.includes(referrer)) {
      return new Response(
        JSON.stringify(fail('INVALID_PARAMS', 'userKey and valid referrer required')),
        { status: 400, headers }
      );
    }

    const userKeyHash = hashUserKey(userKey);

    // 멱등성: 동일 요청 이미 처리됐으면 즉시 200 반환 (토스 서버 재시도 대응)
    const alreadyProcessed = await checkAlreadyProcessed(userKeyHash, referrer);
    if (alreadyProcessed) {
      return new Response(
        JSON.stringify(ok({ processed: true, referrer, deduplicated: true })),
        { status: 200, headers }
      );
    }

    // referrer별 처리
    switch (referrer) {
      case 'UNLINK':
        await handleUnlink(userKey);
        break;
      case 'WITHDRAWAL_TERMS':
        await handleWithdrawalTerms(userKey);
        break;
      case 'WITHDRAWAL_TOSS':
        await handleWithdrawalToss(userKey);
        break;
    }

    // 처리 로그 기록
    await logDisconnect(userKeyHash, referrer, true);

    return new Response(
      JSON.stringify(ok({ processed: true, referrer })),
      { status: 200, headers }
    );
  } catch (err) {
    const userKeyHash = 'unknown';
    await logDisconnect(userKeyHash, 'UNLINK', false);

    return new Response(
      JSON.stringify(fail('INTERNAL', String(err), 500)),
      { status: 500, headers }
    );
  }
});
