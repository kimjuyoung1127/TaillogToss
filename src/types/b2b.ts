/**
 * B2B 확장 도메인 타입 — v1 숨김 (Phase 7+), SCHEMA-B2B.md 기반 빈 인터페이스
 * Parity: B2B-001
 */

/** 조직 */
export interface Organization {
  id: string;
  name: string;
  business_number: string; // 사업자등록번호
  plan_type: 'org_basic' | 'org_pro';
  max_dogs: number;
  owner_id: string; // FK → users.id (org_owner)
  created_at: string;
  updated_at: string;
}

/** 조직 멤버 */
export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'org_owner' | 'org_staff';
  invited_at: string;
  accepted_at: string | null;
}

/** 조직 소속 반려견 */
export interface OrgDog {
  id: string;
  org_id: string;
  dog_id: string;
  assigned_trainer_id: string | null;
  parent_user_id: string | null;
  enrolled_at: string;
}

/** 리포트 */
export interface Report {
  id: string;
  org_dog_id: string;
  author_id: string;
  content_json: Record<string, unknown>;
  share_token: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  created_at: string;
}

/** 리포트 리액션 */
export interface ReportReaction {
  id: string;
  report_id: string;
  parent_user_id: string;
  emoji: string;
  comment: string | null;
  created_at: string;
}

/** 프리셋 (Bulk 기록용) */
export interface Preset {
  id: string;
  org_id: string;
  name: string;
  category: string;
  fields_json: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

/** 보호자 질문 */
export interface ParentQuestion {
  id: string;
  org_dog_id: string;
  parent_user_id: string;
  question: string;
  answer: string | null;
  answered_by: string | null;
  created_at: string;
  answered_at: string | null;
}

/** 조직 설정 */
export interface OrgSettings {
  id: string;
  org_id: string;
  report_send_time: string; // HH:mm
  default_preset_ids: string[];
  notification_config: Record<string, unknown>;
  updated_at: string;
}

/** 조직 초대 */
export interface OrgInvitation {
  id: string;
  org_id: string;
  inviter_id: string;
  invitee_email: string;
  role: 'org_staff';
  token: string;
  expires_at: string;
  accepted_at: string | null;
}

/** 일일 통계 (B2B 대시보드) */
export interface OrgDailyStats {
  id: string;
  org_id: string;
  date: string; // ISO date
  total_dogs: number;
  logs_completed: number;
  logs_pending: number;
  reports_sent: number;
  reports_viewed: number;
}
