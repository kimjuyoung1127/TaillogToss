-- Phase D-1-a: 훈련 시행착오 상세 기록 테이블
-- Parity: UI-TRAINING-DETAIL-001
-- VAR-1: user_training_status.reaction/memo는 유지 (빠른 반응 저장용)
-- VAR-3: RLS 완전 적용 (B2B 훈련사 읽기 포함)

CREATE TABLE IF NOT EXISTS training_step_attempts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id          uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  org_id          uuid REFERENCES organizations(id) ON DELETE SET NULL,   -- B2B 연결
  step_id         text NOT NULL,
  curriculum_id   text NOT NULL,
  day_number      integer NOT NULL,
  attempt_number  integer NOT NULL DEFAULT 1,

  -- 반응 (user_training_status와 별개 — 시도별 상세 기록용)
  reaction        text CHECK (reaction IN ('enjoyed', 'neutral', 'sensitive')),

  -- 시행착오 상세
  situation_tags  text[],           -- 예: ['잘됐어요', '불안해했어요']
  method_used     text,
  what_worked     text,
  what_didnt_work text,

  recorded_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 인덱스: 강아지별 스텝 최신 시도 조회
CREATE INDEX IF NOT EXISTS step_attempts_dog_step_idx
  ON training_step_attempts (dog_id, step_id, created_at DESC);

-- 인덱스: B2B 조직별 조회
CREATE INDEX IF NOT EXISTS step_attempts_org_idx
  ON training_step_attempts (org_id, created_at DESC)
  WHERE org_id IS NOT NULL;

-- RLS 활성화
ALTER TABLE training_step_attempts ENABLE ROW LEVEL SECURITY;

-- 정책 1: 본인 강아지 기록 (B2C 사용자 — 읽기/쓰기 모두)
CREATE POLICY step_attempts_owner ON training_step_attempts
  FOR ALL
  USING (
    dog_id IN (
      SELECT id FROM dogs WHERE user_id = auth.uid()
    )
  );

-- 정책 2: B2B 훈련사 — 소속 org 강아지 읽기 전용
CREATE POLICY step_attempts_trainer_read ON training_step_attempts
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- 코멘트
COMMENT ON TABLE training_step_attempts IS '훈련 스텝별 시행착오 상세 기록 (Optional 추가 레코드 — user_training_status와 별개)';
COMMENT ON COLUMN training_step_attempts.situation_tags IS '상황 칩 멀티 선택: 잘됐어요, 불안해했어요 등';
COMMENT ON COLUMN training_step_attempts.org_id IS 'B2B: 훈련사가 기록한 경우 소속 org 연결';
