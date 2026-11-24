alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['admin','director','headteacher','bursar','teacher','parent','student']::text[]));

create or replace function private.is_school_leader()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = any (array['admin','director','headteacher']::text[])
      and p.approval_status = 'approved');
$$;

create or replace function private.is_academic_manager()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = any (array['admin','headteacher']::text[])
      and p.approval_status = 'approved');
$$;

create or replace function private.is_finance_staff()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = any (array['admin','bursar']::text[])
      and p.approval_status = 'approved');
$$;

create or replace function private.can_access_learner(target_learner uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select private.is_school_leader()
    or exists (select 1 from public.parent_learners pl
      join public.profiles p on p.id = pl.parent_id
      where pl.learner_id = target_learner and pl.parent_id = (select auth.uid())
        and p.role = 'parent' and p.approval_status = 'approved')
    or exists (select 1 from public.learners l
      where l.id = target_learner and private.teaches_class(l.class_id));
$$;

create policy leadership_read_assessments on public.assessments
for select to authenticated using (private.is_school_leader());

create policy academic_manager_insert_learners on public.learners
for insert to authenticated with check (private.is_academic_manager());
create policy academic_manager_update_learners on public.learners
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());

create policy academic_manager_insert_attendance on public.attendance
for insert to authenticated with check (
  private.is_academic_manager()
  and exists (select 1 from public.learners l where l.id = attendance.learner_id and l.class_id = attendance.class_id)
  and recorded_by = (select auth.uid())
);
create policy academic_manager_update_attendance on public.attendance
for update to authenticated using (private.is_academic_manager())
with check (private.is_academic_manager()
  and exists (select 1 from public.learners l where l.id = attendance.learner_id and l.class_id = attendance.class_id));

create policy academic_manager_insert_assessments on public.assessments
for insert to authenticated with check (private.is_academic_manager() and created_by = (select auth.uid()));
create policy academic_manager_update_assessments on public.assessments
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());

create policy academic_manager_insert_marks on public.marks
for insert to authenticated with check (
  private.is_academic_manager() and recorded_by = (select auth.uid())
  and exists (select 1 from public.assessments a join public.learners l on l.id = marks.learner_id
    where a.id = marks.assessment_id and a.class_id = l.class_id));
create policy academic_manager_update_marks on public.marks
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());

create policy academic_manager_insert_classes on public.classes
for insert to authenticated with check (private.is_academic_manager());
create policy academic_manager_update_classes on public.classes
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());
create policy academic_manager_insert_subjects on public.subjects
for insert to authenticated with check (private.is_academic_manager());
create policy academic_manager_update_subjects on public.subjects
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());
create policy academic_manager_insert_terms on public.academic_terms
for insert to authenticated with check (private.is_academic_manager());
create policy academic_manager_update_terms on public.academic_terms
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());

create policy finance_read_fee_payments on public.fee_payments
for select to authenticated using (private.is_finance_staff());
create policy finance_insert_fee_payments on public.fee_payments
for insert to authenticated with check (private.is_finance_staff() and recorded_by = (select auth.uid()));
create policy finance_update_fee_payments on public.fee_payments
for update to authenticated using (private.is_finance_staff()) with check (private.is_finance_staff());

create policy finance_read_fee_structures on public.fee_structures
for select to authenticated using (private.is_finance_staff());
create policy finance_insert_fee_structures on public.fee_structures
for insert to authenticated with check (private.is_finance_staff());
create policy finance_update_fee_structures on public.fee_structures
for update to authenticated using (private.is_finance_staff()) with check (private.is_finance_staff());

create policy leadership_read_learner_directory on public.learner_directory_2026
for select to authenticated using (private.is_school_leader());
create policy leadership_read_notices on public.notices
for select to authenticated using (private.is_school_leader());
create policy academic_manager_insert_notices on public.notices
for insert to authenticated with check (private.is_academic_manager() and created_by = (select auth.uid()));
create policy academic_manager_update_notices on public.notices
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());
