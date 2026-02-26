import type { GuardRoute } from './authGuard';

const DEEP_ENTRY_MAP: Record<string, GuardRoute> = {
  'quick-log': '/dashboard/quick-log',
  'daily-coach': '/coaching/result',
  'training-today': '/training/academy',
};

const DEFAULT_APP_NAME = 'taillog-toss';

function toFallbackBase(initialScheme: string): string {
  if (!initialScheme) return `granite://${DEFAULT_APP_NAME}`;
  if (initialScheme.includes('://')) return initialScheme;
  return `${initialScheme}://${DEFAULT_APP_NAME}`;
}

function safeParseUrl(inputUrl: string, initialScheme: string): URL {
  try {
    return new URL(inputUrl);
  } catch {
    return new URL(toFallbackBase(initialScheme));
  }
}

export function resolveDeepEntry(url: string): GuardRoute | undefined {
  const parsed = safeParseUrl(url, 'granite');
  const entry = parsed.searchParams.get('entry');

  if (!entry) return undefined;
  return DEEP_ENTRY_MAP[entry] ?? '/dashboard';
}

export function rewriteInitialUrlForDeepEntry(url: string, initialScheme: string): string {
  if (!url) return toFallbackBase(initialScheme);

  const target = resolveDeepEntry(url);
  if (!target) return url;

  const parsed = safeParseUrl(url, initialScheme);
  parsed.pathname = target;
  parsed.searchParams.delete('entry');

  return parsed.toString();
}
