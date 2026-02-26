/**
 * EmptyState — TDS Result 래퍼, 데이터 없음 상태 표시
 * 대시보드 0건, 훈련 미시작 등에 사용
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon = '\uD83D\uDCED', action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
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
  action: {
    marginTop: 24,
  },
});
