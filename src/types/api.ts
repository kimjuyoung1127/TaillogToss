/**
 * API 공통 타입 — 응답 래퍼, 페이지네이션, 에러 코드
 * Parity: APP-001
 */

/** API 성공 응답 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

/** API 에러 응답 */
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/** 에러 코드 */
export type ErrorCode =
  // 인증
  | 'AUTH_REQUIRED'
  | 'AUTH_EXPIRED'
  | 'AUTH_INVALID_TOKEN'
  | 'AUTH_FORBIDDEN'
  // 비즈니스
  | 'DOG_LIMIT_EXCEEDED'
  | 'AI_TOKENS_EXHAUSTED'
  | 'SUBSCRIPTION_REQUIRED'
  // IAP
  | 'IAP_PURCHASE_FAILED'
  | 'IAP_VERIFY_FAILED'
  | 'IAP_ALREADY_PURCHASED'
  // Toss
  | 'TOSS_4100' // 접근 불가 상태
  | 'TOSS_4109' // 중복 요청
  | 'TOSS_4110' // key 만료
  | 'TOSS_4112' // 시스템 오류
  | 'TOSS_4113' // 시스템 점검
  // 일반
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR';

/** 쿼리 파라미터 공통 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

/** 정렬 파라미터 */
export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
