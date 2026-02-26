/**
 * 훈련 콘텐츠 상세 화면 — Content Detail 레이아웃 (단계별 가이드)
 * Parity: UI-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/training/detail', {
  component: TrainingDetailPage,
});

function TrainingDetailPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Training Detail</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
