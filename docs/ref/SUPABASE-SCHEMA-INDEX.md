# Supabase Schema Index (Single View)

Last updated: 2026-05-21 (Asia/Seoul) — `dog-profiles`/`org-logos` Storage bucket policies and B2B logo upload evidence reflected.
Source priority: 1) Supabase MCP live metadata 2) `supabase/migrations/*.sql` 3) `Backend/app/shared/models.py`

## 0) 프로젝트 이전 (2026-04-20)

- **구 프로젝트** (웹+앱 혼용): `kvknerzsqgmmdmyxlorl` → **더 이상 사용 안 함**
- **신규 프로젝트** (Toss 미니앱 전용): `gxvtgrcqkbdibkyeqyil` (ap-northeast-2)
- URL: `https://SUPABASE_PROJECT.supabase.co`
- 마이그레이션: `supabase/migrations/20260420000000_toss_project_init.sql`
- 제거된 웹 전용 컬럼: `kakao_sync_id`, `pg_provider`, `pg_customer_key`

## 1) Snapshot

- Public schema tables: 40
- RLS enabled tables: 40 / 40
- Key B2B helper functions: 9 (is_org_member, is_org_member_with_role, is_parent_of_dog, purge_expired_pii, update_updated_at_column, get_parent_contact, create_organization, verify_parent_phone_last4 + 1)
- Public enums: 13
- Applied migrations on remote DB: see §6; latest verified repair/apply includes `20260520000300_org_logos_storage_policies`.

## 2) Public Table Inventory (Live DB)

### Core/Auth/Billing
- `users`
- `subscriptions`
- `dogs`
- `dog_env` ← `onboarding_survey` JSONB 추가 (2026-04-28, Progressive Profiling Stage 1~3 완성도 추적); `activity_meta` +`walk_frequency`/`walk_duration_minutes` (2026-05-01); `temperament` +`env_reaction`/`person_reaction`/`dog_reaction`/`focus_level`/`attach_level` 5종 기질 (2026-05-01); `rewards_meta.ids` stage2 초기 저장 연결 (2026-05-01) — 모두 JSONB 키 추가, migration 불필요
- `user_settings`
- `noti_history`
- `toss_orders`
- `edge_function_requests`

### Behavior/Coaching
- `behavior_logs`
- `media_assets`
- `ai_coaching` ← `training_candidate`, `training_quality_score`, `training_approved`, `training_approved_at`, `training_version`, `is_synthetic` 컬럼 추가 (2026-04-21), `dog_id` nullable 변경
- `action_tracker`
- `log_summaries`
- `ai_recommendation_snapshots`
- `ai_recommendation_feedback`
- `ai_cost_usage_daily`
- `ai_cost_usage_monthly`
- `coaching_training_batches` ← 신규 (Fine-tuning 배치 버전 관리, service_role RLS)
- `coaching_synthetic_log` ← 신규 (합성 생성 일별 추적, UNIQUE run_date, service_role RLS)
- `coaching_questions` ← 신규 (2026-04-28): Pro 전용 AI 코치 1:1 질문, 횟수 정책 TBD, auth RLS (select/insert owner)

### Training Content/Execution
- `content_providers`
- `content_metrics`
- `training_library`
- `training_media`
- `training_plans`
- `plan_items`
- `training_sessions`
- `training_goals`
- `training_behavior_snapshots`
- `user_training_status` ← `reaction VARCHAR(20) CHECK ('enjoyed','neutral','sensitive')` 컬럼 추가 (2026-04-27, psql 직접 적용)
- `training_step_attempts` ← 신규 (2026-04-22): 스텝별 시행착오 상세 기록, RLS owner+trainer_read, org_id B2B연결

### B2B Layer
- `organizations`
- `org_members`
- `org_dogs`
- `dog_assignments`
- `daily_reports`
- `parent_interactions`
- `org_analytics_daily`
- `org_subscriptions`
- `ai_cost_usage_org`
- `org_dogs_pii`
- `pii_access_log`

## 3) B2B Core Tables (Design + DDL Source)

