/**
 * LottieAnimation — Lottie JSON 애니메이션 래퍼
 * @granite-js/native/lottie-react-native 기반.
 * Parity: UI-001
 */
import React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LottieView from '@granite-js/native/lottie-react-native';

/** 사전 등록된 Lottie 에셋 키 */
export type LottieAssetKey =
  | 'cute-doggie'      // 걷는 강아지 — welcome, 온보딩 로딩
  | 'jackie'           // 걷는 강아지 상세 — 대시보드 로딩
  | 'long-dog'         // 닥스훈트 — 빈 상태 (로그/코칭)
  | 'happy-dog'        // 행복한 강아지 — B2B 빈 상태 / 보호자 리포트
  | 'perrito-corriendo'; // 달리는 강아지 — 생성 로딩 (코칭/리포트 생성 중)

const LOTTIE_SOURCES: Record<LottieAssetKey, ReturnType<typeof require>> = {
  'cute-doggie': require('../../assets/lottie/cute-doggie.json'),
  'jackie': require('../../assets/lottie/jackie.json'),
  'long-dog': require('../../assets/lottie/long-dog.json'),
  'happy-dog': require('../../assets/lottie/happy-dog.json'),
  'perrito-corriendo': require('../../assets/lottie/perrito-corriendo.json'),
};

export interface LottieAnimationProps {
  /** 사전 등록된 에셋 키 */
  asset: LottieAssetKey;
  /** 너비/높이. 기본 200 */
  size?: number;
  /** 자동 재생 여부. 기본 true */
  autoPlay?: boolean;
  /** 반복 재생. 기본 true */
  loop?: boolean;
  /** 추가 스타일 */
  style?: ViewStyle;
}

export function LottieAnimation({
  asset,
  size = 200,
  autoPlay = true,
  loop = true,
  style,
}: LottieAnimationProps) {
  return (
    <LottieView
      source={LOTTIE_SOURCES[asset]}
      autoPlay={autoPlay}
      loop={loop}
      style={[styles.base, { width: size, height: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'center',
  },
});
