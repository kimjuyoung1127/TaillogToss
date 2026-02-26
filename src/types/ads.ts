/**
 * 광고(토스 Ads SDK) 도메인 타입 — Rewarded 터치포인트 3종
 * Parity: UI-001
 */

/** 광고 배치 위치 (3개 터치포인트) */
export type AdPlacement = 'R1' | 'R2' | 'R3';

/** 광고 배치 상세 */
export const AD_PLACEMENT_CONFIG: Record<AdPlacement, AdPlacementConfig> = {
  R1: { screen: 'survey-result', description: '설문 결과 전체 해제' },
  R2: { screen: 'dashboard', description: '대시보드 분석 차트 해제' },
  R3: { screen: 'coaching-result', description: 'AI 코칭 PRO 블록 미리보기' },
};

export interface AdPlacementConfig {
  screen: string;
  description: string;
}

/** 보상형 광고 상태 */
export type RewardedAdState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'showing'
  | 'rewarded'
  | 'error'
  | 'no_fill'; // 광고 없음

/** 광고 폴백 정책 — 토스 SDK 미응답 시 무광고 폴백 */
export interface AdFallbackPolicy {
  /** 폴백 시 콘텐츠 해제 여부 */
  unlock_on_no_fill: boolean;
  /** 최대 로딩 대기 시간 (ms) */
  timeout_ms: number;
  /** 하루 최대 광고 노출 수 */
  daily_limit: number;
}

/** 기본 폴백 정책 */
export const DEFAULT_AD_FALLBACK: AdFallbackPolicy = {
  unlock_on_no_fill: true, // 광고 없으면 무료 해제
  timeout_ms: 5000,
  daily_limit: 10,
};
