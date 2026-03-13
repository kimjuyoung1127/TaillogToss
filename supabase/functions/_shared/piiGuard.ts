/**
 * PII Guard — 민감 정보 키를 재귀적으로 마스킹해 로그 유출을 방지한다.
 * Parity: AUTH-001
 */

const PII_KEYS = [
  'phone',
  'ci',
  'birthday',
  'email',
  'name',
  'gender',
  'nationality',
  'accessToken',
  'refreshToken',
] as const;

const REDACTED = '[REDACTED]';

function normalizeKey(key: string): string {
  return key.replace(/[_-]/g, '').toLowerCase();
}

export function isPiiKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return PII_KEYS.some((candidate) => normalizeKey(candidate) === normalized);
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      result[key] = isPiiKey(key) ? REDACTED : sanitizeValue(nested);
    }
    return result;
  }

  return value;
}

export function redactPII<T>(payload: T): T {
  return sanitizeValue(payload) as T;
}

export function safeLogPayload(payload: unknown): Record<string, unknown> {
  const sanitized = redactPII(payload);
  if (sanitized !== null && typeof sanitized === 'object') {
    return sanitized as Record<string, unknown>;
  }
  return { value: sanitized };
}
