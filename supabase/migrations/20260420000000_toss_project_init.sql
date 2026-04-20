-- =============================================================
-- TaillogToss — 신규 Supabase 프로젝트 전용 초기화 마이그레이션
-- 생성: 2026-04-20
-- 대상: gxvtgrcqkbdibkyeqyil (Toss 미니앱 전용)
-- 제거: kakao_sync_id, pg_provider, pg_customer_key (웹 전용 컬럼)
-- =============================================================

-- 0. 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- 1. ENUM 타입
-- =============================================================
CREATE TYPE public.asset_type AS ENUM ('PHOTO', 'VIDEO', 'LOTTIE_SNAPSHOT');
CREATE TYPE public.difficulty_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE public.dog_sex AS ENUM ('MALE', 'FEMALE', 'MALE_NEUTERED', 'FEMALE_NEUTERED');
CREATE TYPE public.goal_status AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'EXPIRED');
CREATE TYPE public.goal_type AS ENUM ('WEEKLY_SESSIONS', 'DAILY_MINUTES', 'WEEKLY_REPS');
CREATE TYPE public.noti_channel AS ENUM ('ALIMTALK', 'WEB_PUSH', 'EMAIL');
CREATE TYPE public.plan_type AS ENUM ('FREE', 'PRO_MONTHLY', 'PRO_YEARLY');
CREATE TYPE public.provider_type AS ENUM ('COMPANY', 'CREATOR', 'COMMUNITY');
CREATE TYPE public.report_type AS ENUM ('DAILY', 'WEEKLY', 'INSIGHT');
CREATE TYPE public.session_event_type AS ENUM ('PAUSE', 'RESUME', 'TREAT', 'REST', 'NOTE');
CREATE TYPE public.training_status AS ENUM ('COMPLETED', 'SKIPPED_INEFFECTIVE', 'SKIPPED_ALREADY_DONE', 'HIDDEN_BY_AI');
CREATE TYPE public.user_role AS ENUM ('user', 'trainer', 'org_owner', 'org_staff');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'banned');

-- =============================================================
-- 2. 헬퍼 함수
-- =============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- (is_org_member, is_org_member_with_role, is_parent_of_dog, purge_expired_pii 는
--  테이블 생성 이후 섹션 3.5에서 정의)

-- =============================================================
-- 3. 테이블 생성
-- =============================================================

