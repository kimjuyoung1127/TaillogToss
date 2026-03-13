/**
 * featureGuard — 기능 레벨 접근 제어 (PRO/멀티독/B2B)
 * Parity: B2B-001
 */
import type { UserRole } from 'types/auth';
import type { GuardResult } from './authGuard';

export type FeatureRequirement = 'multiDog' | 'proOnly' | 'b2bOnly';

/** B2B 역할 목록 */
const B2B_ROLES: UserRole[] = ['trainer', 'org_owner', 'org_staff'];

interface FeatureGuardInput {
  requirement: FeatureRequirement;
  isPro: boolean;
  dogCount: number;
  userRole?: UserRole;
}

export function featureGuard({ requirement, isPro, dogCount, userRole }: FeatureGuardInput): GuardResult {
  if (requirement === 'b2bOnly') {
    if (!userRole || !B2B_ROLES.includes(userRole)) {
      return { allow: false, redirectTo: '/dashboard' };
    }
    return { allow: true };
  }

  if (requirement === 'proOnly' && !isPro) {
    return { allow: false, redirectTo: '/settings/subscription' };
  }

  if (requirement === 'multiDog' && !isPro && dogCount >= 1) {
    return { allow: false, redirectTo: '/settings/subscription' };
  }

  return { allow: true };
}
