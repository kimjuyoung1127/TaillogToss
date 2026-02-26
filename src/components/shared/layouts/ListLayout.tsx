/**
 * ListLayout (패턴A) — 목록형 레이아웃
 * 대시보드, 훈련 목록, 설정 등에 사용. Header + FlatList 구조
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

export interface ListLayoutProps {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export function ListLayout({ title, headerRight, children }: ListLayoutProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
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
  title: { fontSize: 20, fontWeight: '700', color: '#202632' },
  body: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
});
