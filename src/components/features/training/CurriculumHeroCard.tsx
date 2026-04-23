/**
 * 커리큘럼 히어로 카드 — 아이콘 + 제목 + 난이도 배지
 * Parity: UI-001
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { CURRICULUM_ICON_URIS, CURRICULUM_ICON_FALLBACK_URI } from 'lib/data/curriculumIconAssets';
import { colors, typography, spacing } from 'styles/tokens';
import type { CurriculumId } from 'types/training';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

interface Props {
  curriculumId: CurriculumId;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export function CurriculumHeroCard({ curriculumId, title, difficulty }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Image
          source={{ uri: CURRICULUM_ICON_URIS[curriculumId] ?? CURRICULUM_ICON_FALLBACK_URI }}
          style={styles.icon}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{DIFFICULTY_LABEL[difficulty]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  placeholder: {
    height: 160,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.sectionTitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
