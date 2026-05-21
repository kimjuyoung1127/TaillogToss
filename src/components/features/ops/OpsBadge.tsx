/**
 * OpsBadge — Ops 큐 상태 Badge (기록 전/확인 필요/리포트 필요/공유 완료)
 * Parity: B2B-001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from 'styles/tokens';

export type OpsStatus = 'unrecorded' | 'needs_check' | 'needs_report' | 'shared';

interface OpsBadgeProps {
  status: OpsStatus;
}

const STATUS_CONFIG: Record<OpsStatus, { label: string; bg: string; color: string }> = {
  unrecorded: { label: '기록 전', bg: colors.badgeGreyBg, color: colors.badgeGrey },
  needs_check: { label: '확인 필요', bg: colors.badgeAmberBg, color: colors.badgeAmber },
  needs_report: { label: '리포트 필요', bg: colors.badgeBlueBg, color: colors.badgeBlue },
  shared: { label: '공유 완료', bg: colors.badgeGreenBg, color: colors.badgeGreen },
};

export function OpsBadge({ status }: OpsBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    ...typography.badge,
    fontWeight: '600',
  },
});
