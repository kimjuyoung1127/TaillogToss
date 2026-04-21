/**
 * PlanCard — 현재 구독 플랜 표시 + 업그레이드 CTA
 * 구독 없음 → "플랜 없음 / 시작하기" 표시
 * Parity: B2B-002
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from 'styles/tokens';
import type { OrgSubscription } from 'types/b2b';
import { B2B_IAP_PRODUCTS } from 'types/b2b';

const STATUS_LABEL: Record<string, string> = {
  active: '활성',
  trial: '평가판',
  expired: '만료됨',
  cancelled: '취소됨',
  suspended: '정지됨',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return iso.slice(0, 10).replace(/-/g, '.');
}

interface PlanCardProps {
  subscription: OrgSubscription | null | undefined;
  isLoading?: boolean;
  onUpgrade: () => void;
}

export function PlanCard({ subscription, isLoading, onUpgrade }: PlanCardProps) {
  const product = subscription ? B2B_IAP_PRODUCTS[subscription.plan_type] : null;
  const statusLabel = subscription ? (STATUS_LABEL[subscription.status] ?? subscription.status) : null;
  const isActive = subscription?.status === 'active' || subscription?.status === 'trial';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>구독 플랜</Text>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>{statusLabel}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.skeleton} />
      ) : subscription && product ? (
        <View>
          <View style={styles.planRow}>
            <Text style={styles.planName}>{product.name}</Text>
            <Text style={styles.planPrice}>
              ₩{subscription.price_krw.toLocaleString()}/월
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>한도</Text>
            <Text style={styles.detailValue}>
              강아지 {subscription.max_dogs}마리 · 직원 {subscription.max_staff}명
            </Text>
          </View>
          {subscription.expires_at && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>만료일</Text>
              <Text style={styles.detailValue}>{formatDate(subscription.expires_at)}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade} activeOpacity={0.8}>
            <Text style={styles.upgradeBtnText}>플랜 업그레이드</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.noplanText}>활성 플랜이 없어요</Text>
          <TouchableOpacity style={styles.startBtn} onPress={onUpgrade} activeOpacity={0.8}>
            <Text style={styles.startBtnText}>플랜 시작하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.label, fontWeight: '700', color: colors.textPrimary },
  activeBadge: {
    backgroundColor: colors.green50,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: { ...typography.caption, fontWeight: '600', color: colors.green500 },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planName: { ...typography.bodySmall, fontWeight: '700', color: colors.textPrimary },
  planPrice: { ...typography.bodySmall, fontWeight: '600', color: colors.primaryBlue },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceTertiary,
  },
  detailLabel: { ...typography.detail, color: colors.badgeGrey },
  detailValue: { ...typography.detail, fontWeight: '600', color: colors.textPrimary },
  upgradeBtn: {
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primaryBlue,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.primaryBlue },
  noplanText: { ...typography.detail, color: colors.textSecondary, marginBottom: spacing.md },
  startBtn: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  startBtnText: { ...typography.bodySmall, fontWeight: '700', color: colors.white },
  skeleton: {
    height: 80,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 8,
  },
});
