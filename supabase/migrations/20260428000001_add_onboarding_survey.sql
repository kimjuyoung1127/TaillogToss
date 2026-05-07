-- Progressive Profiling: dog_env에 onboarding_survey JSONB 추가
-- Stage별 설문 완성도 추적 + 응답 저장

ALTER TABLE dog_env
ADD COLUMN IF NOT EXISTS onboarding_survey JSONB
  NOT NULL DEFAULT '{"completion_stage":1}'::jsonb;

-- 기존 유저 마이그레이션: household_info 있으면 Stage 2 완료로 간주
UPDATE dog_env
SET onboarding_survey = jsonb_build_object(
  'completion_stage', 2,
  'stage1_completed_at', created_at,
  'stage2_completed_at', created_at
)
WHERE household_info IS NOT NULL
  AND onboarding_survey->>'completion_stage' = '1';

-- 나머지(신규/미완료): Stage 1 타임스탬프만 기록
UPDATE dog_env
SET onboarding_survey = jsonb_build_object(
  'completion_stage', 1,
  'stage1_completed_at', created_at
)
WHERE household_info IS NULL
  AND onboarding_survey->>'completion_stage' = '1';

-- 인덱스: completion_stage 기반 쿼리 최적화
CREATE INDEX IF NOT EXISTS idx_dog_env_completion_stage
  ON dog_env ((onboarding_survey->>'completion_stage'));
