import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@granite-js/react-native';
import { useAuth } from 'stores/AuthContext';
import { useDogList } from 'lib/hooks/useDogs';
import { useCurrentSubscription } from 'lib/hooks/useSubscription';
import type { FeatureRequirement, GuardRoute } from 'lib/guards';
import { evaluatePageGuard } from './pageGuardEvaluator';
import { setPostLoginRedirect } from 'stores/postLoginRedirect';

interface UsePageGuardOptions {
  currentPath: string;
  skipAuth?: boolean;
  skipOnboarding?: boolean;
  requireFeature?: FeatureRequirement;
}

export function usePageGuard(options: UsePageGuardOptions): { isReady: boolean } {
  const { currentPath, skipAuth = false, skipOnboarding = false, requireFeature } = options;
  const navigation = useNavigation();
  const { user, isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();

  const { data: dogs, isLoading: isDogsLoading } = useDogList(user?.id);
  const { data: subscription, isLoading: isSubscriptionLoading } = useCurrentSubscription(user?.id);

  const isPro = subscription?.plan_type === 'PRO_MONTHLY' && subscription?.is_active;
  const dogCount = dogs?.length ?? 0;

  const [isReady, setIsReady] = useState(false);
  const lastRedirectRef = useRef<GuardRoute | null>(null);

  useEffect(() => {
    if (isLoading) {
      setIsReady(false);
      return;
    }

    const evaluated = evaluatePageGuard({
      currentPath,
      skipAuth,
      skipOnboarding,
      requireFeature,
      isAuthenticated,
      hasCompletedOnboarding,
      isPro: Boolean(isPro),
      dogCount,
      isSubscriptionLoading,
      isDogsLoading,
    });

    if (evaluated.status === 'pending') {
      setIsReady(false);
      return;
    }

    if (evaluated.status === 'redirect') {
      if (evaluated.redirectTo === '/login' && currentPath !== '/login') {
        setPostLoginRedirect(currentPath);
      }

      if (lastRedirectRef.current !== evaluated.redirectTo) {
        lastRedirectRef.current = evaluated.redirectTo;
        navigation.navigate(evaluated.redirectTo);
      }
      setIsReady(false);
      return;
    }

    lastRedirectRef.current = null;
    setIsReady(true);
  }, [
    currentPath,
    dogCount,
    hasCompletedOnboarding,
    isAuthenticated,
    isDogsLoading,
    isLoading,
    isPro,
    isSubscriptionLoading,
    navigation,
    requireFeature,
    skipAuth,
    skipOnboarding,
  ]);

  return { isReady };
}
