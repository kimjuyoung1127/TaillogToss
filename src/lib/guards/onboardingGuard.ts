import type { GuardResult } from './authGuard';

interface OnboardingGuardInput {
  hasCompletedOnboarding: boolean;
  currentPath: string;
}

export function onboardingGuard({ hasCompletedOnboarding, currentPath }: OnboardingGuardInput): GuardResult {
  if (currentPath === '/onboarding/welcome') return { allow: true };

  if (!hasCompletedOnboarding) {
    if (currentPath.startsWith('/onboarding/')) return { allow: true };
    return { allow: false, redirectTo: '/onboarding/welcome' };
  }

  if (hasCompletedOnboarding && currentPath.startsWith('/onboarding/')) {
    return { allow: false, redirectTo: '/dashboard' };
  }

  return { allow: true };
}
