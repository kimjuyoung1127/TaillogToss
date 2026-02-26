/**
 * useCoaching 훅 — AI 코칭 결과 조회/피드백
 * Parity: AI-001
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'lib/api/queryKeys';
import * as coachingApi from 'lib/api/coaching';

export function useCoachingList(dogId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.coaching.list(dogId ?? ''),
    queryFn: () => coachingApi.getCoachings(dogId!),
    enabled: !!dogId,
  });
}

export function useLatestCoaching(dogId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.coaching.latest(dogId ?? ''),
    queryFn: () => coachingApi.getLatestCoaching(dogId!),
    enabled: !!dogId,
  });
}

export function useSubmitFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coachingId, score }: { coachingId: string; score: 1 | 2 | 3 | 4 | 5 }) =>
      coachingApi.submitCoachingFeedback(coachingId, score),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.coaching.all });
    },
  });
}
