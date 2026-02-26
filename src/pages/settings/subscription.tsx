/**
 * 구독/결제 관리 화면 — Card Stack 레이아웃 (PRO 플랜 + 토큰 IAP)
 * Parity: APP-001, IAP-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePageGuard } from 'lib/hooks/usePageGuard';

export const Route = createRoute('/settings/subscription', {
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { isReady } = usePageGuard({ currentPath: '/settings/subscription' });
  if (!isReady) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Subscription</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
