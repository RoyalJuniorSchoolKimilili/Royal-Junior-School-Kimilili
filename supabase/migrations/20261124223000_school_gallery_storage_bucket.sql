insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('school-gallery', 'school-gallery', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view school gallery files" on storage.objects;
create policy "Public can view school gallery files"
on storage.objects for select to public
using (bucket_id = 'school-gallery');

drop policy if exists "Approved admins can upload school gallery files" on storage.objects;
create policy "Approved admins can upload school gallery files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'school-gallery'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.approval_status = 'approved'
  )
);

drop policy if exists "Approved admins can update school gallery files" on storage.objects;
create policy "Approved admins can update school gallery files"
on storage.objects for update to authenticated
using (
  bucket_id = 'school-gallery'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.approval_status = 'approved'
  )
)
with check (
  bucket_id = 'school-gallery'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.approval_status = 'approved'
  )
);

drop policy if exists "Approved admins can delete school gallery files" on storage.objects;
create policy "Approved admins can delete school gallery files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'school-gallery'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.approval_status = 'approved'
  )
);
