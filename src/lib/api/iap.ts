/**
 * IAP SDK 래퍼 — 공식 createOneTimePurchaseOrder + getPendingOrders 패턴
 * B2C + B2B 공용. B2B는 optional B2BGrantContext로 orgId/trainerUserId 전달.
 * @apps-in-toss/framework 확인 후 실 SDK로 교체 예정
 * Parity: IAP-001, B2B-001
 */
import { supabase } from './supabase';

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
  const { data, error } = await supabase.functions.invoke('verify-iap-order', {
    body: {
      orderId: receipt.orderId,
      productId: receipt.productId,
      transactionId: receipt.transactionId,
      idempotencyKey: `idem_${receipt.orderId}`,
      ...(b2bContext?.orgId && { orgId: b2bContext.orgId }),
      ...(b2bContext?.trainerUserId && { trainerUserId: b2bContext.trainerUserId }),
    },
  });
  if (error) return false;
  return data?.ok === true || data?.grant_status === 'granted';
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
