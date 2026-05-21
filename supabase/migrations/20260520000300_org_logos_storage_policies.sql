-- B2B-001: allow authenticated users to manage their own organization logo uploads.

insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "org_logos_public_read" on storage.objects;
create policy "org_logos_public_read"
on storage.objects for select
to public
using (bucket_id = 'org-logos');

drop policy if exists "org_logos_owner_insert" on storage.objects;
create policy "org_logos_owner_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'org-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "org_logos_owner_update" on storage.objects;
create policy "org_logos_owner_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'org-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'org-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "org_logos_owner_delete" on storage.objects;
create policy "org_logos_owner_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'org-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
