export type PostLoginRedirect =
  | '/dashboard'
  | '/dashboard/quick-log'
  | '/dashboard/analysis'
  | '/coaching/result'
  | '/training/academy'
  | '/dog/profile'
  | '/dog/switcher'
  | '/dog/add'
  | '/settings'
  | '/settings/subscription';

const ALLOWED_REDIRECTS: ReadonlySet<string> = new Set<PostLoginRedirect>([
  '/dashboard',
  '/dashboard/quick-log',
  '/dashboard/analysis',
  '/coaching/result',
  '/training/academy',
  '/dog/profile',
  '/dog/switcher',
  '/dog/add',
  '/settings',
  '/settings/subscription',
]);

let pendingRedirect: PostLoginRedirect | null = null;

function normalizeRedirect(path: string): PostLoginRedirect {
  if (ALLOWED_REDIRECTS.has(path)) {
    return path as PostLoginRedirect;
  }
  return '/dashboard';
}

export function setPostLoginRedirect(path: string): void {
  pendingRedirect = normalizeRedirect(path);
}

export function consumePostLoginRedirect(): PostLoginRedirect | null {
  const current = pendingRedirect;
  pendingRedirect = null;
  return current;
}

export function peekPostLoginRedirect(): PostLoginRedirect | null {
  return pendingRedirect;
}

export function clearPostLoginRedirect(): void {
  pendingRedirect = null;
}
