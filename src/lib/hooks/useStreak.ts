import { useMemo } from 'react';
import type { BehaviorLog } from 'types/log';

interface StreakResult {
  streakDays: number;
  lastRecordedAt: string | null;
}

function toDateKey(dateString: string): string {
  return new Date(dateString).toISOString().slice(0, 10);
}

export function useStreak(logs: BehaviorLog[] | undefined): StreakResult {
  return useMemo(() => {
    if (!logs || logs.length === 0) {
      return { streakDays: 0, lastRecordedAt: null };
    }

    const validTimes = logs
      .map((log) => new Date(log.occurred_at).getTime())
      .filter((time) => Number.isFinite(time));

    const lastRecordedAt =
      validTimes.length > 0 ? new Date(Math.max(...validTimes)).toISOString() : null;

    const logDates = new Set(logs.map((log) => toDateKey(log.occurred_at)));
    let streakDays = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const probe = new Date(today);
      probe.setDate(today.getDate() - i);
      const key = probe.toISOString().slice(0, 10);

      if (!logDates.has(key)) break;
      streakDays += 1;
    }

    return { streakDays, lastRecordedAt };
  }, [logs]);
}
