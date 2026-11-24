drop policy if exists leadership_read_assessments on public.assessments;
drop policy if exists academic_manager_insert_assessments on public.assessments;
drop policy if exists academic_manager_update_assessments on public.assessments;
drop policy if exists assessments_admin_teacher_insert on public.assessments;
drop policy if exists assessments_admin_teacher_update on public.assessments;
create policy assessments_admin_teacher_insert on public.assessments
for insert to authenticated with check (
  (private.is_admin() or private.is_academic_manager() or private.teaches_class(class_id))
  and created_by = (select auth.uid())
);
create policy assessments_admin_teacher_update on public.assessments
for update to authenticated
using (private.is_admin() or private.is_academic_manager() or private.teaches_class(class_id))
with check (
  private.is_admin() or
  ((private.is_academic_manager() or private.teaches_class(class_id)) and created_by = (select auth.uid()))
);
drop policy if exists assessments_read_authorized on public.assessments;
create policy assessments_read_authorized on public.assessments
for select to authenticated using (
  private.is_school_leader() or private.teaches_class(class_id)
  or exists (
    select 1 from public.learners l join public.parent_learners pl on pl.learner_id = l.id
    join public.profiles p on p.id = pl.parent_id
    where l.class_id = assessments.class_id and pl.parent_id = (select auth.uid())
      and p.role = 'parent' and p.approval_status = 'approved'
  )
);

drop policy if exists academic_manager_insert_attendance on public.attendance;
drop policy if exists academic_manager_update_attendance on public.attendance;
drop policy if exists attendance_teacher_insert on public.attendance;
drop policy if exists attendance_teacher_update on public.attendance;
create policy attendance_teacher_insert on public.attendance
for insert to authenticated with check (
  (private.is_admin() or private.is_academic_manager() or private.teaches_class(class_id))
  and exists (select 1 from public.learners l where l.id = attendance.learner_id and l.class_id = attendance.class_id)
  and (private.is_admin() or recorded_by = (select auth.uid()))
);
create policy attendance_teacher_update on public.attendance
for update to authenticated using (private.is_admin() or private.is_academic_manager() or private.teaches_class(class_id))
with check (
  (private.is_admin() or private.is_academic_manager() or private.teaches_class(class_id))
  and exists (select 1 from public.learners l where l.id = attendance.learner_id and l.class_id = attendance.class_id)
  and (private.is_admin() or recorded_by = (select auth.uid()))
);

drop policy if exists academic_manager_insert_learners on public.learners;
drop policy if exists academic_manager_update_learners on public.learners;
drop policy if exists learners_admin_insert on public.learners;
drop policy if exists learners_admin_update on public.learners;
create policy learners_admin_insert on public.learners
for insert to authenticated with check (private.is_academic_manager());
create policy learners_admin_update on public.learners
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());

drop policy if exists academic_manager_insert_marks on public.marks;
drop policy if exists academic_manager_update_marks on public.marks;
drop policy if exists marks_teacher_insert on public.marks;
drop policy if exists marks_teacher_update on public.marks;
create policy marks_teacher_insert on public.marks
for insert to authenticated with check (
  private.is_admin()
  or (
    (private.is_academic_manager() or private.teaches_class(
      (select a.class_id from public.assessments a where a.id = marks.assessment_id)
    ))
    and recorded_by = (select auth.uid())
    and exists (select 1 from public.assessments a join public.learners l on l.id = marks.learner_id
      where a.id = marks.assessment_id and a.class_id = l.class_id)
  )
);
create policy marks_teacher_update on public.marks
for update to authenticated
using (
  private.is_admin() or private.is_academic_manager()
  or exists (select 1 from public.assessments a where a.id = marks.assessment_id and private.teaches_class(a.class_id))
)
with check (
  private.is_admin()
  or (
    (private.is_academic_manager() or exists (
      select 1 from public.assessments a where a.id = marks.assessment_id and private.teaches_class(a.class_id)
    ))
    and recorded_by = (select auth.uid())
    and exists (select 1 from public.assessments a join public.learners l on l.id = marks.learner_id
      where a.id = marks.assessment_id and a.class_id = l.class_id)
  )
);

drop policy if exists academic_manager_insert_classes on public.classes;
drop policy if exists academic_manager_update_classes on public.classes;
drop policy if exists classes_admin_insert on public.classes;
drop policy if exists classes_admin_update on public.classes;
create policy classes_admin_insert on public.classes
for insert to authenticated with check (private.is_academic_manager());
create policy classes_admin_update on public.classes
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());

