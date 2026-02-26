/**
 * 알림 권한 요청 화면 — Full-screen CTA 레이아웃 (푸시 알림 옵트인)
 * Parity: AUTH-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/onboarding/notification', {
  component: NotificationPage,
});

function NotificationPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notification Permission</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
