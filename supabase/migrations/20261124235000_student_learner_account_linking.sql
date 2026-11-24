-- Student login to learner record mapping; only administrators manage links.
create table if not exists public.student_learner_links (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  learner_id uuid not null unique references public.learners(id) on delete cascade,
  linked_by uuid not null references public.profiles(id),
  linked_at timestamptz not null default now()
);
create index if not exists student_learner_links_learner_idx on public.student_learner_links(learner_id);
alter table public.student_learner_links enable row level security;
revoke all on public.student_learner_links from anon;
grant select, insert, update, delete on public.student_learner_links to authenticated;
create policy student_links_admin_all on public.student_learner_links
for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy student_links_read_self on public.student_learner_links
for select to authenticated using (user_id = (select auth.uid()));

create or replace function private.can_access_learner(target_learner uuid)
returns boolean language sql stable security definer set search_path = ''
as $function$
  select private.is_school_leader()
    or exists (
      select 1 from public.parent_learners pl
      join public.profiles p on p.id = pl.parent_id
      where pl.learner_id = target_learner and pl.parent_id = (select auth.uid())
        and p.role = 'parent' and p.approval_status = 'approved'
    )
    or exists (
      select 1 from public.learners l
      where l.id = target_learner and private.teaches_class(l.class_id)
    )
    or exists (
      select 1 from public.student_learner_links sl
      join public.profiles p on p.id = sl.user_id
      where sl.learner_id = target_learner and sl.user_id = (select auth.uid())
        and p.role = 'student' and p.approval_status = 'approved'
    );
$function$;

create policy fee_payments_student_read_own on public.fee_payments
for select to authenticated
using (
  status = 'approved'
  and exists (
    select 1 from public.student_learner_links sl
    join public.profiles p on p.id = sl.user_id
    where sl.learner_id = fee_payments.learner_id and sl.user_id = (select auth.uid())
      and p.role = 'student' and p.approval_status = 'approved'
  )
);
