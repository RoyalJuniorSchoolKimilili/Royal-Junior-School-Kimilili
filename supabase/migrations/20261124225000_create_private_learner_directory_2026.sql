-- Confidential 2026 learner directory. Names and guardian contacts must never be public.
create table if not exists public.learner_directory_2026 (
  id uuid primary key default gen_random_uuid(),
  grade text not null,
  learner_name text not null,
  parent_name text,
  parent_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists learner_directory_2026_grade_idx on public.learner_directory_2026 (grade);
create index if not exists learner_directory_2026_name_idx on public.learner_directory_2026 (lower(learner_name));
alter table public.learner_directory_2026 enable row level security;
revoke all on public.learner_directory_2026 from anon;
grant select, insert, update, delete on public.learner_directory_2026 to authenticated;
drop policy if exists learner_directory_staff_read on public.learner_directory_2026;
create policy learner_directory_staff_read on public.learner_directory_2026
for select to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.role in ('admin','teacher')
    and p.approval_status = 'approved'
));
drop policy if exists learner_directory_admin_manage on public.learner_directory_2026;
create policy learner_directory_admin_insert on public.learner_directory_2026
for insert to authenticated with check ((select private.is_admin()));
create policy learner_directory_admin_update on public.learner_directory_2026
for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy learner_directory_admin_delete on public.learner_directory_2026
for delete to authenticated using ((select private.is_admin()));
