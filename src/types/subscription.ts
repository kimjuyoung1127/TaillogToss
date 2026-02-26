/**
 * 구독/결제 도메인 타입 — Toss IAP, DogCoach payment.py 마이그레이션
 * Parity: IAP-001
 * 가격 기준일: 2026-02-26
 */

/** 플랜 유형 */
export type PlanType = 'FREE' | 'PRO_MONTHLY';

/** IAP 상품 유형 */
export type ProductType = 'non_consumable' | 'consumable';

/** Toss IAP 상품 정의 */
export interface IAPProduct {
  product_id: string;
  name: string;
  price: number; // KRW
  type: ProductType;
  description: string;
}

/** IAP 상품 카탈로그 (가격 기준일: 2026-02-26) */
export const IAP_PRODUCTS: Record<string, IAPProduct> = {
  PRO_MONTHLY: {
    product_id: 'pro_monthly',
    name: 'PRO 월간',
    price: 4900,
    type: 'non_consumable',
    description: 'AI 코칭 무제한 + 멀티독 5마리 + 전체 커리큘럼',
  },
  AI_TOKEN_10: {
    product_id: 'ai_token_10',
    name: 'AI 토큰 10회',
    price: 1900,
    type: 'consumable',
    description: 'AI 코칭 분석 10회 충전',
  },
  AI_TOKEN_30: {
    product_id: 'ai_token_30',
    name: 'AI 토큰 30회',
    price: 4900,
    type: 'consumable',
    description: 'AI 코칭 분석 30회 충전',
  },
} as const;

/** 멀티독 제한 */
export const DOG_LIMITS = {
  FREE: 1,
  PRO: 5,
} as const;

/** 구독 정보 */
export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  is_active: boolean;
  ai_tokens_remaining: number;
  ai_tokens_total: number;
  next_billing_date: string | null; // ISO date
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────
// Toss Order (2축 상태 패턴)
// ──────────────────────────────────────

/** Toss 주문 상태 (6종) */
export type TossOrderStatus =
  | 'PURCHASED'
  | 'PAYMENT_COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'ORDER_IN_PROGRESS'
  | 'NOT_FOUND';

/** 내부 지급 상태 (5종) */
export type GrantStatus =
  | 'pending'
  | 'granted'
  | 'grant_failed'
  | 'refund_requested'
  | 'refunded';

/** Toss 주문 레코드 */
export interface TossOrder {
  id: string;
  user_id: string;
  product_id: string;
  idempotency_key: string; // UNIQUE
  toss_status: TossOrderStatus;
  grant_status: GrantStatus;
  amount: number; // KRW
  toss_order_id: string | null;
  error_code: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

/** IAP 구매 요청 DTO */
export interface PurchaseRequest {
  productId?: string;
  product_id: string;
  orderId?: string;
  order_id?: string;
  transactionId?: string;
  transaction_id?: string;
  idempotencyKey?: string;
  idempotency_key: string;
}

/** IAP 구매 결과 DTO */
export interface PurchaseResult {
  order: TossOrder;
  subscription: Subscription;
}
