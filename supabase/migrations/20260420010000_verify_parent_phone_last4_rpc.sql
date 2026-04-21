-- verify_parent_phone_last4 RPC
-- 공유 리포트 열람 전 보호자 전화번호 뒷4자리 인증
-- Parity: B2B-001
-- 호출: 비인증(skipAuth) 허용 — 결과는 boolean만 반환(PII 노출 없음)

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
  v_org_dog_id  UUID;
  v_phone_enc   TEXT;
  v_last_four   TEXT;
BEGIN
  -- 1. share_token → org_dog_id 조회
  --    daily_reports.dog_id + created_by_org_id → org_dogs.id
  SELECT od.id INTO v_org_dog_id
  FROM public.daily_reports dr
  JOIN public.org_dogs od
    ON od.dog_id = dr.dog_id
   AND od.org_id = dr.created_by_org_id
  WHERE dr.share_token = p_share_token
    AND dr.expires_at > now()
  LIMIT 1;

  IF v_org_dog_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. PII 테이블에서 전화번호 조회
  SELECT pii.parent_phone_enc INTO v_phone_enc
  FROM public.org_dogs_pii pii
  WHERE pii.org_dog_id = v_org_dog_id;

  IF v_phone_enc IS NULL OR length(v_phone_enc) < 4 THEN
    RETURN FALSE;
  END IF;

  -- 3. 뒷 4자리 비교 (PII 전체 노출 없음)
  v_last_four := right(v_phone_enc, 4);
  RETURN v_last_four = p_last_four;
END;
$$;

-- 비인증 사용자도 호출 가능하도록 anon role에 EXECUTE 권한 부여
GRANT EXECUTE ON FUNCTION public.verify_parent_phone_last4(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_parent_phone_last4(TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.verify_parent_phone_last4 IS
  '공유 리포트 보호자 인증 — share_token + 전화번호 뒷4자리 비교. PII 원본 미노출.';