-- 3-1. users (Toss 전용 — kakao_sync_id 제거)
CREATE TABLE public.users (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  toss_user_key    varchar UNIQUE,
  role             public.user_role DEFAULT 'user',
  phone_number     varchar,
  status           public.user_status DEFAULT 'active',
  timezone         varchar DEFAULT 'Asia/Seoul',
  provider         varchar,
  pepper_version   integer DEFAULT 1,
  last_login_at    timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3-2. dogs
CREATE TABLE public.dogs (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name             text NOT NULL,
  breed            text,
  birth_date       date,
  sex              public.dog_sex,
  profile_image_url text,
  anonymous_sid    text,
  weight_kg        numeric(5,2),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;

-- 3-3. dog_env
CREATE TABLE public.dog_env (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id           uuid UNIQUE REFERENCES public.dogs(id) ON DELETE CASCADE,
  household_info   jsonb,
  health_meta      jsonb,
  profile_meta     jsonb,
  rewards_meta     jsonb,
  chronic_issues   jsonb,
  antecedents      jsonb,
  triggers         jsonb,
  past_attempts    jsonb,
  temperament      jsonb,
  activity_meta    jsonb,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE public.dog_env ENABLE ROW LEVEL SECURITY;

-- 3-4. behavior_logs
CREATE TABLE public.behavior_logs (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id           uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  is_quick_log     boolean DEFAULT false,
  type_id          text,
  antecedent       text,
  behavior         text,
  consequence      text,
  intensity        integer,
  duration_minutes integer,
  duration         integer,
  occurred_at      timestamptz DEFAULT now(),
  quick_category   text,
  daily_activity   jsonb,
  location         text,
  memo             text,
  recorded_by      uuid REFERENCES public.users(id),
  org_id           uuid,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE public.behavior_logs ENABLE ROW LEVEL SECURITY;

-- 3-5. ai_coaching
CREATE TABLE public.ai_coaching (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id           uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  report_type      public.report_type,
  analysis_json    jsonb,
  action_items     jsonb,
  blocks           jsonb,
  feedback_score   integer,
  ai_tokens_used   integer,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE public.ai_coaching ENABLE ROW LEVEL SECURITY;

-- 3-6. action_tracker
CREATE TABLE public.action_tracker (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coaching_id      uuid REFERENCES public.ai_coaching(id) ON DELETE CASCADE,
  action_item_id   text,
  is_completed     boolean DEFAULT false,
  completed_at     timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE public.action_tracker ENABLE ROW LEVEL SECURITY;

-- 3-7. ai_recommendation_snapshots
CREATE TABLE public.ai_recommendation_snapshots (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id           uuid REFERENCES public.dogs(id) ON DELETE SET NULL,
  user_id          uuid REFERENCES public.users(id) ON DELETE SET NULL,
  anonymous_sid    text,
  window_days      integer,
  dedupe_key       text UNIQUE,
  prompt_version   text,
  model            text,
  summary_hash     text,
  issue            text,
  recommendations  jsonb,
  rationale        text,
  period_comparison jsonb,
  source           text,
  input_tokens     integer,
  output_tokens    integer,
  cost_usd         numeric(10,6),
  latency_ms       integer,
  expires_at       timestamptz,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE public.ai_recommendation_snapshots ENABLE ROW LEVEL SECURITY;

-- 3-8. ai_recommendation_feedback
CREATE TABLE public.ai_recommendation_feedback (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_id           uuid REFERENCES public.ai_recommendation_snapshots(id) ON DELETE CASCADE,
  user_id               uuid REFERENCES public.users(id) ON DELETE SET NULL,
  anonymous_sid         text,
  recommendation_index  integer,
  action                text,
  note                  text,
  created_at            timestamptz DEFAULT now()
);
ALTER TABLE public.ai_recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- 3-9. ai_cost_usage_daily
CREATE TABLE public.ai_cost_usage_daily (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usage_date           date UNIQUE NOT NULL,
  total_calls          integer DEFAULT 0,
  total_input_tokens   bigint DEFAULT 0,
  total_output_tokens  bigint DEFAULT 0,
  total_cost_usd       numeric(10,6) DEFAULT 0,
  rule_fallback_count  integer DEFAULT 0,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);
ALTER TABLE public.ai_cost_usage_daily ENABLE ROW LEVEL SECURITY;

-- 3-10. ai_cost_usage_monthly
CREATE TABLE public.ai_cost_usage_monthly (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usage_month      date UNIQUE NOT NULL,
  total_calls      integer DEFAULT 0,
  total_cost_usd   numeric(10,6) DEFAULT 0,
  budget_limit_usd numeric(10,2),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE public.ai_cost_usage_monthly ENABLE ROW LEVEL SECURITY;

-- 3-11. subscriptions (Toss IAP 전용 — pg_provider/pg_customer_key 제거)
CREATE TABLE public.subscriptions (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type           public.plan_type DEFAULT 'FREE',
  next_billing_date   date,
  is_active           boolean DEFAULT false,
  ai_tokens_remaining integer,
  ai_tokens_total     integer,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 3-12. toss_orders
CREATE TABLE public.toss_orders (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid REFERENCES public.users(id) ON DELETE CASCADE,
  product_id       text NOT NULL,
  idempotency_key  text UNIQUE NOT NULL,
  toss_status      text DEFAULT 'PENDING',
  grant_status     text DEFAULT 'pending',
  amount           integer,
  toss_order_id    text,
  error_code       text,
  retry_count      integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE public.toss_orders ENABLE ROW LEVEL SECURITY;

-- 3-13. user_settings
CREATE TABLE public.user_settings (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              uuid UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  notification_pref    jsonb,
  ai_persona           text,
  marketing_agreed     boolean DEFAULT false,
  marketing_agreed_at  timestamptz,
  updated_at           timestamptz DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 3-14. noti_history
CREATE TABLE public.noti_history (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           uuid REFERENCES public.users(id) ON DELETE CASCADE,
  channel           public.noti_channel,
  template_code     text,
  template_set_code text,
  notification_type text,
  idempotency_key   text,
  provider_channels jsonb,
  org_id            uuid,
  report_id         uuid,
  recipient_type    text,
  success           boolean DEFAULT true,
  error_code        text,
  sent_at           timestamptz DEFAULT now(),
  read_at           timestamptz
);
ALTER TABLE public.noti_history ENABLE ROW LEVEL SECURITY;

-- 3-15. edge_function_requests (멱등키 저장)
CREATE TABLE public.edge_function_requests (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key  text UNIQUE NOT NULL,
  function_name    text NOT NULL,
  status           text NOT NULL,
  result           jsonb,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE public.edge_function_requests ENABLE ROW LEVEL SECURITY;

-- 3-16. log_summaries
CREATE TABLE public.log_summaries (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id       uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  start_date   date,
  end_date     date,
  summary_text text,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE public.log_summaries ENABLE ROW LEVEL SECURITY;

-- 3-17. training_plans
CREATE TABLE public.training_plans (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  description     text,
  category        text,
  difficulty      public.difficulty_level,
  duration_weeks  integer,
  lang            text DEFAULT 'ko',
  is_published    boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

-- 3-18. content_providers
CREATE TABLE public.content_providers (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           text NOT NULL,
  slug           text UNIQUE NOT NULL,
  type           public.provider_type,
  logo_url       text,
  website_url    text,
  contact_email  text,
  api_key_hash   text,
  is_active      boolean DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);
ALTER TABLE public.content_providers ENABLE ROW LEVEL SECURITY;

-- 3-19. training_library
CREATE TABLE public.training_library (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     uuid REFERENCES public.content_providers(id),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  description     text,
  category        text,
  difficulty      public.difficulty_level,
  min_age_months  integer,
  tags            text[],
  steps_json      jsonb,
  equipment_json  jsonb,
  safety_notes    text,
  is_published    boolean DEFAULT false,
  lang            text DEFAULT 'ko',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
ALTER TABLE public.training_library ENABLE ROW LEVEL SECURITY;

-- 3-20. training_media
CREATE TABLE public.training_media (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id    uuid REFERENCES public.training_library(id) ON DELETE CASCADE,
  provider       text,
  url            text NOT NULL,
  thumbnail_url  text,
  lang           text DEFAULT 'ko',
  region         text,
  duration_sec   integer,
  sort_order     integer DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);
ALTER TABLE public.training_media ENABLE ROW LEVEL SECURITY;

-- 3-21. plan_items
CREATE TABLE public.plan_items (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id           uuid REFERENCES public.training_plans(id) ON DELETE CASCADE,
  training_id       uuid REFERENCES public.training_library(id),
  week_number       integer,
  day_of_week       integer,
  recommended_reps  integer,
  sort_order        integer DEFAULT 0
);
ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;

-- 3-22. training_sessions
CREATE TABLE public.training_sessions (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id       uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  user_id      uuid REFERENCES public.users(id),
  training_id  uuid REFERENCES public.training_library(id),
  plan_id      uuid REFERENCES public.training_plans(id),
  started_at   timestamptz,
  ended_at     timestamptz,
  duration_sec integer,
  reps         integer,
  sets         integer,
  success_rate numeric(4,2),
  mood_score   integer,
  notes        text,
  is_quick_log boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- 3-23. training_goals
CREATE TABLE public.training_goals (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id      uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES public.users(id),
  goal_type   public.goal_type,
  target      integer,
  start_date  date,
  end_date    date,
  status      public.goal_status DEFAULT 'ACTIVE',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE public.training_goals ENABLE ROW LEVEL SECURITY;

-- 3-24. user_training_status
CREATE TABLE public.user_training_status (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid REFERENCES public.users(id) ON DELETE CASCADE,
  dog_id           uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  curriculum_id    text NOT NULL,
  stage_id         text NOT NULL,
  step_number      integer NOT NULL,
  status           public.training_status,
  current_variant  text,
  memo             text,
  created_at       timestamptz DEFAULT now(),
  UNIQUE(user_id, curriculum_id, stage_id, step_number)
);
ALTER TABLE public.user_training_status ENABLE ROW LEVEL SECURITY;

-- 3-25. training_behavior_snapshots
CREATE TABLE public.training_behavior_snapshots (
  id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 uuid REFERENCES public.users(id) ON DELETE CASCADE,
  dog_id                  uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  curriculum_id           text NOT NULL,
  snapshot_date           date NOT NULL,
  total_logs              integer DEFAULT 0,
  avg_intensity           numeric(4,2),
  log_frequency_per_week  numeric(4,2),
  trigger_distribution    jsonb,
  hourly_distribution     jsonb,
  weekly_distribution     jsonb,
  created_at              timestamptz DEFAULT now(),
  UNIQUE(user_id, dog_id, curriculum_id)
);
ALTER TABLE public.training_behavior_snapshots ENABLE ROW LEVEL SECURITY;

-- 3-26. content_metrics
CREATE TABLE public.content_metrics (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id          uuid REFERENCES public.training_library(id),
  dog_id              uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  session_id          uuid REFERENCES public.training_sessions(id),
  completion_rate     numeric(4,2),
  effect_score        integer,
  behavior_change_score integer,
  created_at          timestamptz DEFAULT now()
);
ALTER TABLE public.content_metrics ENABLE ROW LEVEL SECURITY;

-- 3-27. media_assets
CREATE TABLE public.media_assets (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id       uuid REFERENCES public.behavior_logs(id) ON DELETE SET NULL,
  report_id    uuid,
  org_id       uuid,
  storage_url  text NOT NULL,
  asset_type   public.asset_type,
  is_highlight boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- 3-28. organizations (B2B)
CREATE TABLE public.organizations (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             text NOT NULL,
  type             text,
  owner_user_id    uuid REFERENCES public.users(id),
  logo_url         text,
  business_number  text UNIQUE,
  phone            text,
  address          text,
  max_dogs         integer DEFAULT 10,
  max_staff        integer DEFAULT 5,
  settings         jsonb,
  status           text DEFAULT 'active',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 3-29. org_members
CREATE TABLE public.org_members (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES public.users(id) ON DELETE CASCADE,
  role        text NOT NULL,
  status      text DEFAULT 'active',
  invited_at  timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(org_id, user_id)
);
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- 3-30. org_dogs
CREATE TABLE public.org_dogs (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id           uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  dog_id           uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  parent_user_id   uuid REFERENCES public.users(id),
  parent_name      text,
  group_tag        text,
  enrolled_at      timestamptz DEFAULT now(),
  discharged_at    timestamptz,
  status           text DEFAULT 'active',
  UNIQUE(org_id, dog_id)
);
ALTER TABLE public.org_dogs ENABLE ROW LEVEL SECURITY;

-- 3-31. org_dogs_pii
CREATE TABLE public.org_dogs_pii (
  org_dog_id              uuid PRIMARY KEY REFERENCES public.org_dogs(id) ON DELETE CASCADE,
  parent_phone_enc        text,
  parent_email_enc        text,
  encryption_key_version  integer DEFAULT 1,
  updated_at              timestamptz DEFAULT now()
);
ALTER TABLE public.org_dogs_pii ENABLE ROW LEVEL SECURITY;

-- 3-32. pii_access_log
CREATE TABLE public.pii_access_log (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  accessor_id  uuid REFERENCES public.users(id),
  org_dog_id   uuid REFERENCES public.org_dogs(id),
  action       text,
  accessed_at  timestamptz DEFAULT now()
);
ALTER TABLE public.pii_access_log ENABLE ROW LEVEL SECURITY;

-- 3-33. dog_assignments
CREATE TABLE public.dog_assignments (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id            uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  org_id            uuid REFERENCES public.organizations(id),
  trainer_user_id   uuid REFERENCES public.users(id),
  role              text,
  assigned_at       timestamptz DEFAULT now(),
  ended_at          timestamptz,
  status            text DEFAULT 'active'
);
ALTER TABLE public.dog_assignments ENABLE ROW LEVEL SECURITY;

-- 3-34. org_subscriptions
CREATE TABLE public.org_subscriptions (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id           uuid REFERENCES public.organizations(id),
  trainer_user_id  uuid REFERENCES public.users(id),
  plan_type        public.plan_type,
  toss_order_id    text,
  price_krw        integer,
  max_dogs         integer,
  max_staff        integer,
  billing_cycle    text,
  started_at       timestamptz,
  expires_at       timestamptz,
  cancelled_at     timestamptz,
  refunded_at      timestamptz,
  suspend_reason   text,
  retry_count      integer DEFAULT 0,
  status           text DEFAULT 'active',
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE public.org_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3-35. daily_reports (B2B)
CREATE TABLE public.daily_reports (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id                uuid REFERENCES public.dogs(id) ON DELETE CASCADE,
  report_date           date NOT NULL,
  template_type         text,
  created_by_org_id     uuid REFERENCES public.organizations(id),
  created_by_trainer_id uuid REFERENCES public.users(id),
  behavior_summary      jsonb,
  condition_notes       text,
  ai_coaching_oneliner  text,
  seven_day_comparison  jsonb,
  highlight_photo_urls  text[],
  generation_status     text DEFAULT 'pending',
  ai_model              text,
  ai_cost_usd           numeric(10,6),
  generated_at          timestamptz,
  scheduled_send_at     timestamptz,
  sent_at               timestamptz,
  share_token           text UNIQUE,
  toss_share_url        text,
  expires_at            timestamptz,
  created_at            timestamptz DEFAULT now()
);
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- 3-36. parent_interactions
CREATE TABLE public.parent_interactions (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id         uuid REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  parent_user_id    uuid REFERENCES public.users(id),
  parent_identifier text,
  interaction_type  text,
  content           text,
  linked_log_id     uuid REFERENCES public.behavior_logs(id),
  staff_response    text,
  responded_by      uuid REFERENCES public.users(id),
  responded_at      timestamptz,
  read_by_staff     boolean DEFAULT false,
  created_at        timestamptz DEFAULT now()
);
ALTER TABLE public.parent_interactions ENABLE ROW LEVEL SECURITY;

-- 3-37. org_analytics_daily
CREATE TABLE public.org_analytics_daily (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                   uuid REFERENCES public.organizations(id),
  analytics_date           date NOT NULL,
  group_tag                text,
  total_dogs               integer DEFAULT 0,
  avg_activity_score       numeric(4,2),
  aggression_incident_count integer DEFAULT 0,
  total_behavior_logs      integer DEFAULT 0,
  report_open_rate         numeric(4,2),
  reaction_rate            numeric(4,2),
  question_count           integer DEFAULT 0,
  record_completion_rate   numeric(4,2),
  created_at               timestamptz DEFAULT now(),
  UNIQUE(org_id, analytics_date, group_tag)
);
ALTER TABLE public.org_analytics_daily ENABLE ROW LEVEL SECURITY;

-- 3-38. ai_cost_usage_org
CREATE TABLE public.ai_cost_usage_org (
  id                           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                       uuid REFERENCES public.organizations(id),
  trainer_user_id              uuid REFERENCES public.users(id),
  usage_date                   date NOT NULL,
  report_generation_calls      integer DEFAULT 0,
  report_generation_cost_usd   numeric(10,6) DEFAULT 0,
  coaching_calls               integer DEFAULT 0,
  coaching_cost_usd            numeric(10,6) DEFAULT 0,
  budget_limit_usd             numeric(10,2),
  UNIQUE NULLS NOT DISTINCT (org_id, usage_date) DEFERRABLE,
  UNIQUE NULLS NOT DISTINCT (trainer_user_id, usage_date) DEFERRABLE
);
ALTER TABLE public.ai_cost_usage_org ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 3.5. 테이블 의존 헬퍼 함수 (테이블 생성 후 정의)
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.org_members
    WHERE org_id = _org_id AND user_id = auth.uid() AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_member_with_role(_org_id uuid, _roles text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.org_members
    WHERE org_id = _org_id AND user_id = auth.uid()
      AND status = 'active' AND role::text = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of_dog(_dog_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.org_dogs
    WHERE dog_id = _dog_id AND parent_user_id = auth.uid() AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.purge_expired_pii()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  DELETE FROM public.org_dogs_pii
  WHERE org_dog_id IN (
    SELECT id FROM public.org_dogs
    WHERE status = 'discharged'
      AND discharged_at < now() - INTERVAL '90 days'
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- =============================================================
-- 4. 인덱스
-- =============================================================
CREATE INDEX idx_users_toss_user_key ON public.users(toss_user_key) WHERE toss_user_key IS NOT NULL;
CREATE INDEX idx_dogs_user_id ON public.dogs(user_id);
CREATE INDEX idx_dogs_user_created_desc ON public.dogs(user_id, created_at DESC);
CREATE INDEX idx_dogs_anonymous_sid ON public.dogs(anonymous_sid);
CREATE INDEX idx_dogs_anonymous_sid_created_desc ON public.dogs(anonymous_sid, created_at DESC);
-- dog_env_dog_id_key: UNIQUE 컬럼 제약으로 자동 생성됨 (중복 제거)
CREATE INDEX idx_dog_env_dog_id ON public.dog_env(dog_id);
CREATE INDEX idx_behavior_logs_dog_id ON public.behavior_logs(dog_id);
CREATE INDEX idx_logs_dog_occurred ON public.behavior_logs(dog_id, occurred_at);
CREATE INDEX idx_behavior_logs_org ON public.behavior_logs(org_id, dog_id, occurred_at);
CREATE INDEX idx_ai_coaching_dog_id ON public.ai_coaching(dog_id);
CREATE INDEX idx_action_tracker_coaching_id ON public.action_tracker(coaching_id);
-- ai_recommendation_snapshots_dedupe_key_key: UNIQUE 컬럼으로 자동 생성됨
CREATE INDEX idx_rec_dog_window_created ON public.ai_recommendation_snapshots(dog_id, window_days, created_at DESC);
CREATE INDEX idx_rec_expires ON public.ai_recommendation_snapshots(expires_at);
CREATE INDEX idx_rec_user_created ON public.ai_recommendation_snapshots(user_id, created_at);
CREATE INDEX idx_feedback_snapshot ON public.ai_recommendation_feedback(snapshot_id);
-- ai_cost_usage_daily_usage_date_key: UNIQUE 컬럼으로 자동 생성됨
-- ai_cost_usage_monthly_usage_month_key: UNIQUE 컬럼으로 자동 생성됨
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
-- toss_orders_idempotency_key_key: UNIQUE 컬럼으로 자동 생성됨
CREATE INDEX idx_toss_orders_user ON public.toss_orders(user_id);
CREATE INDEX idx_toss_orders_grant ON public.toss_orders(grant_status);
-- user_settings_user_id_key: UNIQUE 컬럼으로 자동 생성됨
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_noti_history_user_id ON public.noti_history(user_id);
CREATE INDEX idx_noti_history_user_sent_at ON public.noti_history(user_id, sent_at DESC);
CREATE UNIQUE INDEX uq_noti_history_idempotency_key ON public.noti_history(idempotency_key) WHERE idempotency_key IS NOT NULL;
-- edge_function_requests_idempotency_key_key: UNIQUE 컬럼으로 자동 생성됨
CREATE INDEX idx_log_summaries_dog_id ON public.log_summaries(dog_id);
-- training_library_slug_key: UNIQUE 컬럼으로 자동 생성됨
CREATE INDEX idx_training_library_category ON public.training_library(category);
CREATE INDEX idx_training_library_lang ON public.training_library(lang);
CREATE INDEX idx_training_library_provider ON public.training_library(provider_id);
CREATE INDEX idx_training_media_training ON public.training_media(training_id);
-- training_plans_slug_key: UNIQUE 컬럼으로 자동 생성됨
CREATE INDEX idx_plan_items_plan ON public.plan_items(plan_id);
CREATE INDEX idx_training_sessions_dog ON public.training_sessions(dog_id);
CREATE INDEX idx_training_sessions_user ON public.training_sessions(user_id);
CREATE INDEX idx_training_sessions_started ON public.training_sessions(dog_id, started_at);
CREATE INDEX idx_training_goals_dog ON public.training_goals(dog_id);
CREATE INDEX idx_training_goals_user ON public.training_goals(user_id);
CREATE INDEX idx_user_training_status_user_id ON public.user_training_status(user_id);
CREATE INDEX idx_behavior_snapshot_user_dog_curriculum_snapshot_date ON public.training_behavior_snapshots(user_id, dog_id, curriculum_id, snapshot_date DESC);
CREATE INDEX idx_content_metrics_content ON public.content_metrics(content_id);
CREATE INDEX idx_content_metrics_dog ON public.content_metrics(dog_id);
CREATE INDEX idx_media_assets_log_id ON public.media_assets(log_id);
-- organizations_business_number_key: UNIQUE 컬럼으로 자동 생성됨
-- org_members_org_id_user_id_key: UNIQUE(org_id, user_id) 제약으로 자동 생성됨
CREATE INDEX idx_org_members_user_status ON public.org_members(user_id, org_id, status);
-- org_dogs_org_id_dog_id_key: UNIQUE(org_id, dog_id) 제약으로 자동 생성됨 (중복 제거)
CREATE INDEX idx_org_dogs_org_status ON public.org_dogs(org_id, dog_id, status, group_tag);
CREATE INDEX idx_org_dogs_parent ON public.org_dogs(parent_user_id);
CREATE INDEX idx_dog_assignments_trainer ON public.dog_assignments(trainer_user_id, status);
CREATE UNIQUE INDEX idx_dog_assignments_active_with_org ON public.dog_assignments(dog_id, trainer_user_id, org_id) WHERE org_id IS NOT NULL AND status = 'active';
CREATE UNIQUE INDEX idx_dog_assignments_active_without_org ON public.dog_assignments(dog_id, trainer_user_id) WHERE org_id IS NULL AND status = 'active';
-- daily_reports_share_token_key: UNIQUE 컬럼으로 자동 생성됨
CREATE INDEX idx_daily_reports_org_date ON public.daily_reports(created_by_org_id, report_date) WHERE created_by_org_id IS NOT NULL;
CREATE INDEX idx_daily_reports_share ON public.daily_reports(share_token);
CREATE INDEX idx_daily_reports_status ON public.daily_reports(generation_status);
CREATE UNIQUE INDEX idx_daily_reports_unique_org ON public.daily_reports(dog_id, report_date, created_by_org_id) WHERE created_by_org_id IS NOT NULL;
CREATE UNIQUE INDEX idx_daily_reports_unique_trainer ON public.daily_reports(dog_id, report_date, created_by_trainer_id) WHERE created_by_trainer_id IS NOT NULL;
CREATE INDEX idx_parent_interactions_unread ON public.parent_interactions(read_by_staff) WHERE read_by_staff = false;
CREATE INDEX idx_org_analytics_org_date ON public.org_analytics_daily(org_id, analytics_date);
-- org_analytics_daily_org_id_analytics_date_group_tag_key: UNIQUE(org_id, analytics_date, group_tag) 제약으로 자동 생성됨
-- content_providers_slug_key: UNIQUE 컬럼으로 자동 생성됨

-- =============================================================
-- 5. RLS 정책
-- =============================================================

-- users
CREATE POLICY "Service role full access" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users read own data" ON public.users FOR SELECT TO public USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users update own data" ON public.users FOR UPDATE TO public USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

-- dogs
CREATE POLICY "Service role full access" ON public.dogs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users read own dogs" ON public.dogs FOR SELECT TO public USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own dogs" ON public.dogs FOR INSERT TO public WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own dogs" ON public.dogs FOR UPDATE TO public USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own dogs" ON public.dogs FOR DELETE TO public USING ((SELECT auth.uid()) = user_id);

-- dog_env
CREATE POLICY "Service role full access" ON public.dog_env FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users read own dog env" ON public.dog_env FOR SELECT TO public USING (EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_env.dog_id AND d.user_id = (SELECT auth.uid())));
CREATE POLICY "Users insert own dog env" ON public.dog_env FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_env.dog_id AND d.user_id = (SELECT auth.uid())));
CREATE POLICY "Users update own dog env" ON public.dog_env FOR UPDATE TO public USING (EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_env.dog_id AND d.user_id = (SELECT auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_env.dog_id AND d.user_id = (SELECT auth.uid())));
CREATE POLICY "Users delete own dog env" ON public.dog_env FOR DELETE TO public USING (EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_env.dog_id AND d.user_id = (SELECT auth.uid())));

-- behavior_logs
CREATE POLICY "Service role full access" ON public.behavior_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "behavior_logs_b2b_select" ON public.behavior_logs FOR SELECT TO public USING (
  (dog_id IN (SELECT dogs.id FROM dogs WHERE dogs.user_id = (SELECT auth.uid())))
  OR ((org_id IS NOT NULL) AND is_org_member(org_id))
  OR (dog_id IN (SELECT dog_assignments.dog_id FROM dog_assignments WHERE dog_assignments.trainer_user_id = (SELECT auth.uid()) AND dog_assignments.status = 'active'))
  OR is_parent_of_dog(dog_id)
);
CREATE POLICY "behavior_logs_b2b_insert" ON public.behavior_logs FOR INSERT TO public WITH CHECK (
  (dog_id IN (SELECT dogs.id FROM dogs WHERE dogs.user_id = (SELECT auth.uid())))
  OR ((org_id IS NOT NULL) AND is_org_member_with_role(org_id, ARRAY['owner','manager','staff']))
  OR (dog_id IN (SELECT dog_assignments.dog_id FROM dog_assignments WHERE dog_assignments.trainer_user_id = (SELECT auth.uid()) AND dog_assignments.status = 'active'))
);
CREATE POLICY "behavior_logs_b2b_update" ON public.behavior_logs FOR UPDATE TO public USING (
  (recorded_by = (SELECT auth.uid()))
  OR (dog_id IN (SELECT dogs.id FROM dogs WHERE dogs.user_id = (SELECT auth.uid())))
);

-- ai_coaching / action_tracker / cost tracking
CREATE POLICY "Service role full access" ON public.ai_coaching FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.action_tracker FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.ai_recommendation_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.ai_recommendation_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.ai_cost_usage_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.ai_cost_usage_monthly FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.log_summaries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.media_assets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.training_behavior_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);

-- subscriptions
CREATE POLICY "Service role full access" ON public.subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users read own subscriptions" ON public.subscriptions FOR SELECT TO public USING ((SELECT auth.uid()) = user_id);

-- toss_orders
CREATE POLICY "toss_orders_user_select" ON public.toss_orders FOR SELECT TO public USING (user_id = (SELECT auth.uid()));
CREATE POLICY "toss_orders_user_insert" ON public.toss_orders FOR INSERT TO public WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "toss_orders_user_update" ON public.toss_orders FOR UPDATE TO public USING (user_id = (SELECT auth.uid()));

-- user_settings
CREATE POLICY "Service role full access" ON public.user_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users read own settings" ON public.user_settings FOR SELECT TO public USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own settings" ON public.user_settings FOR INSERT TO public WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own settings" ON public.user_settings FOR UPDATE TO public USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own settings" ON public.user_settings FOR DELETE TO public USING ((SELECT auth.uid()) = user_id);

-- noti_history
CREATE POLICY "Service role full access" ON public.noti_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users read own notifications" ON public.noti_history FOR SELECT TO public USING ((SELECT auth.uid()) = user_id);

-- edge_function_requests
CREATE POLICY "edge_requests_service_only" ON public.edge_function_requests FOR ALL TO public USING ((SELECT auth.role()) = 'service_role');

-- user_training_status
CREATE POLICY "Service role full access" ON public.user_training_status FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read own training status" ON public.user_training_status FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Authenticated users can insert own training status" ON public.user_training_status FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Authenticated users can update own training status" ON public.user_training_status FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

-- B2B 조직 정책
CREATE POLICY "organizations_select" ON public.organizations FOR SELECT TO public USING (is_org_member(id) OR (owner_user_id = (SELECT auth.uid())));
CREATE POLICY "organizations_update" ON public.organizations FOR UPDATE TO public USING (owner_user_id = (SELECT auth.uid()));
CREATE POLICY "org_members_select" ON public.org_members FOR SELECT TO public USING (is_org_member(org_id));
CREATE POLICY "org_members_insert" ON public.org_members FOR INSERT TO public WITH CHECK (is_org_member_with_role(org_id, ARRAY['owner','manager']));
CREATE POLICY "org_members_update" ON public.org_members FOR UPDATE TO public USING (is_org_member_with_role(org_id, ARRAY['owner','manager']));
CREATE POLICY "org_dogs_select" ON public.org_dogs FOR SELECT TO public USING (is_org_member(org_id) OR (parent_user_id = (SELECT auth.uid())));
CREATE POLICY "org_dogs_insert" ON public.org_dogs FOR INSERT TO public WITH CHECK (is_org_member_with_role(org_id, ARRAY['owner','manager']));
CREATE POLICY "org_dogs_update" ON public.org_dogs FOR UPDATE TO public USING (is_org_member_with_role(org_id, ARRAY['owner','manager']));
CREATE POLICY "org_dogs_delete" ON public.org_dogs FOR DELETE TO public USING (is_org_member_with_role(org_id, ARRAY['owner','manager']));

-- PII 직접 접근 차단
CREATE POLICY "pii_no_direct_select" ON public.org_dogs_pii FOR SELECT TO public USING (false);
CREATE POLICY "pii_no_direct_insert" ON public.org_dogs_pii FOR INSERT TO public WITH CHECK (false);
CREATE POLICY "pii_no_direct_update" ON public.org_dogs_pii FOR UPDATE TO public USING (false);
CREATE POLICY "pii_no_direct_delete" ON public.org_dogs_pii FOR DELETE TO public USING (false);

-- dog_assignments
CREATE POLICY "dog_assignments_select" ON public.dog_assignments FOR SELECT TO public USING ((trainer_user_id = (SELECT auth.uid())) OR ((org_id IS NOT NULL) AND is_org_member(org_id)));
CREATE POLICY "dog_assignments_insert" ON public.dog_assignments FOR INSERT TO public WITH CHECK (((org_id IS NOT NULL) AND is_org_member_with_role(org_id, ARRAY['owner','manager'])) OR ((org_id IS NULL) AND (trainer_user_id = (SELECT auth.uid()))));
CREATE POLICY "dog_assignments_update" ON public.dog_assignments FOR UPDATE TO public USING (((org_id IS NOT NULL) AND is_org_member_with_role(org_id, ARRAY['owner','manager'])) OR ((org_id IS NULL) AND (trainer_user_id = (SELECT auth.uid()))));

-- org_subscriptions
CREATE POLICY "org_subscriptions_select" ON public.org_subscriptions FOR SELECT TO public USING (((org_id IS NOT NULL) AND is_org_member(org_id)) OR ((trainer_user_id IS NOT NULL) AND (trainer_user_id = (SELECT auth.uid()))));

-- org_analytics_daily
CREATE POLICY "org_analytics_select" ON public.org_analytics_daily FOR SELECT TO public USING (is_org_member(org_id));

-- daily_reports
CREATE POLICY "daily_reports_select" ON public.daily_reports FOR SELECT TO public USING (
  ((created_by_org_id IS NOT NULL) AND is_org_member(created_by_org_id))
  OR ((created_by_trainer_id IS NOT NULL) AND (created_by_trainer_id = (SELECT auth.uid())))
  OR is_parent_of_dog(dog_id)
  OR ((share_token IS NOT NULL) AND (expires_at > now()))
);
CREATE POLICY "daily_reports_insert" ON public.daily_reports FOR INSERT TO public WITH CHECK (
  ((created_by_org_id IS NOT NULL) AND is_org_member_with_role(created_by_org_id, ARRAY['owner','manager','staff']))
  OR ((created_by_trainer_id IS NOT NULL) AND (created_by_trainer_id = (SELECT auth.uid())))
);
CREATE POLICY "daily_reports_update" ON public.daily_reports FOR UPDATE TO public USING (
  ((created_by_org_id IS NOT NULL) AND is_org_member_with_role(created_by_org_id, ARRAY['owner','manager','staff']))
  OR ((created_by_trainer_id IS NOT NULL) AND (created_by_trainer_id = (SELECT auth.uid())))
);

-- parent_interactions
CREATE POLICY "parent_interactions_select" ON public.parent_interactions FOR SELECT TO public USING (
  (parent_user_id = (SELECT auth.uid()))
  OR (EXISTS (SELECT 1 FROM daily_reports dr WHERE dr.id = parent_interactions.report_id AND dr.created_by_org_id IS NOT NULL AND is_org_member(dr.created_by_org_id)))
  OR (EXISTS (SELECT 1 FROM daily_reports dr WHERE dr.id = parent_interactions.report_id AND dr.created_by_trainer_id = (SELECT auth.uid())))
);
CREATE POLICY "parent_interactions_insert" ON public.parent_interactions FOR INSERT TO public WITH CHECK (
  (parent_user_id = (SELECT auth.uid()))
  OR is_parent_of_dog((SELECT daily_reports.dog_id FROM daily_reports WHERE daily_reports.id = parent_interactions.report_id))
);
CREATE POLICY "parent_interactions_update" ON public.parent_interactions FOR UPDATE TO public USING (
  (EXISTS (SELECT 1 FROM daily_reports dr WHERE dr.id = parent_interactions.report_id AND dr.created_by_org_id IS NOT NULL AND is_org_member_with_role(dr.created_by_org_id, ARRAY['owner','manager','staff'])))
  OR (EXISTS (SELECT 1 FROM daily_reports dr WHERE dr.id = parent_interactions.report_id AND dr.created_by_trainer_id = (SELECT auth.uid())))
);

-- =============================================================
-- 6. get_parent_contact 함수 (PII 조회 — 감사 로그 포함)
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_parent_contact(_org_dog_id uuid)
RETURNS TABLE(parent_phone_enc text, parent_email_enc text)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.pii_access_log(accessor_id, org_dog_id, action, accessed_at)
  VALUES (auth.uid(), _org_dog_id, 'read', now());
  IF NOT EXISTS(
    SELECT 1 FROM public.org_dogs od
    JOIN public.org_members om ON om.org_id = od.org_id
    WHERE od.id = _org_dog_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role IN ('owner','manager','staff')
  ) THEN
    RAISE EXCEPTION 'Unauthorized PII access';
  END IF;
  RETURN QUERY SELECT p.parent_phone_enc, p.parent_email_enc
    FROM public.org_dogs_pii p WHERE p.org_dog_id = _org_dog_id;
END;
$$;
