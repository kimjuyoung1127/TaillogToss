/**
 * 설문 결과 화면 — Card Stack 레이아웃 (AI 분석 요약 + 리워드 광고 터치포인트 R1)
 * Parity: AUTH-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/onboarding/survey-result', {
  component: SurveyResultPage,
});

function SurveyResultPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Survey Result</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
