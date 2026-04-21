-- ────────────────────────────────────────────────────────────
-- AI 코칭 자기개선 플라이휠 스키마
-- 합성 훈련 데이터 생성 + Fine-tuning 준비 컬럼 추가
-- ────────────────────────────────────────────────────────────

-- dog_id를 nullable로 변경 (합성 데이터는 실 dog 없음)
ALTER TABLE public.ai_coaching
  ALTER COLUMN dog_id DROP NOT NULL;

-- ai_coaching 훈련 관련 컬럼 추가
ALTER TABLE public.ai_coaching
  ADD COLUMN IF NOT EXISTS training_candidate      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS training_quality_score  SMALLINT,
  ADD COLUMN IF NOT EXISTS training_approved       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS training_approved_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS training_version        TEXT,
  ADD COLUMN IF NOT EXISTS is_synthetic            BOOLEAN DEFAULT FALSE;

-- 인덱스: 후보 조회 최적화
CREATE INDEX IF NOT EXISTS idx_coaching_training_candidate
  ON public.ai_coaching (training_candidate, training_quality_score DESC)
  WHERE training_candidate = TRUE;

CREATE INDEX IF NOT EXISTS idx_coaching_synthetic
  ON public.ai_coaching (is_synthetic, created_at DESC)
  WHERE is_synthetic = TRUE;

-- ────────────────────────────────────────────────────────────
-- 훈련 배치 버전 관리 테이블
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coaching_training_batches (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_name       TEXT NOT NULL,
  record_count     INT DEFAULT 0,
  jsonl_path       TEXT,
  finetune_job_id  TEXT,
  model_id         TEXT,
  status           TEXT DEFAULT 'pending',  -- pending → training → deployed
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  deployed_at      TIMESTAMPTZ
);

ALTER TABLE public.coaching_training_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only_batches"
  ON public.coaching_training_batches
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 합성 생성 진행 추적 (중복 실행 방지)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coaching_synthetic_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  category        TEXT NOT NULL,
  generated_count INT DEFAULT 0,
  coaching_ids    UUID[],
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (run_date)   -- 하루 1회만 실행
);

ALTER TABLE public.coaching_synthetic_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only_synthetic"
  ON public.coaching_synthetic_log
  USING (auth.role() = 'service_role');
