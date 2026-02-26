/**
 * 훈련 아카데미 목록 화면 — List + Filter 레이아웃 (교정 콘텐츠 브라우징)
 * Parity: UI-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/training/academy', {
  component: TrainingAcademyPage,
});

function TrainingAcademyPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Training Academy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
