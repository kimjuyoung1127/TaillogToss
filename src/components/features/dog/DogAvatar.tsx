/**
 * DogAvatar — 반려견 프로필 아바타 컴포넌트
 * 사진이 있으면 사진을, 없으면 커스텀 아이콘/로티 폴백 표시
 */
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors } from 'styles/tokens';
import { LottieAnimation } from '../../shared/LottieAnimation';
import { ICONS } from 'lib/data/iconSources';

interface Props {
  /** 프로필 이미지 URL */
  uri?: string | null;
  /** 표시 크기 (기본: 40) */
  size?: number;
  /** 사진 없을 때 보여줄 폴백 유형 */
  fallback?: 'icon' | 'lottie';
}

export function DogAvatar({ uri, size = 40, fallback = 'icon' }: Props) {
  const borderRadius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, { width: size, height: size, borderRadius }]}
      />
    );
  }

  return (
    <View style={[styles.base, styles.fallback, { width: size, height: size, borderRadius }]}>
      {fallback === 'lottie' ? (
        <LottieAnimation asset="cute-doggie" size={size * 0.8} />
      ) : (
        <Image source={{ uri: ICONS['ic-dog'] }} style={{ width: size * 0.58, height: size * 0.58 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.divider,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
});
