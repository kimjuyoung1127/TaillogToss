/**
 * 반려견 프로필 화면 — Profile Card 레이아웃 (견종/나이/사진/행동 이력)
 * Parity: APP-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePageGuard } from 'lib/hooks/usePageGuard';

export const Route = createRoute('/dog/profile', {
  component: DogProfilePage,
});

function DogProfilePage() {
  const { isReady } = usePageGuard({ currentPath: '/dog/profile' });
  if (!isReady) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dog Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
