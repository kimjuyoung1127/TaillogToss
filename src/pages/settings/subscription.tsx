/**
 * 구독/결제 관리 화면 — Card Stack 레이아웃 (PRO 플랜 + 토큰 IAP)
 * 패턴 B(상세형): Navbar + ScrollView + 플랜 카드 + BottomCTA
 * Parity: APP-001, IAP-001
 */
import { createRoute, useNavigation } from '@granite-js/react-native';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from 'stores/AuthContext';
import { isB2BRole } from 'stores/OrgContext';
import { usePageGuard } from 'lib/hooks/usePageGuard';
import { useCurrentSubscription, useIsPro, usePurchaseIAP, useRestoreSubscription } from 'lib/hooks/useSubscription';
import { IAP_PRODUCTS, DOG_LIMITS } from 'types/subscription';
import { B2B_IAP_PRODUCTS } from 'types/b2b';
import type { IAPProduct } from 'types/subscription';

export const Route = createRoute('/settings/subscription', {
  component: SubscriptionPage,
});

const PRO_FEATURES = [
  { icon: '🤖', label: 'AI 코칭 무제한' },
  { icon: '🐕', label: `멀티독 최대 ${DOG_LIMITS.PRO}마리` },
  { icon: '📋', label: '전체 커리큘럼 7종 접근' },
  { icon: '📊', label: '상세 분석 리포트' },
  { icon: '📅', label: '7일 훈련 계획 + Plan B/C' },
] as const;

const FREE_FEATURES = [
  { label: 'AI 코칭', free: '광고 시청 시 1회', pro: '무제한' },
  { label: '멀티독', free: `${DOG_LIMITS.FREE}마리`, pro: `${DOG_LIMITS.PRO}마리` },
  { label: '커리큘럼', free: 'AI 추천 1개', pro: '7종 전체' },
  { label: '코칭 블록', free: '3블록(기본)', pro: '6블록(전체)' },
  { label: '훈련 계획', free: '기본 Plan A', pro: 'Plan A/B/C' },
] as const;

function SubscriptionPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isReady } = usePageGuard({ currentPath: '/settings/subscription' });
  const { data: subscription, isLoading } = useCurrentSubscription(user?.id);
  const isPro = useIsPro(user?.id);
  const purchaseMutation = usePurchaseIAP();
  const restoreMutation = useRestoreSubscription();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handlePurchase = useCallback((productId: string) => {
    setPurchasingId(productId);
    purchaseMutation.mutate(
      {
        product_id: productId,
        idempotency_key: `idem_${Date.now().toString(36)}_${productId}`,
      },
      {
        onSuccess: () => {
          setPurchasingId(null);
          Alert.alert('구매 완료', '구매가 완료되었습니다.');
        },
        onError: () => {
          setPurchasingId(null);
          Alert.alert('구매 실패', '결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
        },
      }
    );
  }, [purchaseMutation]);

  const handleRestore = useCallback(() => {
    if (!user?.id) return;
    restoreMutation.mutate(user.id, {
      onSuccess: () => Alert.alert('복원 완료', '구독 정보가 복원되었습니다.'),
      onError: () => Alert.alert('복원 실패', '복원할 구독 정보가 없습니다.'),
    });
  }, [user?.id, restoreMutation]);

  if (!isReady) return null;

  const proProduct = IAP_PRODUCTS.PRO_MONTHLY as IAPProduct;
  const token10 = IAP_PRODUCTS.AI_TOKEN_10 as IAPProduct;
  const token30 = IAP_PRODUCTS.AI_TOKEN_30 as IAPProduct;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>구독 관리</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        {/* 현재 구독 상태 */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>현재 플랜</Text>
            <View style={[styles.badge, isPro ? styles.badgePro : styles.badgeFree]}>
              <Text style={[styles.badgeText, isPro ? styles.badgeTextPro : styles.badgeTextFree]}>
                {isPro ? 'PRO' : 'FREE'}
              </Text>
            </View>
          </View>
          {isPro && subscription?.next_billing_date && (
            <Text style={styles.billingDate}>
              다음 결제일: {subscription.next_billing_date.slice(0, 10)}
            </Text>
          )}
          {!isPro && subscription && subscription.ai_tokens_remaining > 0 && (
            <Text style={styles.tokenInfo}>
              AI 토큰 잔여: {subscription.ai_tokens_remaining}회
            </Text>
          )}
          {isLoading && <Text style={styles.loadingText}>구독 정보 확인 중...</Text>}
        </View>

        {/* PRO 플랜 카드 */}
        {!isPro && (
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>PRO 월간 플랜</Text>
              <Text style={styles.planPrice}>
                ₩{proProduct.price.toLocaleString()}
                <Text style={styles.planPeriod}>/월</Text>
              </Text>
            </View>
            <View style={styles.featureList}>
              {PRO_FEATURES.map((f) => (
                <View key={f.label} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.purchaseButton, purchasingId === 'pro_monthly' && styles.buttonDisabled]}
              onPress={() => handlePurchase('pro_monthly')}
              disabled={!!purchasingId}
              activeOpacity={0.8}
            >
              <Text style={styles.purchaseButtonText}>
                {purchasingId === 'pro_monthly' ? '처리 중...' : 'PRO 시작하기'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 토큰 팩 */}
        <Text style={styles.sectionTitle}>AI 토큰 충전</Text>
        <View style={styles.tokenRow}>
          <View style={styles.tokenCard}>
            <Text style={styles.tokenAmount}>10회</Text>
            <Text style={styles.tokenPrice}>₩{token10.price.toLocaleString()}</Text>
            <Text style={styles.tokenUnit}>회당 ₩190</Text>
            <TouchableOpacity
              style={[styles.tokenButton, purchasingId === 'ai_token_10' && styles.buttonDisabled]}
              onPress={() => handlePurchase('ai_token_10')}
              disabled={!!purchasingId}
              activeOpacity={0.8}
            >
              <Text style={styles.tokenButtonText}>
                {purchasingId === 'ai_token_10' ? '...' : '충전'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tokenCard}>
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>추천</Text>
            </View>
            <Text style={styles.tokenAmount}>30회</Text>
            <Text style={styles.tokenPrice}>₩{token30.price.toLocaleString()}</Text>
            <Text style={styles.tokenUnit}>회당 ₩163</Text>
            <TouchableOpacity
              style={[styles.tokenButton, styles.tokenButtonHighlight, purchasingId === 'ai_token_30' && styles.buttonDisabled]}
              onPress={() => handlePurchase('ai_token_30')}
              disabled={!!purchasingId}
              activeOpacity={0.8}
            >
              <Text style={[styles.tokenButtonText, styles.tokenButtonTextHighlight]}>
                {purchasingId === 'ai_token_30' ? '...' : '충전'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FREE vs PRO 비교 테이블 */}
        <Text style={styles.sectionTitle}>플랜 비교</Text>
        <View style={styles.compareTable}>
          <View style={styles.compareHeader}>
            <Text style={[styles.compareCell, styles.compareLabelCell]}>기능</Text>
            <Text style={[styles.compareCell, styles.compareValueCell]}>FREE</Text>
            <Text style={[styles.compareCell, styles.compareValueCell, styles.compareProCell]}>PRO</Text>
          </View>
          {FREE_FEATURES.map((row) => (
            <View key={row.label} style={styles.compareRow}>
              <Text style={[styles.compareCell, styles.compareLabelCell]}>{row.label}</Text>
              <Text style={[styles.compareCell, styles.compareValueCell]}>{row.free}</Text>
              <Text style={[styles.compareCell, styles.compareValueCell, styles.compareProValue]}>{row.pro}</Text>
            </View>
          ))}
        </View>

        {/* B2B 플랜 (B2B 역할일 때만 표시) */}
        {isB2BRole(user?.role) && (
          <>
            <Text style={styles.sectionTitle}>센터/훈련사 플랜</Text>
            <View style={styles.b2bGrid}>
              {Object.values(B2B_IAP_PRODUCTS).map((product: IAPProduct) => (
                <View key={product.product_id} style={styles.b2bCard}>
                  <Text style={styles.b2bName}>{product.name}</Text>
                  <Text style={styles.b2bPrice}>₩{product.price.toLocaleString()}/월</Text>
                  <Text style={styles.b2bDesc}>{product.description}</Text>
                  <TouchableOpacity
                    style={[styles.tokenButton, styles.tokenButtonHighlight, purchasingId === product.product_id && styles.buttonDisabled]}
                    onPress={() => handlePurchase(product.product_id)}
                    disabled={!!purchasingId}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tokenButtonText, styles.tokenButtonTextHighlight]}>
                      {purchasingId === product.product_id ? '...' : '구독'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 구독 복원 */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} activeOpacity={0.7}>
          <Text style={styles.restoreText}>구매 내역 복원</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  backButton: { fontSize: 22, color: '#202632', paddingRight: 8 },
  navTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: '#202632', textAlign: 'center' },
  navSpacer: { width: 30 },
  body: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  /* 현재 상태 카드 */
  statusCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 16, fontWeight: '600', color: '#333D4B' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgePro: { backgroundColor: '#0064FF' },
  badgeFree: { backgroundColor: '#E5E8EB' },
  badgeText: { fontSize: 13, fontWeight: '700' },
  badgeTextPro: { color: '#FFFFFF' },
  badgeTextFree: { color: '#6B7280' },
  billingDate: { fontSize: 13, color: '#6B7280', marginTop: 8 },
  tokenInfo: { fontSize: 13, color: '#0064FF', marginTop: 8 },
  loadingText: { fontSize: 13, color: '#9CA3AF', marginTop: 8 },

  /* PRO 플랜 카드 */
  planCard: {
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#0064FF20',
  },
  planHeader: { marginBottom: 16 },
  planTitle: { fontSize: 18, fontWeight: '700', color: '#0064FF' },
  planPrice: { fontSize: 28, fontWeight: '800', color: '#202632', marginTop: 4 },
  planPeriod: { fontSize: 14, fontWeight: '400', color: '#6B7280' },
  featureList: { marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureIcon: { fontSize: 16, marginRight: 10 },
  featureLabel: { fontSize: 15, color: '#333D4B' },
  purchaseButton: {
    backgroundColor: '#0064FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  purchaseButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  /* 토큰 팩 */
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333D4B', marginBottom: 12 },
  tokenRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  tokenCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  bestValueBadge: {
    backgroundColor: '#FF6B00',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  bestValueText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  tokenAmount: { fontSize: 20, fontWeight: '800', color: '#202632', marginBottom: 4 },
  tokenPrice: { fontSize: 16, fontWeight: '600', color: '#333D4B' },
  tokenUnit: { fontSize: 12, color: '#9CA3AF', marginTop: 2, marginBottom: 12 },
  tokenButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  tokenButtonHighlight: {
    backgroundColor: '#0064FF',
    borderColor: '#0064FF',
  },
  tokenButtonText: { fontSize: 14, fontWeight: '600', color: '#333D4B' },
  tokenButtonTextHighlight: { color: '#FFFFFF' },

  /* 비교 테이블 */
  compareTable: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    overflow: 'hidden',
    marginBottom: 24,
  },
  compareHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    paddingVertical: 10,
  },
  compareRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
    paddingVertical: 10,
  },
  compareCell: { paddingHorizontal: 12, fontSize: 13 },
  compareLabelCell: { flex: 2, fontWeight: '600', color: '#333D4B' },
  compareValueCell: { flex: 2, color: '#6B7280', textAlign: 'center' },
  compareProCell: { color: '#0064FF', fontWeight: '600' },
  compareProValue: { color: '#0064FF' },

  /* 복원 */
  restoreButton: { alignItems: 'center', paddingVertical: 12 },
  restoreText: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'underline' },

  /* B2B */
  b2bGrid: { gap: 12, marginBottom: 28 },
  b2bCard: {
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  b2bName: { fontSize: 16, fontWeight: '700', color: '#166534', marginBottom: 4 },
  b2bPrice: { fontSize: 20, fontWeight: '800', color: '#202632', marginBottom: 4 },
  b2bDesc: { fontSize: 13, color: '#6B7280', marginBottom: 12 },

  /* 공통 */
  buttonDisabled: { opacity: 0.5 },
});
