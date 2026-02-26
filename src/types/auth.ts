/**
 * 인증/사용자 도메인 타입 — Toss Login 기반, DogCoach user.py 마이그레이션
 * Parity: AUTH-001
 */

/** 사용자 역할 — CLAUDE.md 정합성 고정 (4종) */
export type UserRole = 'user' | 'trainer' | 'org_owner' | 'org_staff';

/** 사용자 상태 */
export type UserStatus = 'active' | 'inactive' | 'banned';

/** Toss 연결해제 사유 (3종) */
export type UnlinkReferrer = 'UNLINK' | 'WITHDRAWAL_TERMS' | 'WITHDRAWAL_TOSS';

/** 사용자 프로필 */
export interface User {
  id: string; // UUID, Supabase auth.users FK
  toss_user_key: string; // Toss 고유 사용자 식별키 (kakao_sync_id 대체)
  role: UserRole;
  status: UserStatus;
  pepper_version: number; // PBKDF2 pepper 버전 (듀얼 pepper 회전 지원)
  timezone: string; // default: 'Asia/Seoul'
  last_login_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/** Toss 로그인 응답 */
export interface TossLoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  is_new_user: boolean;
}

/** 인증 상태 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}
