/**
 * 최초 환영 화면 — Full-screen CTA 레이아웃 (최초 1회 표시)
 * Parity: AUTH-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/onboarding/welcome', {
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
