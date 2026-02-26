/**
 * useNotification 훅 — 알림 이력 조회
 * Parity: MSG-001
 */
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'lib/api/queryKeys';
import * as notiApi from 'lib/api/notification';

export function useNotificationHistory(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.notification.history(userId ?? ''),
    queryFn: () => notiApi.getNotificationHistory(userId!),
    enabled: !!userId,
  });
}
