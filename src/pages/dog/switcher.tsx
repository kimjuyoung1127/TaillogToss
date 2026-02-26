/**
 * 반려견 전환 화면 — Bottom Sheet List 레이아웃 (멀티독 선택)
 * Parity: APP-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePageGuard } from 'lib/hooks/usePageGuard';

export const Route = createRoute('/dog/switcher', {
  component: DogSwitcherPage,
});

function DogSwitcherPage() {
  const { isReady } = usePageGuard({ currentPath: '/dog/switcher' });
  if (!isReady) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dog Switcher</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
