/**
 * OpsBadge — Ops 큐 상태 Badge (긴급/주의/일반/대기/완료)
 * Parity: B2B-001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from 'styles/tokens';

export type OpsStatus = 'urgent' | 'warning' | 'normal' | 'pending' | 'done';

interface OpsBadgeProps {
  status: OpsStatus;
}

const STATUS_CONFIG: Record<OpsStatus, { label: string; bg: string; color: string }> = {
  urgent: { label: '긴급', bg: colors.badgeRedBg, color: colors.badgeRed },
  warning: { label: '주의', bg: colors.badgeAmberBg, color: colors.badgeAmber },
  normal: { label: '일반', bg: colors.badgeBlueBg, color: colors.badgeBlue },
  pending: { label: '대기', bg: colors.badgeGreyBg, color: colors.badgeGrey },
  done: { label: '완료', bg: colors.badgeGreenBg, color: colors.badgeGreen },
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