drop policy if exists academic_manager_insert_subjects on public.subjects;
drop policy if exists academic_manager_update_subjects on public.subjects;
drop policy if exists subjects_admin_insert on public.subjects;
drop policy if exists subjects_admin_update on public.subjects;
create policy subjects_admin_insert on public.subjects
for insert to authenticated with check (private.is_academic_manager());
create policy subjects_admin_update on public.subjects
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());

drop policy if exists academic_manager_insert_terms on public.academic_terms;
drop policy if exists academic_manager_update_terms on public.academic_terms;
drop policy if exists terms_admin_insert on public.academic_terms;
drop policy if exists terms_admin_update on public.academic_terms;
create policy terms_admin_insert on public.academic_terms
for insert to authenticated with check (private.is_academic_manager());
create policy terms_admin_update on public.academic_terms
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());

drop policy if exists finance_insert_fee_payments on public.fee_payments;
drop policy if exists finance_update_fee_payments on public.fee_payments;
drop policy if exists finance_read_fee_payments on public.fee_payments;
drop policy if exists leadership_read_fee_payments on public.fee_payments;
drop policy if exists fee_payments_admin_insert on public.fee_payments;
drop policy if exists fee_payments_admin_update on public.fee_payments;
drop policy if exists fee_payments_read_parent_admin on public.fee_payments;
create policy fee_payments_admin_insert on public.fee_payments
for insert to authenticated with check (private.is_finance_staff() and recorded_by = (select auth.uid()));
create policy fee_payments_admin_update on public.fee_payments
for update to authenticated using (private.is_finance_staff()) with check (private.is_finance_staff());
create policy fee_payments_read_parent_admin on public.fee_payments
for select to authenticated using (
  private.is_finance_staff() or private.is_school_leader()
  or (status = 'approved' and exists (
    select 1 from public.parent_learners pl join public.profiles p on p.id = pl.parent_id
    where pl.learner_id = fee_payments.learner_id and pl.parent_id = (select auth.uid())
      and p.approval_status = 'approved'
  ))
);

drop policy if exists finance_read_fee_structures on public.fee_structures;
drop policy if exists finance_insert_fee_structures on public.fee_structures;
drop policy if exists finance_update_fee_structures on public.fee_structures;
drop policy if exists fee_structures_admin_insert on public.fee_structures;
drop policy if exists fee_structures_admin_update on public.fee_structures;
drop policy if exists fee_structures_read_parent_class on public.fee_structures;
create policy fee_structures_admin_insert on public.fee_structures
for insert to authenticated with check (private.is_finance_staff());
create policy fee_structures_admin_update on public.fee_structures
for update to authenticated using (private.is_finance_staff()) with check (private.is_finance_staff());
create policy fee_structures_read_parent_class on public.fee_structures
for select to authenticated using (
  private.is_finance_staff() or private.is_school_leader()
  or exists (
    select 1 from public.learners l join public.parent_learners pl on pl.learner_id = l.id
    join public.profiles p on p.id = pl.parent_id
    where l.class_id = fee_structures.class_id and l.study_mode = fee_structures.study_mode
      and pl.parent_id = (select auth.uid()) and p.role = 'parent' and p.approval_status = 'approved'
  )
);

drop policy if exists leadership_read_learner_directory on public.learner_directory_2026;
drop policy if exists learner_directory_staff_read on public.learner_directory_2026;
create policy learner_directory_staff_read on public.learner_directory_2026
for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid())
    and p.role = any (array['admin','teacher','director','headteacher']::text[])
    and p.approval_status = 'approved')
);

drop policy if exists leadership_read_notices on public.notices;
drop policy if exists academic_manager_insert_notices on public.notices;
drop policy if exists academic_manager_update_notices on public.notices;
drop policy if exists notices_admin_insert on public.notices;
drop policy if exists notices_admin_update on public.notices;
drop policy if exists notices_read_audience on public.notices;
create policy notices_admin_insert on public.notices
for insert to authenticated with check (private.is_academic_manager() and created_by = (select auth.uid()));
create policy notices_admin_update on public.notices
for update to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());
create policy notices_read_audience on public.notices
for select to authenticated using (
  private.is_school_leader()
  or (
    private.is_approved_user() and published = true
    and (publish_at is null or publish_at <= now())
    and (expires_at is null or expires_at > now())
    and (
      audience = 'all'
      or (audience = 'parents' and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'parent'))
      or (audience = 'teachers' and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'teacher'))
      or (audience = 'class' and (
        private.teaches_class(class_id)
        or exists (select 1 from public.learners l join public.parent_learners pl on pl.learner_id = l.id
          join public.profiles p on p.id = pl.parent_id
          where l.class_id = notices.class_id and pl.parent_id = (select auth.uid())
            and p.role = 'parent' and p.approval_status = 'approved')
      ))
    )
  )
);
