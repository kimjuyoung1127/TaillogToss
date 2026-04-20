/**
 * withdraw-user — 회원탈퇴: public.users CASCADE 삭제 → auth.users 삭제.
 * verify_jwt=false (ES256 호환). JWT는 내부에서 Admin API로 직접 검증.
 * 본인만 탈퇴 가능 (JWT sub === body.userId, Supabase Auth 검증).
 * Parity: AUTH-001
 */

import { fail, ok, type EdgeResult } from '../_shared/contracts.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface WithdrawDeps {
  getEnv: (key: string) => string | undefined;
  fetchFn: typeof fetch;
}

function defaultDeps(): WithdrawDeps {
  return {
    getEnv: (key) => (typeof Deno !== 'undefined' ? Deno.env.get(key) : undefined),
    fetchFn: fetch,
  };
}

/** JWT payload에서 sub(userId) 추출 — 서명 없이 디코드만 */
export function extractSubFromJwt(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

/**
 * Supabase Admin API로 JWT의 실제 소유자를 검증한다.
 * ES256 알고리즘 토큰도 서버사이드에서 정상 처리됨.
 */
async function verifyJwtOwner(
  authHeader: string | null,
  supabaseUrl: string,
  serviceRoleKey: string,
  fetchFn: typeof fetch,
): Promise<{ userId: string } | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const jwt = authHeader.slice(7);

  // Admin API: GET /auth/v1/user — 토큰으로 유저 정보 조회 (서명 검증 포함)
  const res = await fetchFn(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (!res.ok) return null;

  const data = await res.json() as { id?: string };
  return data?.id ? { userId: data.id } : null;
}

export async function handleWithdraw(
  authHeader: string | null,
  body: unknown,
  deps: WithdrawDeps,
): Promise<EdgeResult<{ withdrawn: boolean }>> {
  const supabaseUrl = deps.getEnv('SUPABASE_URL');
  const serviceRoleKey = deps.getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return fail('CONFIG_MISSING', 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing', 500);
  }

  // JWT 검증 — Admin API 경유 (ES256 지원)
  const verified = await verifyJwtOwner(authHeader, supabaseUrl, serviceRoleKey, deps.fetchFn);
  if (!verified) {
    return fail('UNAUTHORIZED', 'Valid JWT required', 401);
  }

  const parsed = body as { userId?: unknown };
  const userId = parsed?.userId;
  if (!userId || typeof userId !== 'string') {
    return fail('INVALID_PARAMS', 'userId is required', 400);
  }

  if (verified.userId !== userId) {
    return fail('FORBIDDEN', 'Cannot withdraw another user', 403);
  }

  const adminHeaders = {
    'Content-Type': 'application/json',
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };

  // Step 1: public.users DELETE (CASCADE)
  const deletePublicRes = await deps.fetchFn(
    `${supabaseUrl}/rest/v1/users?id=eq.${userId}`,
    { method: 'DELETE', headers: { ...adminHeaders, Prefer: 'return=minimal' } },
  );
  if (!deletePublicRes.ok && deletePublicRes.status !== 404) {
    const errText = await deletePublicRes.text().catch(() => '');
    return fail('DB_DELETE_FAILED', `public.users 삭제 실패: ${errText}`, 500);
  }

  // Step 2: auth.users DELETE (Admin API)
  const deleteAuthRes = await deps.fetchFn(
    `${supabaseUrl}/auth/v1/admin/users/${userId}`,
    { method: 'DELETE', headers: adminHeaders },
  );
  if (!deleteAuthRes.ok && deleteAuthRes.status !== 404) {
    const errText = await deleteAuthRes.text().catch(() => '');
    return fail('AUTH_DELETE_FAILED', `auth.users 삭제 실패: ${errText}`, 500);
  }

  return ok({ withdrawn: true });
}

function jsonResponse(result: EdgeResult<unknown>, status?: number): Response {
  return new Response(JSON.stringify(result), {
    status: status ?? result.status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

if (typeof Deno !== 'undefined') {
  Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (req.method !== 'POST') {
      return jsonResponse(fail('METHOD_NOT_ALLOWED', 'POST only', 405), 405);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(fail('INVALID_PARAMS', 'JSON body required', 400), 400);
    }

    const result = await handleWithdraw(
      req.headers.get('Authorization'),
      body,
      defaultDeps(),
    );
    return jsonResponse(result);
  });
}
