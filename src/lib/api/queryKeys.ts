/**
 * TanStack Query Key 팩토리 — 도메인별 캐시 키 관리
 * Parity: APP-001
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  dogs: {
    all: ['dogs'] as const,
    list: (userId: string) => [...queryKeys.dogs.all, 'list', userId] as const,
    detail: (dogId: string) => [...queryKeys.dogs.all, 'detail', dogId] as const,
    env: (dogId: string) => [...queryKeys.dogs.all, 'env', dogId] as const,
  },
  logs: {
    all: ['logs'] as const,
    list: (dogId: string) => [...queryKeys.logs.all, 'list', dogId] as const,
    detail: (logId: string) => [...queryKeys.logs.all, 'detail', logId] as const,
    daily: (dogId: string, date: string) => [...queryKeys.logs.all, 'daily', dogId, date] as const,
  },
  coaching: {
    all: ['coaching'] as const,
    list: (dogId: string) => [...queryKeys.coaching.all, 'list', dogId] as const,
    detail: (coachingId: string) => [...queryKeys.coaching.all, 'detail', coachingId] as const,
    latest: (dogId: string) => [...queryKeys.coaching.all, 'latest', dogId] as const,
  },
  training: {
    all: ['training'] as const,
    progress: (dogId: string) => [...queryKeys.training.all, 'progress', dogId] as const,
    detail: (dogId: string, curriculumId: string) =>
      [...queryKeys.training.all, 'detail', dogId, curriculumId] as const,
  },
  subscription: {
    all: ['subscription'] as const,
    current: (userId: string) => [...queryKeys.subscription.all, 'current', userId] as const,
    orders: (userId: string) => [...queryKeys.subscription.all, 'orders', userId] as const,
  },
  settings: {
    all: ['settings'] as const,
    user: (userId: string) => [...queryKeys.settings.all, 'user', userId] as const,
  },
  notification: {
    all: ['notification'] as const,
    history: (userId: string) => [...queryKeys.notification.all, 'history', userId] as const,
  },
} as const;
