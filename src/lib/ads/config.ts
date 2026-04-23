/**
 * 토스 Ads SDK 2.0 ver2 설정 — 공식 인터페이스 기준
 * loadFullScreenAd / showFullScreenAd / adGroupId / destroy 패턴.
 * 사업자등록 후 실제 adGroupId로 교체. 현재 테스트 ID 사용.
 * Parity: AD-001
 */
import type { AdPlacement } from 'types/ads';

/** Ad Group ID 매핑 (사업자등록 후 Developers Console에서 발급)
 * 환경변수 AIT_AD_R1/R2/R3 설정 시 실 ID 사용, 없으면 테스트 ID fallback
 */
const AD_GROUP_IDS: Record<AdPlacement, string> = {
  R1: process.env.AIT_AD_R1 || 'ait-ad-test-rewarded-id', // survey-result
  R2: process.env.AIT_AD_R2 || 'ait-ad-test-rewarded-id', // dashboard/analysis
  R3: process.env.AIT_AD_R3 || 'ait-ad-test-rewarded-id', // coaching-result
};

export function getAdGroupId(placement: AdPlacement): string {
  return AD_GROUP_IDS[placement];
}

/**
 * 토스 Ads SDK 2.0 ver2 공식 인터페이스 — 이벤트 콜백 패턴
 * loadFullScreenAd({ adGroupId, onLoaded, onError })
 * → showFullScreenAd({ onRewarded, onClosed, onError })
 * → destroy()
 */
export interface AdLoadCallbacks {
  onLoaded: () => void;
  onError: (error: Error) => void;
}

export interface AdShowCallbacks {
  onRewarded: () => void;
  onClosed: () => void;
  onError: (error: Error) => void;
}

export interface TossAdsSdk {
  loadFullScreenAd(options: { adGroupId: string } & AdLoadCallbacks): void;
  showFullScreenAd(callbacks: AdShowCallbacks): void;
  isAdLoaded(): boolean;
  destroy(): void;
}

/** Mock SDK — 콜백 패턴으로 보상 지급 시뮬레이션 */
export function createMockAdsSdk(): TossAdsSdk {
  let loaded = false;

  return {
    loadFullScreenAd({ onLoaded, onError }) {
      setTimeout(() => {
        try {
          loaded = true;
          onLoaded();
        } catch (err) {
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      }, 300);
    },
    showFullScreenAd({ onRewarded, onError }) {
      if (!loaded) {
        onError(new Error('Ad not loaded'));
        return;
      }
      loaded = false;
      setTimeout(() => {
        try {
          onRewarded();
        } catch (err) {
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      }, 700);
    },
    isAdLoaded() {
      return loaded;
    },
    destroy() {
      loaded = false;
    },
  };
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
