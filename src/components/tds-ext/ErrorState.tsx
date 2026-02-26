/**
 * ErrorState — TDS ErrorPage 래퍼, 에러 상태 표시 + 재시도
 * API 실패, 네트워크 오류 등에 사용
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = '문제가 발생했어요',
  description = '잠시 후 다시 시도해 주세요',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{'\u26A0\uFE0F'}</Text>
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
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202632',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#8B95A1',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0064FF',
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
