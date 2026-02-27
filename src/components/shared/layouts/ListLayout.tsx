/**
 * ListLayout (패턴A) — 목록형 레이아웃 + onBack 뒤로가기
 * 대시보드, 훈련 목록, 설정 등에 사용. Header + ScrollView 구조.
 * Parity: UI-001
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

export interface ListLayoutProps {
  title: string;
  headerRight?: React.ReactNode;
  /** 뒤로가기 콜백 — 전달 시 ← 버튼 표시 (심사 필수) */
  onBack?: () => void;
  children: React.ReactNode;
}

export function ListLayout({ title, headerRight, onBack, children }: ListLayoutProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>{'←'}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        {headerRight && <View>{headerRight}</View>}
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: { paddingRight: 4 },
  backText: { fontSize: 20, color: '#191F28' },
  title: { fontSize: 20, fontWeight: '700', color: '#202632' },
  body: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
});