Primary reference: `docs/ref/SCHEMA-B2B.md`
Canonical DDL: `supabase/migrations/20260228020042_b2b_tables_and_extensions.sql`

- 10 new B2B tables: `organizations`, `org_members`, `org_dogs`, `dog_assignments`, `daily_reports`, `parent_interactions`, `org_analytics_daily`, `org_subscriptions`, `ai_cost_usage_org`, `org_dogs_pii`
- Additional audit table: `pii_access_log`
- Existing table extensions: `behavior_logs`, `media_assets`, `noti_history`

## 4) Public Enums (Live DB)

- `asset_type`: PHOTO, VIDEO, LOTTIE_SNAPSHOT
- `difficulty_level`: BEGINNER, INTERMEDIATE, ADVANCED
- `dog_sex`: MALE, FEMALE, MALE_NEUTERED, FEMALE_NEUTERED
- `goal_status`: ACTIVE, COMPLETED, PAUSED, EXPIRED
- `goal_type`: WEEKLY_SESSIONS, DAILY_MINUTES, WEEKLY_REPS
- `noti_channel`: ALIMTALK, WEB_PUSH, EMAIL
- `plan_type`: FREE, PRO_MONTHLY, PRO_YEARLY
- `provider_type`: COMPANY, CREATOR, COMMUNITY
- `report_type`: DAILY, WEEKLY, INSIGHT
- `session_event_type`: PAUSE, RESUME, TREAT, REST, NOTE
- `training_status`: COMPLETED, SKIPPED_INEFFECTIVE, SKIPPED_ALREADY_DONE, HIDDEN_BY_AI
- `user_role`: user, trainer, org_owner, org_staff
- `user_status`: active, inactive, banned

## 4.1) Storage Buckets

- `dog-profiles` — public profile image bucket. Owner-folder RLS was applied via `20260520000100_dog_profiles_storage_policies.sql`; DEV_LOCAL and production Toss AIT photo upload were verified on 2026-05-20.
- `org-logos` — public center logo bucket. Owner-folder insert/update/delete plus public read policies were applied via `20260520000300_org_logos_storage_policies.sql`; remote bucket `public=true`, policies `org_logos_public_read`, `org_logos_owner_insert`, `org_logos_owner_update`, `org_logos_owner_delete`, and migration history repair were verified on 2026-05-20.

## 5) RLS Policy Summary (Live DB)

All public tables have RLS enabled.

High-signal policy counts:
- `behavior_logs`: 4
- `daily_reports`: 3
- `dog_assignments`: 3 — `20260521000100_dog_assignments_self_service_rls.sql` lets staff/trainer insert/update only their own active assignment rows while preserving owner/manager org-wide management.
- `dog_env`: 5
- `dogs`: 5
- `org_dogs`: 4
- `org_dogs_pii`: 4
- `org_members`: 3
- `organizations`: 2
- `parent_interactions`: 3
- `toss_orders`: 3
- `user_training_status`: 4

B2B helper functions present:
- `is_org_member(uuid) -> boolean`
- `is_parent_of_dog(uuid) -> boolean`
- `is_org_member_with_role(uuid, text[]) -> boolean`
- `get_parent_contact(uuid) -> table(phone_enc bytea, email_enc bytea)`
- `purge_expired_pii() -> integer`
- `update_updated_at_column() -> trigger`
- `create_organization(p_name text, p_type text) -> organizations` ← 신규 (2026-04-21 적용)
- `verify_parent_phone_last4(p_org_dog_id uuid, p_last4 text) -> boolean` ← 신규 (2026-04-21 적용)

## 6) Migration Status and Drift Check

### Remote applied migrations (MCP)
- `20260212083318_phase7_ai_recommendation_tables`
- `20260212092350_hotfix_user_training_status`
- `20260212095042_training_behavior_snapshots`
- `20260214134529_fix_dog_profiles_rls`
- `20260227030437_phase11_expand_noti_history`
- `20260228015912_b2c_column_gaps_and_enum_migration`
- `20260228020042_b2b_tables_and_extensions`
- `20260228034127_dogs_and_dog_env_rls_write_policies`
- `20260301111950_add_user_training_status_rls_policies`
- `20260520000100_dog_profiles_storage_policies`
- `20260520000300_org_logos_storage_policies`

