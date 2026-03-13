/**
 * ModalLayout (패턴E) — 바텀시트형 레이아웃
 * 빠른 기록, 반려견 전환, Plan B/C 선택 등에 사용
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../../styles/tokens';

export interface ModalLayoutProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  bottomCTA?: { label: string; onPress: () => void };
}

export function ModalLayout({ title, onClose, children, bottomCTA }: ModalLayoutProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>X</Text>
            </TouchableOpacity>
          )}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.grey300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.lg,
  },
  title: { ...typography.subtitle, fontWeight: '600', color: colors.textPrimary },
  closeBtn: { padding: spacing.xs },
  closeIcon: { ...typography.label, color: colors.textSecondary },
  body: { flex: 0 },
  content: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.xxl },
  bottomBar: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  ctaButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  ctaText: { color: colors.white, ...typography.label, fontWeight: '700' },
});
