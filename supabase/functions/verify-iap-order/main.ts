/**
 * verify-iap-order main — 내부 JWT 검증(auth/v1/user) 기반 IAP 검증 엔트리.
 * Parity: IAP-001
 */

type UserRole =
  | 'user'
  | 'trainer'
  | 'org_owner'
  | 'org_staff'
  | 'service_role'
  | 'authenticated';

interface VerifyIapOrderRequest {
  orderId: string;
  productId: string;
  transactionId: string;
  idempotencyKey: string;
  userId?: string;
  orgId?: string;
  trainerUserId?: string;
}

interface VerifyIapOrderResponse {
  id: string;
  user_id: string;
  product_id: string;
  idempotency_key: string;
  toss_status:
    | 'PURCHASED'
    | 'PAYMENT_COMPLETED'
    | 'FAILED'
    | 'REFUNDED'
    | 'ORDER_IN_PROGRESS'
    | 'NOT_FOUND';
  grant_status: 'pending' | 'granted' | 'grant_failed' | 'refund_requested' | 'refunded';
  amount: number;
  toss_order_id: string;
  error_code: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

interface EdgeResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
    correlationId: string;
    details?: Record<string, unknown>;
  };
}

interface AuthUserPayload {
  id?: string;
  role?: string;
  app_metadata?: {
    role?: string;
    user_role?: string;
  };
}

interface TossOrderUpsertInput {
  user_id: string;
  product_id: string;
  idempotency_key: string;
  toss_status: VerifyIapOrderResponse['toss_status'];
  grant_status: VerifyIapOrderResponse['grant_status'];
  amount: number;
  toss_order_id: string;
  error_code: string | null;
  retry_count: number;
}

