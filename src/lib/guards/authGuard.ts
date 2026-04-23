export type GuardRoute =
  | '/onboarding/welcome'
  | '/settings/subscription'
  | '/dashboard'
  | '/dashboard/quick-log'
  | '/coaching/result'
  | '/training/academy'
  | '/ops/today';

export type GuardResult =
  | { allow: true }
  | { allow: false; redirectTo: GuardRoute };

interface AuthGuardInput {
  isAuthenticated: boolean;
  currentPath: string;
}

export function authGuard({ isAuthenticated, currentPath }: AuthGuardInput): GuardResult {
  if (isAuthenticated) return { allow: true };
  if (currentPath === '/onboarding/welcome') return { allow: true };
  return { allow: false, redirectTo: '/onboarding/welcome' };
}
