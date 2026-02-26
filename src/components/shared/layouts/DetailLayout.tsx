/**
 * DetailLayout (패턴B) — 상세형 레이아웃
 * 코칭 결과, 프로필, 구독 비교 등에 사용. AppBar + ScrollView + BottomCTA
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

export interface DetailLayoutProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  bottomCTA?: { label: string; onPress: () => void };
}

export function DetailLayout({ title, onBack, children, bottomCTA }: DetailLayoutProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
      {bottomCTA && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.ctaButton} onPress={bottomCTA.onPress} activeOpacity={0.8}>
            <Text style={styles.ctaText}>{bottomCTA.label}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  backBtn: { paddingRight: 12 },
  backIcon: { fontSize: 20, color: '#333D4B' },
  title: { fontSize: 18, fontWeight: '600', color: '#202632', flex: 1, textAlign: 'center' },
  spacer: { width: 32 },
  body: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
    backgroundColor: '#FFFFFF',
  },
  ctaButton: {
    backgroundColor: '#0064FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
