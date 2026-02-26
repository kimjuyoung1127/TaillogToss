/**
 * 온보딩 설문 화면 — Stepper Form 레이아웃 (견종/나이/문제행동 수집)
 * Parity: AUTH-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/onboarding/survey', {
  component: SurveyPage,
});

function SurveyPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Survey</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
