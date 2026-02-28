/**
 * IAP SDK 래퍼 — 공식 createOneTimePurchaseOrder + getPendingOrders 패턴
 * B2C + B2B 공용. B2B는 optional B2BGrantContext로 orgId/trainerUserId 전달.
 * @apps-in-toss/framework 확인 후 실 SDK로 교체 예정
 * Parity: IAP-001, B2B-001
 */
import { getSupabasePublicConfig, supabase } from './supabase';

// ──────────────────────────────────────
// 공식 SDK 인터페이스 미러
// ──────────────────────────────────────

export interface IAPReceipt {
  orderId: string;
  productId: string;
  transactionId: string;
}

export type IAPEvent =
  | 'PURCHASE_STARTED'
  | 'PAYMENT_COMPLETED'
  | 'GRANT_COMPLETED'
  | 'GRANT_FAILED';

/** B2B 구매 검증용 추가 컨텍스트 (optional — B2C 호출 시 생략) */
export interface B2BGrantContext {
  orgId?: string;
  trainerUserId?: string;
}

export interface CreateOrderOptions {
  options: { sku: string };
  processProductGrant: (receipt: IAPReceipt) => Promise<boolean>;
  onEvent?: (event: IAPEvent) => void;
  onError?: (error: Error) => void;
}

async function resolveAccessToken(forceRefresh = false): Promise<string | null> {
  if (forceRefresh) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError && refreshed.session?.access_token) {
      return refreshed.session.access_token;
    }
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}

function normalizeJwtToken(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const token = raw.trim();
  if (!token) return null;
  return token.split('.').length === 3 ? token : null;
}

async function isUsableAccessToken(token: string): Promise<boolean> {
  const { data, error } = await supabase.auth.getUser(token);
  return !error && !!data.user;
}

async function resolveAccessTokenForInvoke(): Promise<string | null> {
  const activeToken = normalizeJwtToken(await resolveAccessToken(false));
  if (activeToken && (await isUsableAccessToken(activeToken))) return activeToken;

  const refreshedToken = normalizeJwtToken(await resolveAccessToken(true));
  if (refreshedToken && (await isUsableAccessToken(refreshedToken))) return refreshedToken;
  return null;
}

function isTestEnvironment(): boolean {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
}

