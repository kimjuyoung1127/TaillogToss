/**
 * 관련 훈련 가로 스크롤 캐러셀
 * Parity: UI-TRAINING-PERSONALIZATION-001
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { CURRICULUMS } from 'lib/data/published/runtime';
import type { Curriculum, CurriculumId } from 'types/training';
import { colors, typography, spacing } from 'styles/tokens';

interface Props {
  curriculumIds: CurriculumId[];
  onPress: (curriculum: Curriculum) => void;
}

export function RelatedCurriculumCarousel({ curriculumIds, onPress }: Props) {
  const items = curriculumIds
    .map((id) => CURRICULUMS.find((c) => c.id === id))
    .filter((c): c is Curriculum => !!c);

  if (items.length === 0) return null;

  const difficultyColor: Record<string, string> = {
    beginner: colors.green500,
    intermediate: colors.orange500,
    advanced: colors.red500,
  };

  const difficultyLabel: Record<string, string> = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((curriculum) => (
        <TouchableOpacity
          key={curriculum.id}
          style={styles.card}
          onPress={() => onPress(curriculum)}
          activeOpacity={0.8}
        >
          <View style={[styles.difficultyDot, { backgroundColor: difficultyColor[curriculum.difficulty] ?? colors.grey300 }]} />
          <Text style={styles.title} numberOfLines={2}>{curriculum.title}</Text>
          <Text style={styles.days}>{curriculum.total_days}일 과정</Text>
          <View style={[styles.difficultyBadge, { borderColor: difficultyColor[curriculum.difficulty] ?? colors.grey300 }]}>
            <Text style={[styles.difficultyText, { color: difficultyColor[curriculum.difficulty] ?? colors.grey500 }]}>
              {difficultyLabel[curriculum.difficulty] ?? curriculum.difficulty}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  card: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  title: {
    ...typography.detail,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  days: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  difficultyBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
