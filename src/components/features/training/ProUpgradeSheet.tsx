/**
 * ProUpgradeSheet — Pro 전용 기능 접근 시 인터셉트 바텀시트
 * 시트 안에서 IAP 구매까지 완결 처리
 * Parity: UI-001, IAP-001
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Image } from 'react-native';
import { ModalLayout } from 'components/shared/layouts/ModalLayout';
import { usePurchaseIAP } from 'lib/hooks/useSubscription';
import { ICONS } from 'lib/data/iconSources';
import { IAP_PRODUCTS } from 'types/subscription';
import { colors, typography, spacing } from 'styles/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const BENEFITS = [
  { icon: ICONS['ic-analysis'], text: '심화 인사이트 리포트' },
  { icon: ICONS['badge-pro'], text: '광고 없이 이용' },
  { icon: ICONS['ic-report'], text: '시도 이력 상세 조회' },
  { icon: ICONS['ic-coaching'], text: '하루 코칭 10회 (무료 3회)' },
  { icon: ICONS['ic-training'], text: '훈련 Plan B/C 전체 접근' },
];

const proProduct = IAP_PRODUCTS.PRO_MONTHLY!;

export function ProUpgradeSheet({ visible, onClose }: Props) {
  const purchaseMutation = usePurchaseIAP();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleUpgrade = () => {
    if (isPurchasing) return;
    setIsPurchasing(true);
    purchaseMutation.mutate(proProduct.product_id, {
      onSuccess: (granted) => {
        setIsPurchasing(false);
        if (granted) {
          onClose();
          Alert.alert('구독 완료', 'PRO 구독이 시작되었어요!');
        } else {
          Alert.alert('결제 실패', '결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
        }
      },
      onError: () => {
        setIsPurchasing(false);
        Alert.alert('결제 실패', '결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ModalLayout title="PRO 전용 기능" onClose={onClose}>
        <View style={styles.content}>
          <Image source={{ uri: ICONS['badge-pro'] }} style={styles.icon} resizeMode="contain" />
          <Text style={styles.title}>PRO 구독으로 더 깊이 분석하세요</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₩{proProduct.price.toLocaleString()}</Text>
            <Text style={styles.period}>/월</Text>
          </View>

          <View style={styles.benefitList}>
            {BENEFITS.map((b) => (
              <View key={b.text} style={styles.benefitRow}>
                <Image source={{ uri: b.icon }} style={styles.benefitIcon} resizeMode="contain" />
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.ctaButton, isPurchasing && styles.ctaButtonDisabled]}
            onPress={handleUpgrade}
            activeOpacity={0.8}
            disabled={isPurchasing}
          >
            <Text style={styles.ctaText}>
              {isPurchasing ? '처리 중...' : 'PRO 시작하기'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.dismissText}>다음에</Text>
          </TouchableOpacity>
        </View>
      </ModalLayout>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  icon: {
    width: 44,
    height: 44,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  price: {
    ...typography.heroTitle,
    fontWeight: '800',
    color: colors.primaryBlue,
  },
  period: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 3,
    marginLeft: 2,
  },
  benefitList: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitIcon: {
    width: 24,
    height: 24,
  },
  benefitText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: colors.blue900,
    borderRadius: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    ...typography.label,
    fontWeight: '700',
    color: colors.white,
  },
  dismissButton: {
    paddingVertical: spacing.sm,
  },
  dismissText: {
    ...typography.detail,
    color: colors.textSecondary,
  },
});
