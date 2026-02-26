import { authGuard, onboardingGuard, featureGuard } from 'lib/guards';
import type { FeatureRequirement, GuardResult, GuardRoute } from 'lib/guards';

export interface EvaluatePageGuardInput {
  currentPath: string;
  skipAuth: boolean;
  skipOnboarding: boolean;
  requireFeature?: FeatureRequirement;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isPro: boolean;
  dogCount: number;
  isSubscriptionLoading: boolean;
  isDogsLoading: boolean;
}

export type GuardEvaluation =
  | { status: 'allow' }
  | { status: 'pending' }
  | { status: 'redirect'; redirectTo: GuardRoute };

export function evaluatePageGuard(input: EvaluatePageGuardInput): GuardEvaluation {
  const {
    currentPath,
    skipAuth,
    skipOnboarding,
    requireFeature,
    isAuthenticated,
    hasCompletedOnboarding,
    isPro,
    dogCount,
    isSubscriptionLoading,
    isDogsLoading,
  } = input;

  let result: GuardResult = { allow: true };

  if (!skipAuth) {
    result = authGuard({ isAuthenticated, currentPath });
  }

  if (result.allow && !skipOnboarding) {
    result = onboardingGuard({ hasCompletedOnboarding, currentPath });
  }

  if (result.allow && requireFeature) {
    const needsSubscription = requireFeature === 'proOnly' || requireFeature === 'multiDog';
    const needsDogList = requireFeature === 'multiDog';

    if ((needsSubscription && isSubscriptionLoading) || (needsDogList && isDogsLoading)) {
      return { status: 'pending' };
    }

    result = featureGuard({
      requirement: requireFeature,
      isPro,
      dogCount,
    });
  }

  if (!result.allow) {
    return { status: 'redirect', redirectTo: result.redirectTo };
  }

  return { status: 'allow' };
}