async function invokeVerifyIapOrderViaFetch(
  body: Record<string, unknown>,
  accessToken: string | null,
): Promise<{ data: unknown; error: unknown }> {
  const { url, anonKey } = getSupabasePublicConfig();
  const response = await fetch(`${url}/functions/v1/verify-iap-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return {
      data: null,
      error: {
        status: response.status,
        payload,
      },
    };
  }

  return { data: payload, error: null };
}

function getInvokeHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const withContext = error as { context?: unknown; status?: number };
  if (typeof withContext.status === 'number') return withContext.status;

  const context = withContext.context as { status?: number } | undefined;
  if (typeof context?.status === 'number') return context.status;
  return undefined;
}

/**
 * createOneTimePurchaseOrder — 공식 패턴 래퍼
 * 실 SDK 확인 전까지 Edge Function 직통 방식으로 동작
 * Returns cleanup function
 */
export function createOneTimePurchaseOrder({
  options,
  processProductGrant,
  onEvent,
  onError,
}: CreateOrderOptions): () => void {
  let cancelled = false;

  (async () => {
    try {
      onEvent?.('PURCHASE_STARTED');

      // 실 SDK에서는 토스 결제 UI가 뜨고 receipt을 반환
      // Mock: orderId/transactionId 생성
      const receipt: IAPReceipt = {
        orderId: `order_${Date.now().toString(36)}`,
        productId: options.sku,
        transactionId: `tx_${Date.now().toString(36)}`,
      };

      if (cancelled) return;
      onEvent?.('PAYMENT_COMPLETED');

      // processProductGrant: 서버 검증 + 상품 지급
      const granted = await processProductGrant(receipt);

      if (cancelled) return;
      onEvent?.(granted ? 'GRANT_COMPLETED' : 'GRANT_FAILED');
    } catch (err) {
      if (!cancelled) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}

/**
 * 서버 검증 + 상품 지급 (processProductGrant 내부에서 호출)
 * B2B 호출 시 b2bContext로 orgId/trainerUserId를 추가 전달한다.
 */
export async function verifyAndGrant(
  receipt: IAPReceipt,
  b2bContext?: B2BGrantContext,
): Promise<boolean> {
  const body = {
    orderId: receipt.orderId,
    productId: receipt.productId,
    transactionId: receipt.transactionId,
    idempotencyKey: `idem_${receipt.orderId}`,
    ...(b2bContext?.orgId && { orgId: b2bContext.orgId }),
    ...(b2bContext?.trainerUserId && { trainerUserId: b2bContext.trainerUserId }),
  };

  const firstToken = await resolveAccessTokenForInvoke();
  if (!firstToken) {
    if (__DEV__) {
      console.warn('[IAP-001] verify-iap-order skipped: missing/invalid auth jwt');
    }
    return false;
  }
  if (__DEV__) {
    const { anonKey } = getSupabasePublicConfig();
    const { data: tokenUserData, error: tokenUserError } = await supabase.auth.getUser(firstToken);
    console.log('[IAP-001] verify-iap-order token debug', {
      tokenPreview: `${firstToken.slice(0, 12)}...${firstToken.slice(-8)}`,
      tokenLength: firstToken.length,
      isAnonKey: firstToken === anonKey,
      tokenUserId: tokenUserData.user?.id ?? null,
      tokenUserError: tokenUserError?.message ?? null,
    });
  }
  const firstInvoke = await supabase.functions.invoke('verify-iap-order', {
    body,
    headers: firstToken ? { Authorization: `Bearer ${firstToken}` } : undefined,
  });

  let data = firstInvoke.data;
  let error = firstInvoke.error;

  if (error && getInvokeHttpStatus(error) === 401) {
    const refreshedToken = normalizeJwtToken(await resolveAccessToken(true));
    const retryToken =
      refreshedToken && (await isUsableAccessToken(refreshedToken)) ? refreshedToken : firstToken;
    if (__DEV__) {
      const { anonKey } = getSupabasePublicConfig();
      console.log('[IAP-001] verify-iap-order retry token debug', {
        source: retryToken === firstToken ? 'first' : 'refreshed',
        isAnonKey: retryToken === anonKey,
      });
    }
    const secondInvoke = await supabase.functions.invoke('verify-iap-order', {
      body,
      headers: { Authorization: `Bearer ${retryToken}` },
    });
    data = secondInvoke.data;
    error = secondInvoke.error;

    // RN 런타임에서 invoke 헤더 전달이 누락되는 경우를 대비해 fetch로 한 번 더 시도한다.
    if (!isTestEnvironment() && error && getInvokeHttpStatus(error) === 401) {
      const fallback = await invokeVerifyIapOrderViaFetch(body, retryToken);
      data = fallback.data;
      error = fallback.error;
    }
  }

  if (error) {
    if (__DEV__) {
      console.warn('[IAP-001] verify-iap-order invoke failed', {
        status: getInvokeHttpStatus(error),
        error,
      });
    }
    return false;
  }

  // Edge envelope({ ok, data })와 평탄 응답({ grant_status })을 모두 지원한다.
  const payload = data as
    | {
        ok?: boolean;
        grant_status?: string;
        toss_status?: string;
        data?: {
          ok?: boolean;
          grant_status?: string;
          toss_status?: string;
        };
      }
    | null
    | undefined;

  const grantStatus = payload?.grant_status ?? payload?.data?.grant_status;
  if (grantStatus) return grantStatus === 'granted';

  const tossStatus = payload?.toss_status ?? payload?.data?.toss_status;
  if (tossStatus) return tossStatus === 'PAYMENT_COMPLETED';

  const okFlag = payload?.ok ?? payload?.data?.ok;
  return okFlag === true;
}

// ──────────────────────────────────────
// 미완료 주문 복구
// ──────────────────────────────────────

export interface PendingOrder {
  orderId: string;
  productId: string;
  transactionId: string;
}

/**
 * getPendingOrders — 미완료 주문 조회
 * 실 SDK: @apps-in-toss/framework의 getPendingOrders()
 * 래퍼: toss_orders 테이블에서 grant_status='pending' 조회
 */
export async function getPendingOrders(userId: string): Promise<PendingOrder[]> {
  const { data, error } = await supabase
    .from('toss_orders')
    .select('toss_order_id, product_id, id')
    .eq('user_id', userId)
    .eq('grant_status', 'pending')
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    orderId: row.toss_order_id ?? row.id,
    productId: row.product_id,
    transactionId: row.toss_order_id ?? row.id,
  }));
}

/**
 * completeProductGrant — 미완료 주문 지급 완료
 * 실 SDK: @apps-in-toss/framework의 completeProductGrant()
 */
export async function completeProductGrant(order: PendingOrder): Promise<boolean> {
  return verifyAndGrant({
    orderId: order.orderId,
    productId: order.productId,
    transactionId: order.transactionId,
  });
}

/**
 * recoverPendingOrders — 앱 시작 시 미완료 주문 일괄 복구
 */
export async function recoverPendingOrders(userId: string): Promise<number> {
  const pending = await getPendingOrders(userId);
  let recovered = 0;
  for (const order of pending) {
    const ok = await completeProductGrant(order);
    if (ok) recovered++;
  }
  return recovered;
}

// ──────────────────────────────────────
// B2B 미완료 주문 복구
// ──────────────────────────────────────

/**
 * getPendingOrdersB2B — B2B 미완료 주문 조회
 * org_id 또는 trainer_user_id 기준으로 toss_orders에서 grant_status='pending' 필터
 */
export async function getPendingOrdersB2B(
  orgId?: string,
  trainerUserId?: string,
): Promise<PendingOrder[]> {
  if (!orgId && !trainerUserId) return [];

  let query = supabase
    .from('toss_orders')
    .select('toss_order_id, product_id, id')
    .eq('grant_status', 'pending')
    .order('created_at', { ascending: true });

  if (orgId) {
    query = query.eq('org_id', orgId);
  } else if (trainerUserId) {
    query = query.eq('trainer_user_id', trainerUserId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    orderId: row.toss_order_id ?? row.id,
    productId: row.product_id,
    transactionId: row.toss_order_id ?? row.id,
  }));
}

/**
 * recoverPendingOrdersB2B — B2B 미완료 주문 일괄 복구
 * 각 주문을 verifyAndGrant(receipt, b2bContext)로 재시도한다.
 */
export async function recoverPendingOrdersB2B(
  orgId?: string,
  trainerUserId?: string,
): Promise<number> {
  const pending = await getPendingOrdersB2B(orgId, trainerUserId);
  let recovered = 0;
  for (const order of pending) {
    const ok = await verifyAndGrant(
      { orderId: order.orderId, productId: order.productId, transactionId: order.transactionId },
      { orgId, trainerUserId },
    );
    if (ok) recovered++;
  }
  return recovered;
}
