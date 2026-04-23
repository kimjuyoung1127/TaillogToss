/**
 * Smart Message 템플릿 코드 상수
 * Toss 콘솔 승인 코드와 1:1 매핑.
 * Parity: MSG-001
 */
import type { NotificationType, SmartMessageTemplate } from 'types/notification';

/** 승인된 templateCode 상수 */
export const TEMPLATE_CODES = {
  /** 행동 기록 리마인더 (기능성, 승인 대기 2026-04-20) */
  LOG_REMINDER: 'taillog-app-TAILLOG_BEHAVIOR_REMIND',
} as const;

/** notificationType → 기본 템플릿 매핑 */
export function buildTemplate(
  type: NotificationType,
  variables: Record<string, string> = {},
): SmartMessageTemplate {
  switch (type) {
    case 'log_reminder':
    case 'streak_alert':
    case 'training_reminder':
    case 'coaching_ready':
    case 'surge_alert':
    case 'promo':
      // 현재 승인된 템플릿은 LOG_REMINDER 1종 — 추후 타입별 코드 추가
      return { template_set_code: TEMPLATE_CODES.LOG_REMINDER, variables };
    default: {
      void (type as never);
      return { template_set_code: TEMPLATE_CODES.LOG_REMINDER, variables };
    }
  }
}
