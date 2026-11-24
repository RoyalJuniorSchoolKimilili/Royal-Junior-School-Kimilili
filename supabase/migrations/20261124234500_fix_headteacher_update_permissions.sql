drop policy if exists attendance_teacher_update on public.attendance;
create policy attendance_teacher_update on public.attendance
for update to authenticated
using (private.is_admin() or private.is_academic_manager() or private.teaches_class(class_id))
with check (
  (private.is_admin() or private.is_academic_manager() or private.teaches_class(class_id))
  and exists (select 1 from public.learners l
    where l.id = attendance.learner_id and l.class_id = attendance.class_id)
  and (private.is_admin() or private.is_academic_manager() or recorded_by = (select auth.uid()))
);

drop policy if exists assessments_admin_teacher_update on public.assessments;
create policy assessments_admin_teacher_update on public.assessments
for update to authenticated
using (private.is_admin() or private.is_academic_manager() or private.teaches_class(class_id))
with check (
  private.is_admin() or private.is_academic_manager()
  or (private.teaches_class(class_id) and created_by = (select auth.uid()))
);

drop policy if exists marks_teacher_update on public.marks;
create policy marks_teacher_update on public.marks
for update to authenticated
using (
  private.is_admin() or private.is_academic_manager()
  or exists (select 1 from public.assessments a
    where a.id = marks.assessment_id and private.teaches_class(a.class_id))
)
with check (
  private.is_admin()
  or (
    exists (select 1 from public.assessments a join public.learners l on l.id = marks.learner_id
      where a.id = marks.assessment_id and a.class_id = l.class_id)
    and (
      private.is_academic_manager()
      or (
        recorded_by = (select auth.uid())
        and exists (select 1 from public.assessments a
          where a.id = marks.assessment_id and private.teaches_class(a.class_id))
      )
    )
  )
);
