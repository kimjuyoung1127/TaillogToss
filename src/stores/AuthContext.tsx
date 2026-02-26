/**
 * AuthContext — 인증 상태 관리 (Toss Login → Supabase Auth)
 * Parity: AUTH-001
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { User, AuthState } from 'types/auth';

interface AuthContextValue extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  setOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    hasCompletedOnboarding: false,
  });

  const login = useCallback((user: User) => {
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      hasCompletedOnboarding: false, // 온보딩 완료 여부는 별도 체크
    });
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasCompletedOnboarding: false,
    });
  }, []);

  const setOnboardingComplete = useCallback(() => {
    setState((prev) => ({ ...prev, hasCompletedOnboarding: true }));
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout, setOnboardingComplete }),
    [state, login, logout, setOnboardingComplete]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
