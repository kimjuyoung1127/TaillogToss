/**
 * FormLayout (패턴C) — 입력폼형 레이아웃
 * 설문 7단계, 반려견 추가, 기록 상세 등에 사용. ProgressBar + KeyboardAvoid + BottomCTA
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

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
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { paddingRight: 12 },
  backIcon: { fontSize: 20, color: '#333D4B' },
  title: { fontSize: 18, fontWeight: '600', color: '#202632', flex: 1 },
  stepText: { fontSize: 14, color: '#8B95A1' },
  progressBar: {
    height: 3,
    backgroundColor: '#E5E8EB',
    marginHorizontal: 20,
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    backgroundColor: '#0064FF',
    borderRadius: 2,
  },
  body: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100 },
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
  ctaDisabled: { backgroundColor: '#D1D6DB' },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
