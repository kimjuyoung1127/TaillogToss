/**
 * 구독/결제 API — Toss IAP 연동
 * Parity: IAP-001
 */
import { supabase } from './supabase';
import type { Subscription, TossOrder, PurchaseRequest } from 'types/subscription';

function toIdempotencyKey(request: PurchaseRequest): string {
  return request.idempotencyKey ?? request.idempotency_key ?? `idem_${Date.now().toString(36)}`;
}

function toOrderId(request: PurchaseRequest): string {
  return request.orderId ?? request.order_id ?? `order_${Date.now().toString(36)}`;
}

function toTransactionId(request: PurchaseRequest): string {
  return request.transactionId ?? request.transaction_id ?? `tx_${Date.now().toString(36)}`;
}

function toProductId(request: PurchaseRequest): string {
  return request.productId ?? request.product_id;
}

/** 현재 구독 상태 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as Subscription | null;
}

/** IAP 구매 검증 (Edge Function) */
export async function verifyIAPOrder(request: PurchaseRequest): Promise<TossOrder> {
  const payload = {
    orderId: toOrderId(request),
    productId: toProductId(request),
    transactionId: toTransactionId(request),
    idempotencyKey: toIdempotencyKey(request),
  };

  const { data, error } = await supabase.functions.invoke('verify-iap-order', {
    body: payload,
  });
  if (error) throw error;
  return data as TossOrder;
}

/** 주문 이력 조회 */
export async function getOrders(userId: string): Promise<TossOrder[]> {
  const { data, error } = await supabase
    .from('toss_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as TossOrder[];
}

/** 구독 복원 */
export async function restoreSubscription(userId: string): Promise<Subscription | null> {
  // TODO: Toss IAP 복원 API 연동
  return getSubscription(userId);
}
