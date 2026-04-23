/**
 * ReactionTrendBar — 최근 N회 반응 추이 시각화 (PRO 잠금)
 * Parity: UI-TRAINING-DETAIL-001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DogReaction } from 'types/training';
import { colors, typography, spacing } from 'styles/tokens';

interface ReactionTrendBarProps {
  reactions: DogReaction[];
  isPro: boolean;
}

const REACTION_CONFIG: Record<DogReaction, { emoji: string; color: string; label: string }> = {
  enjoyed:   { emoji: '😆', color: colors.green500, label: '잘 됐어요' },
  neutral:   { emoji: '😐', color: colors.orange500, label: '평범' },
  sensitive: { emoji: '😢', color: colors.red500, label: '예민' },
};

export function ReactionTrendBar({ reactions, isPro }: ReactionTrendBarProps) {
  if (!isPro) {
    return (
      <View style={styles.proLock}>
        <Text style={styles.proLockText}>🔒 PRO — 반응 추이 보기</Text>
      </View>
    );
  }

  if (reactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>아직 기록된 반응이 없어요</Text>
      </View>
    );
  }

  const recent = reactions.slice(-7);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>최근 반응 추이</Text>
      <View style={styles.barRow}>
        {recent.map((reaction, i) => {
          const cfg = REACTION_CONFIG[reaction];
          return (
            <View key={i} style={styles.barItem}>
              <Text style={styles.emoji}>{cfg.emoji}</Text>
              <View style={[styles.dot, { backgroundColor: cfg.color }]} />
              {i < recent.length - 1 && <View style={styles.connector} />}
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        {Object.entries(REACTION_CONFIG).map(([key, cfg]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
            <Text style={styles.legendLabel}>{cfg.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.grey50,
    borderRadius: 14,
    padding: spacing.md,
  },
  title: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  barItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
    marginRight: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connector: {
    width: 16,
    height: 2,
    backgroundColor: colors.divider,
    marginHorizontal: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  proLock: {
    backgroundColor: colors.grey50,
    borderRadius: 10,
    padding: spacing.sm,
    alignItems: 'center',
  },
  proLockText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  empty: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
