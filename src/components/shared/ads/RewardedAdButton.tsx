/**
 * RewardedAdButton — 토스 Ads SDK 2.0 래퍼 (mock)
 * R1(survey-result), R2(dashboard), R3(coaching-result) 터치포인트
 * 실패 시 무광고 폴백 (콘텐츠 무료 해제)
 * Parity: UI-001
 */
import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import type { AdPlacement, RewardedAdState } from 'types/ads';
import { DEFAULT_AD_FALLBACK } from 'types/ads';

export interface RewardedAdButtonProps {
  placement: AdPlacement;
  label?: string;
  onRewarded: () => void;
  onError?: () => void;
}

export function RewardedAdButton({
  placement,
  label = '광고 보고 잠금 해제',
  onRewarded,
  onError,
}: RewardedAdButtonProps) {
  void placement; // TODO: 사업자등록 후 placement별 ad unit ID 매핑
  void onError; // TODO: 에러 핸들링 연결
  const [adState, setAdState] = useState<RewardedAdState>('idle');

  const handlePress = useCallback(async () => {
    setAdState('loading');

    // TODO: 사업자등록 후 실제 토스 Ads SDK 호출로 교체
    // mock: 1초 후 보상 지급
    const timer = setTimeout(() => {
      setAdState('rewarded');
      onRewarded();
    }, 1000);

    // 타임아웃 폴백
    const fallbackTimer = setTimeout(() => {
      if (adState === 'loading') {
        setAdState('no_fill');
        // 무광고 폴백 — 콘텐츠 무료 해제
        if (DEFAULT_AD_FALLBACK.unlock_on_no_fill) {
          onRewarded();
        }
      }
    }, DEFAULT_AD_FALLBACK.timeout_ms);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [adState, onRewarded]);

  if (adState === 'rewarded') {
    return null; // 보상 지급 완료 → 버튼 숨김
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={adState === 'loading'}
      activeOpacity={0.8}
    >
      {adState === 'loading' ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.inner}>
          <Text style={styles.icon}>{'\uD83C\uDFAC'}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
