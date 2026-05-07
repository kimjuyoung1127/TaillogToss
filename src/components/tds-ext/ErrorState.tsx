/**
 * ErrorState — TDS ErrorPage 래퍼, 에러 상태 표시 + 재시도
 * API 실패, 네트워크 오류 등에 사용
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, typography, spacing } from '../../styles/tokens';
import { ICONS } from 'lib/data/iconSources';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = '문제가 발생했어요',
  description = '잠시 후 다시 시도해주세요',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: ICONS['ic-bolt'] }} style={styles.iconImg} resizeMode="contain" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.7}>
          <Text style={styles.buttonText}>다시 시도</Text>
        </TouchableOpacity>
      )}
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
  iconImg: {
    width: 56,
    height: 56,
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
  button: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryBlue,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
