/**
 * BehaviorTypeBadge — 설문 결과 행동 유형 뱃지 + 분류 규칙 엔진
 * 와이어프레임 11.3-2 기반: 행동 조합 → 유형 분류 → 뱃지 표시
 * Parity: AUTH-001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from 'styles/tokens';
import type { BehaviorType, SurveyResult } from 'types/dog';

/** 행동 유형 → 표시 정보 */
const DEFAULT_BADGE = { label: '일반형', color: colors.badgeGrey, bgColor: colors.badgeGreyBg };

const BADGE_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  anxiety: { label: '불안형', color: colors.badgeAmber, bgColor: colors.badgeAmberBg },
  dominance: { label: '주도형', color: colors.badgeRed, bgColor: colors.badgeRedBg },
  energy: { label: '에너지 과잉형', color: colors.badgeBlue, bgColor: colors.badgeBlueBg },
  separation: { label: '분리불안형', color: colors.badgePurple, bgColor: colors.badgePurpleBg },
  environmental: { label: '환경적응형', color: colors.badgeGreen, bgColor: colors.badgeGreenBg },
  complex: { label: '복합형', color: colors.badgePink, bgColor: colors.badgePinkBg },
  other: { label: '일반형', color: colors.badgeGrey, bgColor: colors.badgeGreyBg },
};

/** 위험도 → 표시 정보 */
const RISK_MAP: Record<SurveyResult['risk_level'], { label: string; color: string }> = {
  low: { label: '낮음', color: colors.badgeGreen },
  medium: { label: '중간', color: colors.badgeAmber },
  high: { label: '높음', color: colors.badgeRed },
  critical: { label: '심각', color: colors.badgeRedDark },
};

/**
 * 설문 응답 기반 행동 유형 분류 (프론트엔드 규칙 엔진)
 * - barking + anxiety/fear → 불안형
 * - aggression + resource_guarding → 주도형
 * - reactivity + destructive → 에너지 과잉형
 * - separation 포함 → 분리불안형
 * - 3개 이상 → 복합형
 */
export function classifyBehaviorType(behaviors: BehaviorType[]): string {
  if (behaviors.length >= 3) return 'complex';
  if (behaviors.includes('separation')) return 'separation';
  if (behaviors.includes('anxiety') && (behaviors.includes('barking') || behaviors.length === 1)) return 'anxiety';
  if (behaviors.includes('aggression') || behaviors.includes('resource_guarding')) return 'dominance';
  if (behaviors.includes('reactivity') || behaviors.includes('destructive')) return 'energy';
  if (behaviors.length === 1 && behaviors[0] === 'other') return 'other';
  return 'anxiety';
}

/** 설문 응답 기반 위험도 추정 */
export function estimateRiskLevel(behaviors: BehaviorType[]): SurveyResult['risk_level'] {
  const highRisk: BehaviorType[] = ['aggression', 'resource_guarding'];
  const mediumRisk: BehaviorType[] = ['separation', 'anxiety', 'destructive'];

  const hasHigh = behaviors.some((b) => highRisk.includes(b));
  const hasMedium = behaviors.some((b) => mediumRisk.includes(b));

  if (hasHigh && behaviors.length >= 2) return 'critical';
  if (hasHigh) return 'high';
  if (hasMedium || behaviors.length >= 2) return 'medium';
  return 'low';
}

interface Props {
  behaviorType: string;
  riskLevel: SurveyResult['risk_level'];
  riskScore: number;
}

export function BehaviorTypeBadge({ behaviorType, riskLevel, riskScore }: Props) {
  const badge = BADGE_MAP[behaviorType] ?? DEFAULT_BADGE;
  const risk = RISK_MAP[riskLevel];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>행동 유형</Text>
        <View style={[styles.badge, { backgroundColor: badge.bgColor }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.riskRow}>
        <Text style={styles.label}>위험도</Text>
        <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${riskScore}%`, backgroundColor: risk.color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: { ...typography.detail, fontWeight: '600', color: colors.textDark },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: { ...typography.detail, fontWeight: '700' },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  riskLabel: { ...typography.detail, fontWeight: '600' },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
});
