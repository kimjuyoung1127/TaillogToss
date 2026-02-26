/**
 * useSubscription 훅 — 구독 상태 + IAP 구매
 * Parity: IAP-001
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'lib/api/queryKeys';
import { tracker } from 'lib/analytics/tracker';
import * as subApi from 'lib/api/subscription';
import type { PurchaseRequest } from 'types/subscription';

export function useCurrentSubscription(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.subscription.current(userId ?? ''),
    queryFn: () => subApi.getSubscription(userId!),
    enabled: !!userId,
  });
}

export function useIsPro(userId: string | undefined) {
  const { data } = useCurrentSubscription(userId);
  return data?.plan_type === 'PRO_MONTHLY' && data?.is_active;
}

export function usePurchaseIAP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: PurchaseRequest) => subApi.verifyIAPOrder(request),
    onSuccess: (_data, variables) => {
      tracker.iapPurchaseSuccess(variables.product_id);
      void qc.invalidateQueries({ queryKey: queryKeys.subscription.all });
    },
  });
}

export function useRestoreSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => subApi.restoreSubscription(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.subscription.all });
    },
  });
}