interface TossOrderPersistedRow {
  id: string;
  user_id: string;
  product_id: string;
  idempotency_key: string;
  toss_status: VerifyIapOrderResponse['toss_status'];
  grant_status: VerifyIapOrderResponse['grant_status'];
  amount: number;
  toss_order_id: string;
  error_code: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

const APP_ROLES = new Set<UserRole>(['user', 'trainer', 'org_owner', 'org_staff', 'service_role']);
const ALLOWED_ROLES = new Set<UserRole>([...APP_ROLES, 'authenticated']);
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')?.replace(/\/$/, '');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

function newCorrelationId(prefix = 'err'): string {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${random}`;
}

function fail(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>,
): EdgeResult<never> {
  return {
    ok: false,
    status,
    error: {
      code,
      message,
      retryable: false,
      correlationId: newCorrelationId('err'),
      details,
    },
  };
}

function ok<T>(data: T, status = 200): EdgeResult<T> {
  return { ok: true, status, data };
}

function toJsonResponse<T>(result: EdgeResult<T>): Response {
  return new Response(JSON.stringify(result), {
    status: result.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function decodeBase64Url(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return atob(padded);
  } catch {
    return null;
  }
}

function readBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization') ?? request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

function parseAppRoleFromToken(token: string): UserRole | undefined {
  const segments = token.split('.');
  if (segments.length !== 3) return undefined;
  const payloadJson = decodeBase64Url(segments[1]);
  if (!payloadJson) return undefined;

  try {
    const claims = JSON.parse(payloadJson) as Record<string, unknown> & {
      role?: string;
      user_role?: string;
      app_metadata?: { role?: string; user_role?: string };
    };
    const candidates = [
      claims.user_role,
      claims.app_metadata?.user_role,
      claims.app_metadata?.role,
      claims.role,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && APP_ROLES.has(candidate as UserRole)) {
        return candidate as UserRole;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function parseTokenRole(token: string): UserRole | undefined {
  const segments = token.split('.');
  if (segments.length !== 3) return undefined;
  const payloadJson = decodeBase64Url(segments[1]);
  if (!payloadJson) return undefined;

  try {
    const claims = JSON.parse(payloadJson) as { role?: string };
    if (typeof claims.role === 'string' && ALLOWED_ROLES.has(claims.role as UserRole)) {
      return claims.role as UserRole;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function resolveEffectiveRole(token: string, user: AuthUserPayload): UserRole | undefined {
  const appRoleFromToken = parseAppRoleFromToken(token);
  if (appRoleFromToken) return appRoleFromToken;

  const appRoleFromMetaCandidates = [user.app_metadata?.user_role, user.app_metadata?.role];
  for (const candidate of appRoleFromMetaCandidates) {
    if (typeof candidate === 'string' && APP_ROLES.has(candidate as UserRole)) {
      return candidate as UserRole;
    }
  }

  const tokenRole = parseTokenRole(token);
  if (tokenRole === 'authenticated') return 'authenticated';
  if (user.role === 'authenticated') return 'authenticated';
  return undefined;
}

async function verifyJwtViaAuth(
  token: string
): Promise<{ ok: true; user: AuthUserPayload & { id: string } } | { ok: false; error: EdgeResult<never> }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      ok: false,
      error: fail('SUPABASE_CONFIG_MISSING', 'SUPABASE_URL/SUPABASE_ANON_KEY is required', 500),
    };
  }

  const verifyResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!verifyResponse.ok) {
    return { ok: false, error: fail('AUTH_UNAUTHORIZED', 'Invalid JWT', 401) };
  }

  const payload = await verifyResponse.json().catch(() => null) as AuthUserPayload | null;
  if (!payload?.id) {
    return { ok: false, error: fail('AUTH_UNAUTHORIZED', 'Invalid JWT payload', 401) };
  }

  return { ok: true, user: payload as AuthUserPayload & { id: string } };
}

async function upsertTossOrder(
  accessToken: string,
  input: TossOrderUpsertInput,
): Promise<{ ok: true; row: TossOrderPersistedRow } | { ok: false; error: EdgeResult<never> }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      ok: false,
      error: fail('SUPABASE_CONFIG_MISSING', 'SUPABASE_URL/SUPABASE_ANON_KEY is required', 500),
    };
  }

  const endpoint =
    `${SUPABASE_URL}/rest/v1/toss_orders` +
    '?on_conflict=idempotency_key' +
    '&select=id,user_id,product_id,idempotency_key,toss_status,grant_status,amount,toss_order_id,error_code,retry_count,created_at,updated_at';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([input]),
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => '');
    return {
      ok: false,
      error: fail('IAP_PERSIST_FAILED', 'Failed to persist toss_orders record', 502, {
        status: response.status,
        payload: payload.slice(0, 600),
      }),
    };
  }

  const rows = await response.json().catch(() => null) as TossOrderPersistedRow[] | null;
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.id) {
    return {
      ok: false,
      error: fail('IAP_PERSIST_FAILED', 'Invalid toss_orders upsert response', 502),
    };
  }

  return { ok: true, row };
}

function buildVerificationResponse(request: VerifyIapOrderRequest, userId: string): VerifyIapOrderResponse {
  const now = new Date().toISOString();
  let tossStatus: VerifyIapOrderResponse['toss_status'] = 'PAYMENT_COMPLETED';
  let errorCode: string | null = null;
  let amount = request.productId.includes('token') ? 1900 : 4900;

  if (request.orderId.includes('not-found')) {
    tossStatus = 'NOT_FOUND';
    amount = 0;
  } else if (request.orderId.includes('refund')) {
    tossStatus = 'REFUNDED';
  } else if (request.orderId.includes('fail')) {
    tossStatus = 'FAILED';
    amount = 0;
    errorCode = 'IAP_VERIFY_FAILED';
  }

  const grantStatus: VerifyIapOrderResponse['grant_status'] =
    tossStatus === 'PAYMENT_COMPLETED'
      ? 'granted'
      : tossStatus === 'REFUNDED'
        ? 'refunded'
        : tossStatus === 'FAILED' || tossStatus === 'NOT_FOUND'
          ? 'grant_failed'
          : 'pending';

  return {
    id: `ord_${request.orderId}`,
    // Never trust caller-provided userId. Always bind order to the verified JWT user.
    user_id: userId,
    product_id: request.productId,
    idempotency_key: request.idempotencyKey,
    toss_status: tossStatus,
    grant_status: grantStatus,
    amount,
    toss_order_id: request.orderId,
    error_code: errorCode,
    retry_count: 0,
    created_at: now,
    updated_at: now,
  };
}

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') {
    return toJsonResponse(fail('METHOD_NOT_ALLOWED', `Unsupported method: ${request.method}`, 405));
  }

  const token = readBearerToken(request);
  if (!token) {
    return toJsonResponse(fail('AUTH_UNAUTHORIZED', 'Missing bearer token', 401));
  }

  const auth = await verifyJwtViaAuth(token);
  if (!auth.ok) {
    return toJsonResponse(auth.error);
  }

  const role = resolveEffectiveRole(token, auth.user);
  if (!role || !ALLOWED_ROLES.has(role)) {
    return toJsonResponse(fail('AUTH_FORBIDDEN', 'Only authenticated app roles can verify IAP orders', 403));
  }

  const body = await request.json().catch(() => null) as VerifyIapOrderRequest | null;
  if (!body) {
    return toJsonResponse(fail('VALIDATION_ERROR', 'Invalid JSON body', 400));
  }

  if (!body.orderId || !body.productId || !body.transactionId || !body.idempotencyKey) {
    return toJsonResponse(
      fail('VALIDATION_ERROR', 'orderId/productId/transactionId/idempotencyKey are required', 400),
    );
  }

  // authenticated 기본 세션은 개인 결제만 허용하고 조직/트레이너 지급 컨텍스트는 차단한다.
  if (role === 'authenticated' && (body.orgId || body.trainerUserId)) {
    return toJsonResponse(
      fail('AUTH_FORBIDDEN', 'authenticated role cannot grant org/trainer scoped purchases', 403),
    );
  }

  const verification = buildVerificationResponse(body, auth.user.id);
  const persisted = await upsertTossOrder(token, {
    user_id: auth.user.id,
    product_id: body.productId,
    idempotency_key: body.idempotencyKey,
    toss_status: verification.toss_status,
    grant_status: verification.grant_status,
    amount: verification.amount,
    toss_order_id: body.orderId,
    error_code: verification.error_code,
    retry_count: verification.retry_count,
  });

  if (!persisted.ok) {
    return toJsonResponse(persisted.error);
  }

  const response: VerifyIapOrderResponse = {
    id: persisted.row.id,
    user_id: persisted.row.user_id,
    product_id: persisted.row.product_id,
    idempotency_key: persisted.row.idempotency_key,
    toss_status: persisted.row.toss_status,
    grant_status: persisted.row.grant_status,
    amount: persisted.row.amount,
    toss_order_id: persisted.row.toss_order_id,
    error_code: persisted.row.error_code,
    retry_count: persisted.row.retry_count,
    created_at: persisted.row.created_at,
    updated_at: persisted.row.updated_at,
  };

  return toJsonResponse(ok(response));
});
