/**
 * Circuit Breaker + Retry — 연속 실패 차단과 5xx 재시도를 공통 처리한다.
 * Parity: IAP-001
 */

export interface CircuitBreakerRule {
  failureThreshold: number;
  openForMs: number;
}

interface CircuitState {
  consecutiveFailures: number;
  openUntil?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const maybeStatus = (error as { status?: unknown }).status;
  return typeof maybeStatus === 'number' ? maybeStatus : undefined;
}

export function isServerError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return typeof status === 'number' && status >= 500;
}

export async function retryOnServerError<T>(
  operation: (attempt: number) => Promise<T>,
  options?: {
    maxRetries?: number;
    baseDelayMs?: number;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 2;
  const baseDelayMs = options?.baseDelayMs ?? 150;

  let attempt = 0;
  while (true) {
    try {
      return await operation(attempt);
    } catch (error) {
      const canRetry = isServerError(error) && attempt < maxRetries;
      if (!canRetry) throw error;

      const backoff = baseDelayMs * Math.pow(2, attempt);
      await sleep(backoff);
      attempt += 1;
    }
  }
}

export class InMemoryCircuitBreaker {
  private readonly state = new Map<string, CircuitState>();

  constructor(private readonly rule: CircuitBreakerRule) {}

  canPass(key: string, nowMs = Date.now()): { pass: boolean; retryAfterMs: number } {
    const current = this.state.get(key);
    if (!current?.openUntil) return { pass: true, retryAfterMs: 0 };

    if (nowMs >= current.openUntil) {
      this.state.set(key, { consecutiveFailures: 0 });
      return { pass: true, retryAfterMs: 0 };
    }

    return { pass: false, retryAfterMs: current.openUntil - nowMs };
  }

  recordSuccess(key: string): void {
    this.state.set(key, { consecutiveFailures: 0 });
  }

  recordFailure(key: string, nowMs = Date.now()): void {
    const current = this.state.get(key) ?? { consecutiveFailures: 0 };
    const nextFailures = current.consecutiveFailures + 1;

    if (nextFailures >= this.rule.failureThreshold) {
      this.state.set(key, {
        consecutiveFailures: nextFailures,
        openUntil: nowMs + this.rule.openForMs,
      });
      return;
    }

    this.state.set(key, { consecutiveFailures: nextFailures });
  }

  async execute<T>(key: string, operation: () => Promise<T>, nowMs = Date.now()): Promise<T> {
    const gate = this.canPass(key, nowMs);
    if (!gate.pass) {
      const error = new Error('Circuit is open') as Error & {
        status: number;
        code: string;
        retryAfterMs: number;
      };
      error.status = 503;
      error.code = 'CIRCUIT_OPEN';
      error.retryAfterMs = gate.retryAfterMs;
      throw error;
    }

    try {
      const result = await operation();
      this.recordSuccess(key);
      return result;
    } catch (error) {
      this.recordFailure(key, nowMs);
      throw error;
    }
  }
}

export const iapCircuitBreaker = new InMemoryCircuitBreaker({
  failureThreshold: 5,
  openForMs: 30_000,
});

export const pointsCircuitBreaker = new InMemoryCircuitBreaker({
  failureThreshold: 5,
  openForMs: 30_000,
});
