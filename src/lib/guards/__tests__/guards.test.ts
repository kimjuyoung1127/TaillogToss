import { authGuard } from '../authGuard';
import { onboardingGuard } from '../onboardingGuard';
import { featureGuard } from '../featureGuard';
import { resolveDeepEntry, rewriteInitialUrlForDeepEntry } from '../deepEntry';

describe('guards', () => {
  test('authGuard redirects unauthenticated users', () => {
    const result = authGuard({ isAuthenticated: false, currentPath: '/dashboard' });
    expect(result).toEqual({ allow: false, redirectTo: '/login' });
  });

  test('onboardingGuard redirects not-completed users', () => {
    const result = onboardingGuard({
      hasCompletedOnboarding: false,
      currentPath: '/dashboard',
    });
    expect(result).toEqual({ allow: false, redirectTo: '/onboarding/welcome' });
  });

  test('featureGuard blocks free multi-dog over limit', () => {
    const result = featureGuard({
      requirement: 'multiDog',
      isPro: false,
      dogCount: 1,
    });
    expect(result).toEqual({ allow: false, redirectTo: '/settings/subscription' });
  });

  test('deep entry resolves quick-log route', () => {
    const route = resolveDeepEntry('granite://taillog-toss?entry=quick-log');
    expect(route).toBe('/dashboard/quick-log');
  });

  test('deep entry with invalid value falls back to dashboard', () => {
    const route = resolveDeepEntry('granite://taillog-toss?entry=unknown-feature');
    expect(route).toBe('/dashboard');
  });

  test('deep entry rewrite removes entry and keeps other query params', () => {
    const rewritten = rewriteInitialUrlForDeepEntry(
      'granite://taillog-toss?entry=quick-log&type=barking&location=home',
      'granite'
    );

    expect(rewritten).toContain('/dashboard/quick-log');
    expect(rewritten).toContain('type=barking');
    expect(rewritten).toContain('location=home');
    expect(rewritten).not.toContain('entry=');
  });
});
