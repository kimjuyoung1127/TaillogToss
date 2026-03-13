import { useMemo } from 'react';

interface ReengagementResult {
  isInactive3d: boolean;
  daysSinceLast: number;
}

function calcDaysSince(lastRecordedAt: string | null): number {
  if (!lastRecordedAt) return Number.POSITIVE_INFINITY;

  const recordedTime = new Date(lastRecordedAt).getTime();
  if (!Number.isFinite(recordedTime)) return Number.POSITIVE_INFINITY;

  const nowTime = Date.now();
  const diffMs = Math.max(0, nowTime - recordedTime);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function useReengagement(lastRecordedAt: string | null): ReengagementResult {
  return useMemo(() => {
    const daysSinceLast = calcDaysSince(lastRecordedAt);
    const isInactive3d = daysSinceLast >= 3;

    return {
      isInactive3d,
      daysSinceLast,
    };
  }, [lastRecordedAt]);
}
