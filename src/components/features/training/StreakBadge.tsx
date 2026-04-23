/**
 * StreakBadge — 훈련 연속 완료 배지 (무료)
 * Parity: UI-TRAINING-DETAIL-001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from 'styles/tokens';

interface StreakBadgeProps {
  streakDays: number;
}

function getStreakLevel(days: number): { emoji: string; label: string; color: string; bg: string } {
  if (days >= 30) return { emoji: '🏆', label: '레전드', color: colors.orange600, bg: colors.orange50 };
  if (days >= 14) return { emoji: '🥇', label: '마스터', color: colors.orange600, bg: colors.orange50 };
  if (days >= 7)  return { emoji: '🔥', label: '열정적', color: colors.red500, bg: colors.red50 };
  if (days >= 3)  return { emoji: '⭐', label: '꾸준히', color: colors.blue500, bg: colors.blue50 };
  return               { emoji: '🌱', label: '시작', color: colors.green500, bg: colors.green50 };
}

export function StreakBadge({ streakDays }: StreakBadgeProps) {
  if (streakDays <= 0) return null;

  const level = getStreakLevel(streakDays);

  return (
    <View style={[styles.container, { backgroundColor: level.bg }]}>
      <Text style={styles.emoji}>{level.emoji}</Text>
      <View style={styles.textGroup}>
        <Text style={[styles.days, { color: level.color }]}>{streakDays}일 연속</Text>
        <Text style={[styles.label, { color: level.color }]}>{level.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  emoji: {
    fontSize: 16,
  },
  textGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  days: {
    ...typography.caption,
    fontWeight: '700',
  },
  label: {
    ...typography.caption,
    fontWeight: '500',
  },
});
