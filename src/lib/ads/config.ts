/**
 * 토스 Ads SDK 2.0 ver2 설정 — 공식 인터페이스 기준
 * loadFullScreenAd / showFullScreenAd / adGroupId / destroy 패턴.
 * 사업자등록 후 실제 adGroupId로 교체. 현재 테스트 ID 사용.
 * Parity: AD-001
 */
import type { AdPlacement } from 'types/ads';

/** Ad Group ID 매핑 (사업자등록 후 Developers Console에서 발급) */
const AD_GROUP_IDS: Record<AdPlacement, string> = {
  R1: 'ait-ad-test-rewarded-id', // survey-result
  R2: 'ait-ad-test-rewarded-id', // dashboard/analysis
  R3: 'ait-ad-test-rewarded-id', // coaching-result
};

export function getAdGroupId(placement: AdPlacement): string {
  return AD_GROUP_IDS[placement];
}

/**
 * 토스 Ads SDK 2.0 ver2 공식 인터페이스
 * loadFullScreenAd({ adGroupId }) → showFullScreenAd() → destroy()
 */
export interface TossAdsSdk {
  loadFullScreenAd(options: { adGroupId: string }): Promise<void>;
  showFullScreenAd(): Promise<{ rewarded: boolean }>;
  isAdLoaded(): boolean;
  destroy(): void;
}

/** Mock SDK — 1초 후 보상 지급 시뮬레이션 */
export function createMockAdsSdk(): TossAdsSdk {
  let loaded = false;

  return {
    async loadFullScreenAd(options: { adGroupId: string }) {
      void options;
      await delay(300);
      loaded = true;
    },
    async showFullScreenAd() {
      if (!loaded) throw new Error('Ad not loaded');
      loaded = false;
      await delay(700);
      return { rewarded: true };
    },
    isAdLoaded() {
      return loaded;
    },
    destroy() {
      loaded = false;
    },
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * SDK 싱글턴 — 사업자등록 후 실제 토스 Ads SDK로 교체
 * TODO: import { createAdsClient } from '@apps-in-toss/ads'; 후 실구현체 반환
 */
let sdkInstance: TossAdsSdk | null = null;

export function getAdsSdk(): TossAdsSdk {
  if (!sdkInstance) {
    sdkInstance = createMockAdsSdk();
  }
  return sdkInstance;
}
