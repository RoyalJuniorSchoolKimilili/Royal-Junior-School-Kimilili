-- Remove redundant permissive ALL policies; preserve admin CRUD as explicit commands.
drop policy profiles_admin_manage on public.profiles;
create policy profiles_admin_insert on public.profiles for insert to authenticated with check ((select private.is_admin()));
create policy profiles_admin_update on public.profiles for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy profiles_admin_delete on public.profiles for delete to authenticated using ((select private.is_admin()));

drop policy classes_admin_manage on public.classes;
create policy classes_admin_insert on public.classes for insert to authenticated with check ((select private.is_admin()));
create policy classes_admin_update on public.classes for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy classes_admin_delete on public.classes for delete to authenticated using ((select private.is_admin()));

drop policy subjects_admin_manage on public.subjects;
create policy subjects_admin_insert on public.subjects for insert to authenticated with check ((select private.is_admin()));
create policy subjects_admin_update on public.subjects for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy subjects_admin_delete on public.subjects for delete to authenticated using ((select private.is_admin()));

drop policy terms_admin_manage on public.academic_terms;
create policy terms_admin_insert on public.academic_terms for insert to authenticated with check ((select private.is_admin()));
create policy terms_admin_update on public.academic_terms for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy terms_admin_delete on public.academic_terms for delete to authenticated using ((select private.is_admin()));

drop policy learners_admin_manage on public.learners;
create policy learners_admin_insert on public.learners for insert to authenticated with check ((select private.is_admin()));
create policy learners_admin_update on public.learners for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy learners_admin_delete on public.learners for delete to authenticated using ((select private.is_admin()));

drop policy parent_links_admin_manage on public.parent_learners;
create policy parent_links_admin_insert on public.parent_learners for insert to authenticated with check ((select private.is_admin()));
create policy parent_links_admin_update on public.parent_learners for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy parent_links_admin_delete on public.parent_learners for delete to authenticated using ((select private.is_admin()));

drop policy teacher_assignments_admin_manage on public.teacher_classes;
create policy teacher_assignments_admin_insert on public.teacher_classes for insert to authenticated with check ((select private.is_admin()));
create policy teacher_assignments_admin_update on public.teacher_classes for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy teacher_assignments_admin_delete on public.teacher_classes for delete to authenticated using ((select private.is_admin()));

drop policy fee_structures_admin_manage on public.fee_structures;
create policy fee_structures_admin_insert on public.fee_structures for insert to authenticated with check ((select private.is_admin()));
create policy fee_structures_admin_update on public.fee_structures for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy fee_structures_admin_delete on public.fee_structures for delete to authenticated using ((select private.is_admin()));

drop policy fee_payments_admin_manage on public.fee_payments;
create policy fee_payments_admin_insert on public.fee_payments for insert to authenticated with check ((select private.is_admin()));
create policy fee_payments_admin_update on public.fee_payments for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy fee_payments_admin_delete on public.fee_payments for delete to authenticated using ((select private.is_admin()));

drop policy learner_documents_admin_manage on public.learner_documents;
create policy learner_documents_admin_insert on public.learner_documents for insert to authenticated with check ((select private.is_admin()));
create policy learner_documents_admin_update on public.learner_documents for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy learner_documents_admin_delete on public.learner_documents for delete to authenticated using ((select private.is_admin()));

drop policy notices_admin_manage on public.notices;
create policy notices_admin_insert on public.notices for insert to authenticated with check ((select private.is_admin()));
create policy notices_admin_update on public.notices for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy notices_admin_delete on public.notices for delete to authenticated using ((select private.is_admin()));

-- Index every foreign-key column used for joins and referential checks.
create index assessments_created_by_idx on public.assessments(created_by);
create index assessments_subject_idx on public.assessments(subject_id);
create index assessments_term_idx on public.assessments(term_id);
create index attendance_class_idx on public.attendance(class_id);
create index attendance_recorded_by_idx on public.attendance(recorded_by);
create index audit_logs_actor_idx on public.audit_logs(actor_id);
create index fee_payments_approved_by_idx on public.fee_payments(approved_by);
create index fee_payments_recorded_by_idx on public.fee_payments(recorded_by);
create index fee_structures_class_idx on public.fee_structures(class_id);
create index learner_documents_uploaded_by_idx on public.learner_documents(uploaded_by);
create index marks_recorded_by_idx on public.marks(recorded_by);
create index notices_class_idx on public.notices(class_id);
create index notices_created_by_idx on public.notices(created_by);
create index payment_submissions_reviewed_by_idx on public.payment_submissions(reviewed_by);
create index payment_submissions_submitted_by_idx on public.payment_submissions(submitted_by);
create index teacher_classes_class_idx on public.teacher_classes(class_id);
create index teacher_classes_subject_idx on public.teacher_classes(subject_id);