### Local migration files in repo
- `20260227121000_phase11_expand_noti_history.sql`
- `20260228015912_b2c_column_gaps_and_enum_migration.sql`
- `20260228020042_b2b_tables_and_extensions.sql`
- `20260228124500_dogs_and_dog_env_rls_write_policies.sql`
- `20260228_b2b_tables.sql` (legacy duplicate form)
- `20260420010000_verify_parent_phone_last4_rpc.sql`
- `20260420200000_coaching_training_flywheel.sql` ← **적용 완료** (2026-04-21, psql 직접 적용, ai_coaching 컬럼 6개 + coaching_training_batches + coaching_synthetic_log)
- `20260420010000_verify_parent_phone_last4_rpc.sql` ← **적용 완료** (2026-04-21, `gxvtgrcqkbdibkyeqyil`에 직접 적용)
- `20260421100000_create_org_rpc.sql` ← **적용 완료** (2026-04-21, `create_organization(p_name, p_type) RETURNS organizations` RPC, 조직 생성 + owner 멤버 자동 등록)
- `20260301160000_add_reaction_to_training_status.sql` ← **적용 완료** (2026-04-27, psql 직접 적용, `user_training_status.reaction VARCHAR(20)` + `idx_training_status_reaction` 인덱스)
- `20260520000100_dog_profiles_storage_policies.sql` ← **적용 완료** (2026-05-20, profile image upload RLS)
- `20260520000300_org_logos_storage_policies.sql` ← **적용 완료** (2026-05-20, org logo bucket/RLS + migration history repair)

### Drift notes (needs sync)
- Remote has versions not present in local repo: `20260212083318`, `20260212092350`, `20260212095042`, `20260214134529`, `20260301111950`.
- Similar-purpose migration version mismatch exists for dogs/dog_env RLS:
  - remote: `20260228034127...`
  - local: `20260228124500...`
- `20260228_b2b_tables.sql` and `20260228020042_b2b_tables_and_extensions.sql` overlap heavily. Keep one canonical source (`20260228020042`) and archive/deprecate the other.

## 7) Edge Functions Inventory

| Function | Version | Config | Purpose |
|---|---|---|---|
| `login-with-toss` | v18 | verify_jwt=false | Toss authCode → UUID user_id upsert + Supabase session bridge. |
| `verify-iap-order` | v17 | verify_jwt=true | Toss IAP 주문 검증 + toss_orders 영속화, real mTLS. |
| `send-smart-message` | v14 | verify_jwt=true | notification_pref/marketing_agreed guard + Toss Smart Message send, real mTLS. |
| `grant-toss-points` | v14 | verify_jwt=true | IAP 완료 후 Toss Points 적립, real mTLS. |
| `generate-report` | v8 | verify_jwt=true | B2B 일일/주간 리포트 AI 생성. |
| `legal` | v13 | verify_jwt=false | 약관/개인정보 HTML 서빙. |
| `toss-disconnect` | v17 | verify_jwt=false | Toss 연결해제 콜백 + ping 처리. |
| `withdraw-user` | v3 | verify_jwt=false | 본인 계정 실삭제: public.users CASCADE → auth.users. ES256 JWT 호환(Admin API 검증). |
| `assign-b2b-role` | v2 | verify_jwt=false | B2B 역할 자동 부여 → `auth.users.raw_user_meta_data.b2b_role` 업데이트. 내부 JWT 수동 검증. (2026-04-21 올바른 프로젝트에 재배포) |

## 8) Recommended Operating Rule

- Schema truth source: remote MCP metadata + applied migrations list.
- Code truth source: models and queries in `Backend/app/shared/` + `supabase/functions/`.
- When conflict occurs, treat remote applied migrations as current truth and backfill missing local migration files before next release.
