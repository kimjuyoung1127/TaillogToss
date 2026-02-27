/**
 * 반려견 추가 화면 — Stepper Form 레이아웃 (새 반려견 등록)
 * Parity: APP-001
 */
import { createRoute, useNavigation } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { usePageGuard } from 'lib/hooks/usePageGuard';

export const Route = createRoute('/dog/add', {
  component: DogAddPage,
});

function DogAddPage() {
  const navigation = useNavigation();
  const { isReady } = usePageGuard({
    currentPath: '/dog/add',
    requireFeature: 'multiDog',
  });
  if (!isReady) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>반려견 추가</Text>
        <View style={styles.backButton} />
      </View>
      <View style={styles.container}>
        <Text style={styles.text}>Add Dog</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
  },
  backButton: { width: 40 },
  backText: { fontSize: 20, color: '#191F28' },
  navTitle: { fontSize: 17, fontWeight: '600', color: '#191F28' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, color: '#202632' },
});
