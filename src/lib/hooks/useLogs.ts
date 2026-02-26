/**
 * useLogs 훅 — 행동 기록 조회/생성
 * Parity: LOG-001
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'lib/api/queryKeys';
import * as logApi from 'lib/api/log';
import type { QuickLogInput, DetailedLogInput } from 'types/log';

export function useLogList(dogId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.logs.list(dogId ?? ''),
    queryFn: () => logApi.getLogs(dogId!),
    enabled: !!dogId,
  });
}

export function useDailyLogs(dogId: string | undefined, date: string) {
  return useQuery({
    queryKey: queryKeys.logs.daily(dogId ?? '', date),
    queryFn: () => logApi.getDailyLogs(dogId!, date),
    enabled: !!dogId,
  });
}

export function useCreateQuickLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: QuickLogInput) => logApi.createQuickLog(input),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.logs.list(variables.dog_id) });
    },
  });
}

export function useCreateDetailedLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DetailedLogInput) => logApi.createDetailedLog(input),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.logs.list(variables.dog_id) });
    },
  });
}
