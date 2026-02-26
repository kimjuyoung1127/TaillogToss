/**
 * 메인 대시보드 화면 — Dashboard Grid 레이아웃 (ABC 기록 요약 + 퀵액션)
 * Parity: UI-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/dashboard', {
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
