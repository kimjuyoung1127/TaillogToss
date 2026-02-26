/**
 * 설정 메인 화면 — Settings List 레이아웃 (계정/알림/구독/앱정보)
 * Parity: APP-001, IAP-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { tracker } from 'lib/analytics/tracker';
import { usePageGuard } from 'lib/hooks/usePageGuard';

export const Route = createRoute('/settings', {
  component: SettingsPage,
});

function SettingsPage() {
  const { isReady } = usePageGuard({ currentPath: '/settings' });
  if (!isReady) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => tracker.shareRewardSent()}
        activeOpacity={0.8}
      >
        <Text style={styles.shareButtonText}>친구에게 공유하기 (Mock)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#202632' },
  shareButton: {
    marginTop: 16,
    backgroundColor: '#0064FF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
