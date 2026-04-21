-- create_organization RPC: 조직 생성 + owner 멤버 등록을 원자적으로 처리
-- RLS INSERT 정책 없는 organizations 테이블을 SECURITY DEFINER로 우회
-- Parity: B2B-001

CREATE OR REPLACE FUNCTION public.create_organization(
  p_name text,
  p_type text DEFAULT 'daycare'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_org_id  uuid;
  v_org     json;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = 'P0001';
  END IF;

  IF trim(p_name) = '' THEN
    RAISE EXCEPTION 'Organization name cannot be empty' USING ERRCODE = 'P0002';
  END IF;

  -- 1. organizations 생성
  INSERT INTO public.organizations (name, type, owner_user_id, status, max_dogs, max_staff)
  VALUES (trim(p_name), p_type, v_user_id, 'active', 999, 999)
  RETURNING id INTO v_org_id;

  -- 2. org_members에 owner로 자동 등록 (닭/달걀 문제 원자적 해결)
  INSERT INTO public.org_members (org_id, user_id, role, status, accepted_at)
  VALUES (v_org_id, v_user_id, 'owner', 'active', now());

  -- 3. 생성된 조직 반환
  SELECT json_build_object(
    'id',            o.id,
    'name',          o.name,
    'type',          o.type,
    'owner_user_id', o.owner_user_id,
    'status',        o.status,
    'max_dogs',      o.max_dogs,
    'max_staff',     o.max_staff,
    'created_at',    o.created_at,
    'updated_at',    o.updated_at
  ) INTO v_org
  FROM public.organizations o
  WHERE o.id = v_org_id;

  RETURN v_org;
END;
$$;

-- 일반 인증 유저에게 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.create_organization(text, text) TO authenticated;
