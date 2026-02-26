import type { GuardResult } from './authGuard';

export type FeatureRequirement = 'multiDog' | 'proOnly';

interface FeatureGuardInput {
  requirement: FeatureRequirement;
  isPro: boolean;
  dogCount: number;
}

export function featureGuard({ requirement, isPro, dogCount }: FeatureGuardInput): GuardResult {
  if (requirement === 'proOnly' && !isPro) {
    return { allow: false, redirectTo: '/settings/subscription' };
  }

  if (requirement === 'multiDog' && !isPro && dogCount >= 1) {
    return { allow: false, redirectTo: '/settings/subscription' };
  }

  return { allow: true };
}
