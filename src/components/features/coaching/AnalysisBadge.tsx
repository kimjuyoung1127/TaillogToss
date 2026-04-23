/**
 * AnalysisBadge — 코칭 분석 기반 메타 배지
 * "최근 N일 N개 기록 분석 · 행동 집중" 표시
 * Parity: AI-COACHING-ANALYTICS-001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from 'styles/tokens';

interface Props {
  logCount: number;
  analysisDays: number;
  topBehavior: string | null;
}

const BEHAVIOR_LABEL: Record<string, string> = {
  barking: '짖음',
  biting: '무는 행동',
  jumping: '점프',
  pulling: '줄 당김',
  anxiety: '불안',
  aggression: '공격성',
  fear: '두려움',
  destruction: '파괴',
  toilet: '배변',
  separation: '분리불안',
  reactivity: '반응성',
  resource_guarding: '자원보호',
  leash_pulling: '줄 당김',
  other: '기타',
};

export function AnalysisBadge({ logCount, analysisDays, topBehavior }: Props) {
  if (logCount === 0) return null;

  const behaviorLabel = topBehavior ? BEHAVIOR_LABEL[topBehavior] ?? topBehavior : null;
  const suffix = behaviorLabel ? ` · ${behaviorLabel} 집중` : '';

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📊</Text>
      <Text style={styles.text}>
        최근 {analysisDays}일 {logCount}개 기록 분석{suffix}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.aiSectionBg,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 13,
    marginRight: 5,
  },
  text: {
    ...typography.caption,
    color: colors.blue800,
    fontWeight: '600',
  },
});
