/**
 * LogCard — 단일 ABC 행동 기록 카드 (대시보드 목록용)
 * 카테고리, 강도 Badge, 시간, 위치 표시
 * Parity: UI-001, LOG-001
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { BehaviorLog } from 'types/log';
import { colors, typography } from 'styles/tokens';

/** 카테고리 한글 라벨 */
const CATEGORY_LABELS: Record<string, string> = {
  barking: '짖음/울음',
  biting: '마운팅',
  jumping: '과잉흥분',
  pulling: '배변문제',
  destructive: '파괴행동',
  anxiety: '분리불안',
  aggression: '공격성',
  other_behavior: '공포/회피',
  walk: '산책',
  meal: '식사',
  training: '훈련',
  play: '놀이',
  rest: '휴식',
  grooming: '그루밍',
};

/** 강도 라벨 + 색상 */
function getIntensityBadge(intensity: number): { label: string; color: string; bg: string } {
  if (intensity >= 8) return { label: '높음', color: '#E02020', bg: '#FEECEC' };
  if (intensity >= 5) return { label: '보통', color: '#FF8800', bg: '#FFF4E5' };
  return { label: '낮음', color: '#00B860', bg: '#E6F9EF' };
}

export interface LogCardProps {
  log: BehaviorLog;
  onPress?: () => void;
}

export function LogCard({ log, onPress }: LogCardProps) {
  const category = log.quick_category ?? log.daily_activity ?? log.type_id ?? 'unknown';
  const label = CATEGORY_LABELS[category] ?? (log.behavior ? log.behavior.slice(0, 20) : '기록');
  const badge = getIntensityBadge(log.intensity);
  const time = new Date(log.occurred_at);
  const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={styles.left}>
        <Text style={styles.label}>{label}</Text>
        {log.antecedent && (
          <Text style={styles.sub} numberOfLines={1}>{'\u2192'} {log.antecedent}</Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={styles.time}>{timeStr}</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  left: {
    flex: 1,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  time: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
