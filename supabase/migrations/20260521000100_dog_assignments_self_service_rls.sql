-- B2B-001: allow org staff/trainers to manage only their own dog assignments.

DROP POLICY IF EXISTS "dog_assignments_insert" ON public.dog_assignments;
DROP POLICY IF EXISTS "dog_assignments_update" ON public.dog_assignments;

CREATE POLICY "dog_assignments_insert" ON public.dog_assignments
FOR INSERT TO public
WITH CHECK (
  (
    org_id IS NOT NULL
    AND public.is_org_member_with_role(org_id, ARRAY['owner', 'manager'])
  )
  OR (
    org_id IS NOT NULL
    AND trainer_user_id = (SELECT auth.uid())
    AND public.is_org_member_with_role(org_id, ARRAY['owner', 'manager', 'staff', 'trainer'])
  )
  OR (
    org_id IS NULL
    AND trainer_user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "dog_assignments_update" ON public.dog_assignments
FOR UPDATE TO public
USING (
  (
    org_id IS NOT NULL
    AND public.is_org_member_with_role(org_id, ARRAY['owner', 'manager'])
  )
  OR (
    org_id IS NOT NULL
    AND trainer_user_id = (SELECT auth.uid())
    AND public.is_org_member_with_role(org_id, ARRAY['owner', 'manager', 'staff', 'trainer'])
  )
  OR (
    org_id IS NULL
    AND trainer_user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  (
    org_id IS NOT NULL
    AND public.is_org_member_with_role(org_id, ARRAY['owner', 'manager'])
  )
  OR (
    org_id IS NOT NULL
    AND trainer_user_id = (SELECT auth.uid())
    AND public.is_org_member_with_role(org_id, ARRAY['owner', 'manager', 'staff', 'trainer'])
  )
  OR (
    org_id IS NULL
    AND trainer_user_id = (SELECT auth.uid())
  )
);
