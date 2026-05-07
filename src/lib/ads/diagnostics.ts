/**
 * Ads diagnostics — SDK callback payload를 안전하게 tracker 로그에 싣기 위한 요약 유틸.
 * Parity: AD-001
 */
import type { AdPlacement, BannerPlacement, InterstitialPlacement } from 'types/ads';
import {
  AD_PLACEMENT_CONFIG,
  BANNER_PLACEMENT_CONFIG,
  INTERSTITIAL_PLACEMENT_CONFIG,
} from 'types/ads';
import { getAdGroupId, TEST_AD_GROUP_PREFIX } from 'lib/ads/config';
import type { AdEventContext } from 'lib/analytics/tracker';

type AllPlacement = AdPlacement | BannerPlacement | InterstitialPlacement;

function getPlacementMeta(placement: AllPlacement): Pick<AdEventContext, 'screen' | 'variant'> {
  if (placement in BANNER_PLACEMENT_CONFIG) {
    const config = BANNER_PLACEMENT_CONFIG[placement as BannerPlacement];
    return { screen: config.screen, variant: config.variant };
  }
  if (placement in INTERSTITIAL_PLACEMENT_CONFIG) {
    const config = INTERSTITIAL_PLACEMENT_CONFIG[placement as InterstitialPlacement];
    return { screen: config.screen };
  }
  const config = AD_PLACEMENT_CONFIG[placement as AdPlacement];
  return { screen: config.screen };
}

function safeStringify(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return value.slice(0, 500);
  try {
    return JSON.stringify(value).slice(0, 500);
  } catch {
    return String(value).slice(0, 500);
  }
}

function pickRawDetails(raw: unknown): Pick<AdEventContext, 'code' | 'message' | 'name' | 'details'> {
  if (!raw) return {};
  if (raw instanceof Error) {
    return { name: raw.name, message: raw.message };
  }
  if (typeof raw !== 'object') {
    return { message: safeStringify(raw) };
  }

  const record = raw as Record<string, unknown>;
  const details: Record<string, string> = {};
  for (const key of ['status', 'reason', 'domain', 'nativeErrorCode', 'responseCode']) {
    const value = safeStringify(record[key]);
    if (value) details[key] = value;
  }

  return {
    code: safeStringify(record.code),
    message: safeStringify(record.message ?? record.error ?? record.description),
    name: safeStringify(record.name),
    details: Object.keys(details).length > 0 ? details : safeStringify(raw),
  };
}

export function buildAdDiagnostics(
  placement: AllPlacement,
  phase: string,
  raw?: unknown,
): AdEventContext {
  const adGroupId = getAdGroupId(placement);
  return {
    ...getPlacementMeta(placement),
    phase,
    ad_group_id: adGroupId,
    mock_mode: adGroupId.startsWith(TEST_AD_GROUP_PREFIX),
    ...pickRawDetails(raw),
  };
}
