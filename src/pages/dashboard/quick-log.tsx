/**
 * 빠른 ABC 행동 기록 화면 — Bottom Sheet Form 레이아웃
 * Parity: UI-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/dashboard/quick-log', {
  component: QuickLogPage,
});

function QuickLogPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Quick Log</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
