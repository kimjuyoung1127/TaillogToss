/**
 * 행동 분석 화면 — Scrollable Card 레이아웃 (차트 + 트렌드 + 광고 터치포인트 R2)
 * Parity: UI-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/dashboard/analysis', {
  component: AnalysisPage,
});

function AnalysisPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Analysis</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
