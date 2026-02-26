/**
 * AI 코칭 결과 화면 — Card Stack 레이아웃 (맞춤 교정 플랜 + 광고 터치포인트 R3)
 * Parity: AI-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/coaching/result', {
  component: CoachingResultPage,
});

function CoachingResultPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Coaching Result</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
