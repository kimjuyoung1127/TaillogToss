/**
 * useInsightReport — coachingId 기반 인사이트 리포트 데이터 훅
 * 기존 coaching list 캐시에서 해당 코칭 결과를 찾아 반환
 * 별도 API 불필요 — CoachingResult.blocks에 6블록 모두 포함
 * Parity: AI-001
 */
import { useCoachingList } from './useCoaching';

export function useInsightReport(dogId: string | undefined, coachingId: string | undefined) {
  const { data: coachings, isLoading, isError, refetch } = useCoachingList(dogId);

  const coaching = coachingId
    ? (coachings?.find((c) => c.id === coachingId) ?? coachings?.[0] ?? null)
    : (coachings?.[0] ?? null);

  return { coaching, isLoading, isError, refetch };
}
