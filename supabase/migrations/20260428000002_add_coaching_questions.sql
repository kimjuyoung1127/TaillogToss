-- AI 코치 1:1 질문 테이블 (Pro 전용, 횟수 정책 TBD)

CREATE TABLE IF NOT EXISTS coaching_questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  dog_id         UUID        NOT NULL REFERENCES dogs(id)   ON DELETE CASCADE,
  question       TEXT        NOT NULL,
  context        TEXT,
  answer         TEXT        NOT NULL,
  billing_period VARCHAR(7),           -- 'YYYY-MM' 형식, 횟수 제한 정책 확정 시 사용
  ai_tokens_used INTEGER     DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cq_user_dog
  ON coaching_questions(user_id, dog_id, created_at DESC);

-- RLS 활성화
ALTER TABLE coaching_questions ENABLE ROW LEVEL SECURITY;

-- 본인 질문만 조회
CREATE POLICY "coaching_questions_select_own"
  ON coaching_questions FOR SELECT
  USING (auth.uid() = user_id);

-- 본인만 생성
CREATE POLICY "coaching_questions_insert_own"
  ON coaching_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 삭제/수정 불가 (이력 보존)
