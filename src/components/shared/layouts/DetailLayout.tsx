/**
 * DetailLayout (패턴B) — 상세형 레이아웃
 * 코칭 결과, 프로필, 구독 비교 등에 사용. AppBar + ScrollView + BottomCTA
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../../styles/tokens';

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
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: { paddingRight: spacing.md },
  backIcon: { ...typography.sectionTitle, color: colors.textDark },
  title: { ...typography.subtitle, fontWeight: '600', color: colors.textPrimary, flex: 1, textAlign: 'center' },
  spacer: { width: 32 },
  body: { flex: 1 },
  content: { paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.screenHorizontal, paddingBottom: 100 },
  bottomBar: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },
  ctaButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  ctaText: { color: colors.white, ...typography.label, fontWeight: '700' },
});
