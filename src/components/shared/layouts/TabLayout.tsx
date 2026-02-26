/**
 * TabLayout (패턴D) — 탭형 레이아웃
 * 대시보드 3탭, 분석 주간/월간/전체 등에 사용
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}

export interface TabLayoutProps {
  title?: string;
  tabs: TabItem[];
  defaultTab?: string;
  headerRight?: React.ReactNode;
}

export function TabLayout({ title, tabs, defaultTab, headerRight }: TabLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.key ?? '');
  const activeContent = tabs.find((t) => t.key === activeTab)?.content;

  return (
    <SafeAreaView style={styles.safe}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>{activeContent}</View>
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
  },
  title: { fontSize: 20, fontWeight: '700', color: '#202632' },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EB',
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0064FF',
  },
  tabText: { fontSize: 15, color: '#8B95A1' },
  tabTextActive: { color: '#0064FF', fontWeight: '600' },
  content: { flex: 1 },
});
