/**
 * EmptyState — TDS Result 래퍼, 데이터 없음 상태 표시
 * 대시보드 0건, 훈련 미시작 등에 사용. lottie prop으로 Lottie 애니메이션 대체 가능.
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../styles/tokens';
import { LottieAnimation, type LottieAssetKey } from '../shared/LottieAnimation';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** 이모지 아이콘 (lottie/iconSource 미지정 시 표시) */
  icon?: string;
  /** URI 아이콘 소스 — 지정 시 이모지 대신 Image 표시 */
  iconSource?: string;
  /** Lottie 에셋 키 — 지정 시 이모지 대신 애니메이션 표시 */
  lottie?: LottieAssetKey;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon = '\uD83D\uDCED', iconSource, lottie, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {lottie ? (
        <View style={styles.lottieWrap}>
          <LottieAnimation asset={lottie} size={140} />
        </View>
      ) : iconSource ? (
        <Image source={{ uri: iconSource }} style={styles.iconImg} />
      ) : (
        <Text style={styles.icon}>{icon}</Text>
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: 48,
  },
  lottieWrap: {
    marginBottom: spacing.lg,
  },
  icon: {
    ...typography.emoji,
    marginBottom: spacing.lg,
  },
  iconImg: {
    width: 64,
    height: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.detail,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.xxl,
  },
});
