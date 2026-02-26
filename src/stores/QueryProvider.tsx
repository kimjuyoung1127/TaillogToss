/**
 * QueryProvider — TanStack Query 프로바이더 래퍼
 * Parity: APP-001
 */
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
