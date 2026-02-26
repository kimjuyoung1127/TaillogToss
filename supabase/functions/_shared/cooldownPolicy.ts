/**
 * Cooldown Policy — Smart Message 발송 빈도/야간 금지 규칙을 검사한다.
 * Parity: MSG-001
 */

export interface CooldownRecord {
  userId: string;
  sentAt: number;
}

export interface CooldownDecision {
  allowed: boolean;
  reason?: 'QUIET_HOURS' | 'MIN_INTERVAL' | 'DAILY_LIMIT';
  retryAfterSeconds?: number;
}

const TEN_MINUTES_MS = 10 * 60 * 1000;
const DAILY_LIMIT = 3;

export function getKstHour(nowMs: number): number {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstDate = new Date(nowMs + kstOffsetMs);
  return kstDate.getUTCHours();
}

export function getKstDayKey(nowMs: number): string {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstDate = new Date(nowMs + kstOffsetMs);
  return kstDate.toISOString().slice(0, 10);
}

export function evaluateCooldown(history: CooldownRecord[], userId: string, nowMs = Date.now()): CooldownDecision {
  const hour = getKstHour(nowMs);
  const inQuietHours = hour >= 22 || hour < 8;
  if (inQuietHours) {
    const nextHour = hour < 8 ? 8 : 32;
    const retryHours = nextHour - hour;
    return {
      allowed: false,
      reason: 'QUIET_HOURS',
      retryAfterSeconds: retryHours * 60 * 60,
    };
  }

  const userHistory = history
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => b.sentAt - a.sentAt);

  const latest = userHistory[0];
  if (latest) {
    const elapsed = nowMs - latest.sentAt;
    if (elapsed < TEN_MINUTES_MS) {
      return {
        allowed: false,
        reason: 'MIN_INTERVAL',
        retryAfterSeconds: Math.ceil((TEN_MINUTES_MS - elapsed) / 1000),
      };
    }
  }

  const todayKey = getKstDayKey(nowMs);
  const dailyCount = userHistory.filter((entry) => getKstDayKey(entry.sentAt) === todayKey).length;
  if (dailyCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      reason: 'DAILY_LIMIT',
      retryAfterSeconds: 60 * 60,
    };
  }

  return { allowed: true };
}
