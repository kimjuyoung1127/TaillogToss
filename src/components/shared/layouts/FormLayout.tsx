/**
 * FormLayout (패턴C) — 입력폼형 레이아웃
 * 설문 7단계, 반려견 추가, 기록 상세 등에 사용. ProgressBar + KeyboardAvoid + BottomCTA
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../../styles/tokens';

export interface FormLayoutProps {
  title: string;
  step?: { current: number; total: number };
  onBack?: () => void;
  children: React.ReactNode;
  bottomCTA?: { label: string; onPress: () => void; disabled?: boolean };
}

export function FormLayout({ title, step, onBack, children, bottomCTA }: FormLayoutProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        {step && <Text style={styles.stepText}>{step.current}/{step.total}</Text>}
      </View>
      {step && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step.current / step.total) * 100}%` }]} />
        </View>
      )}
      <ScrollView style={styles.body} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {bottomCTA && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.ctaButton, bottomCTA.disabled && styles.ctaDisabled]}
            onPress={bottomCTA.onPress}
            disabled={bottomCTA.disabled}
            activeOpacity={0.8}
          >
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
  },
  backBtn: { paddingRight: spacing.md },
  backIcon: { ...typography.sectionTitle, color: colors.textDark },
  title: { ...typography.subtitle, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  stepText: { ...typography.detail, color: colors.textSecondary },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: spacing.screenHorizontal,
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primaryBlue,
    borderRadius: 2,
  },
  body: { flex: 1 },
  content: { paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.xxl, paddingBottom: 100 },
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
  ctaDisabled: { backgroundColor: colors.grey300 },
  ctaText: { color: colors.white, ...typography.label, fontWeight: '700' },
});
