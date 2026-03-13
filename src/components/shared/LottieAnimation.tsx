/**
 * LottieAnimation — Lottie JSON 애니메이션 래퍼
 * @granite-js/native/lottie-react-native 기반.
 * Parity: UI-001
 */
import React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LottieView from '@granite-js/native/lottie-react-native';

/** 사전 등록된 Lottie 에셋 키 */
export type LottieAssetKey = 'cute-doggie' | 'jackie' | 'long-dog';

const LOTTIE_SOURCES: Record<LottieAssetKey, ReturnType<typeof require>> = {
  'cute-doggie': require('../../assets/lottie/cute-doggie.json'),
  'jackie': require('../../assets/lottie/jackie.json'),
  'long-dog': require('../../assets/lottie/long-dog.json'),
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
