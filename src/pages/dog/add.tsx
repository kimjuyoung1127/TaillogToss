/**
 * 반려견 추가 화면 — Stepper Form 레이아웃 (새 반려견 등록)
 * Parity: APP-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Route = createRoute('/dog/add', {
  component: DogAddPage,
});

function DogAddPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add Dog</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
});
