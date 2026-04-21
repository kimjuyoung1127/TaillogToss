-- ============================================================
-- Phase 3: dogs 테이블 컬럼 추가 + org_dogs parent_phone_last4
-- Parity: B2B-001
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. dogs 테이블 — 의료/보호자 주소 컬럼 추가
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.dogs
  ADD COLUMN IF NOT EXISTS vet_name        TEXT,
  ADD COLUMN IF NOT EXISTS animal_reg_no   TEXT,
  ADD COLUMN IF NOT EXISTS parent_address  TEXT;

COMMENT ON COLUMN public.dogs.vet_name       IS '자주 가는 동물병원 이름 (선택)';
COMMENT ON COLUMN public.dogs.animal_reg_no  IS '국가 동물등록번호 15자리 (선택)';
COMMENT ON COLUMN public.dogs.parent_address IS '보호자 주소 (선택, 비암호화 — 민감도 낮음)';

-- ─────────────────────────────────────────────────────────────
-- 2. org_dogs 테이블 — parent_phone_last4 추가
--    verify_parent_phone_last4 RPC의 정확한 비교를 위해 명문 저장
--    (org_dogs_pii.parent_phone_enc는 암호화/btoa 저장, 검증엔 last4 사용)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.org_dogs
  ADD COLUMN IF NOT EXISTS parent_phone_last4 TEXT CHECK (parent_phone_last4 ~ '^\d{4}$' OR parent_phone_last4 IS NULL);

COMMENT ON COLUMN public.org_dogs.parent_phone_last4 IS '보호자 전화번호 뒷 4자리 (인증 전용 명문, PII 비해당)';

-- ─────────────────────────────────────────────────────────────
-- 3. verify_parent_phone_last4 RPC 수정
--    기존: right(pii.parent_phone_enc, 4) → btoa 문자열 뒤 4자리 (오작동)
--    수정: org_dogs.parent_phone_last4 직접 비교 (정확한 검증)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.verify_parent_phone_last4(
  p_share_token TEXT,
  p_last_four   TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stored_last4 TEXT;
BEGIN
  -- share_token → org_dogs.parent_phone_last4 조회
  SELECT od.parent_phone_last4 INTO v_stored_last4
  FROM public.daily_reports dr
  JOIN public.org_dogs od
    ON od.dog_id = dr.dog_id
   AND od.org_id = dr.created_by_org_id
  WHERE dr.share_token = p_share_token
    AND dr.expires_at > now()
  LIMIT 1;

  IF v_stored_last4 IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN v_stored_last4 = p_last_four;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_parent_phone_last4(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_parent_phone_last4(TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.verify_parent_phone_last4 IS
  '공유 리포트 보호자 인증 — share_token + 전화번호 뒷4자리 비교. org_dogs.parent_phone_last4 사용.';
