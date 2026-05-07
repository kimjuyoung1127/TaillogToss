/**
 * StreakBadge — 훈련 연속 완료 배지 (무료)
 * Parity: UI-TRAINING-DETAIL-001
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ICONS } from 'lib/data/iconSources';
import { colors, typography, spacing } from 'styles/tokens';

interface StreakBadgeProps {
  streakDays: number;
}

function getStreakLevel(days: number): { iconSource: string; label: string; color: string; bg: string } {
  if (days >= 30) return { iconSource: ICONS['badge-streak-30']!, label: '레전드', color: colors.orange600, bg: colors.orange50 };
  if (days >= 14) return { iconSource: ICONS['badge-streak-30']!, label: '마스터', color: colors.orange600, bg: colors.orange50 };
  if (days >= 7)  return { iconSource: ICONS['badge-streak-7']!, label: '열정적', color: colors.red500, bg: colors.red50 };
  if (days >= 3)  return { iconSource: ICONS['badge-streak-3']!, label: '꾸준히', color: colors.blue500, bg: colors.blue50 };
  return               { iconSource: ICONS['ic-stage-puppy']!, label: '시작', color: colors.green500, bg: colors.green50 };
}

export function StreakBadge({ streakDays }: StreakBadgeProps) {
  if (streakDays <= 0) return null;

  const level = getStreakLevel(streakDays);

  return (
    <View style={[styles.container, { backgroundColor: level.bg }]}>
      <Image source={{ uri: level.iconSource }} style={styles.icon} />
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
  icon: {
    width: 18,
    height: 18,
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
