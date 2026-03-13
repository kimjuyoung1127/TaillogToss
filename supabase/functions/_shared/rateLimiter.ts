/**
 * Rate Limiter — 무인증 엔드포인트를 고정 윈도우 방식으로 제한한다.
 * Parity: AUTH-001
 */

export interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly rule: RateLimitRule) {}

  consume(key: string, nowMs = Date.now()): RateLimitDecision {
    const current = this.buckets.get(key);

    if (!current || nowMs >= current.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: nowMs + this.rule.windowMs });
      return {
        allowed: true,
        remaining: Math.max(this.rule.maxRequests - 1, 0),
        retryAfterSeconds: 0,
      };
    }

    if (current.count >= this.rule.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil((current.resetAt - nowMs) / 1000),
      };
    }

    current.count += 1;
    this.buckets.set(key, current);

    return {
      allowed: true,
      remaining: Math.max(this.rule.maxRequests - current.count, 0),
      retryAfterSeconds: 0,
    };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }
}

export const loginRateLimiter = new InMemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
});
