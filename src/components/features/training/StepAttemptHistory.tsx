/**
 * 훈련 스텝 시도 히스토리 뷰 — PRO 잠금
 * Parity: UI-TRAINING-DETAIL-001
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { StepAttempt } from 'types/training';
import { colors, typography, spacing } from 'styles/tokens';

interface Props {
  attempts: StepAttempt[];
}

const REACTION_LABEL: Record<string, { emoji: string; label: string; color: string }> = {
  enjoyed: { emoji: '😆', label: '잘 됐어요', color: colors.green500 },
  neutral: { emoji: '😐', label: '평범했어요', color: colors.orange500 },
  sensitive: { emoji: '😢', label: '예민했어요', color: colors.red500 },
};

export function StepAttemptHistory({ attempts }: Props) {
  if (attempts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>아직 기록된 시도가 없어요</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.historyTitle}>이전 시도 {attempts.length}회</Text>
      {attempts.map((attempt, index) => {
        const reactionInfo = attempt.reaction ? REACTION_LABEL[attempt.reaction] : null;
        const date = new Date(attempt.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

        return (
          <View key={attempt.id ?? index} style={styles.attemptCard}>
            <View style={styles.attemptHeader}>
              <Text style={styles.attemptNumber}>시도 {attempt.attempt_number}</Text>
              <Text style={styles.attemptDate}>{date}</Text>
            </View>

            {reactionInfo && (
              <View style={styles.reactionRow}>
                <Text style={styles.reactionEmoji}>{reactionInfo.emoji}</Text>
                <Text style={[styles.reactionLabel, { color: reactionInfo.color }]}>
                  {reactionInfo.label}
                </Text>
              </View>
            )}

            {attempt.situation_tags && attempt.situation_tags.length > 0 && (
              <View style={styles.tagsRow}>
                {attempt.situation_tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {attempt.what_worked && (
              <Text style={styles.noteText}>
                <Text style={styles.noteLabel}>효과: </Text>
                {attempt.what_worked}
              </Text>
            )}

            {attempt.what_didnt_work && (
              <Text style={styles.noteText}>
                <Text style={styles.noteLabel}>아쉬움: </Text>
                {attempt.what_didnt_work}
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  historyTitle: {
    ...typography.detail,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  attemptCard: {
    backgroundColor: colors.grey50,
    borderRadius: 12,
    padding: 14,
    marginBottom: spacing.sm,
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  attemptNumber: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  attemptDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  reactionLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: colors.white,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  tagText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  noteText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  noteLabel: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
