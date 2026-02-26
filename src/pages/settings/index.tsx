/**
 * 설정 메인 화면 — Settings List 레이아웃 (계정/알림/구독/앱정보)
 * Parity: APP-001, IAP-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/settings', {
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
