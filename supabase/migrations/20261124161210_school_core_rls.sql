-- Royal Junior School Kimilili: core schema and row-level security
-- Parent accounts are school-issued: auth signup creates a pending parent profile.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'parent' check (role in ('admin','teacher','parent')),
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.classes (
  id uuid primary key default gen_random_uuid(), name text not null unique,
  level_order integer not null default 0, active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.subjects (
  id uuid primary key default gen_random_uuid(), name text not null unique, active boolean not null default true
);
create table public.academic_terms (
  id uuid primary key default gen_random_uuid(), academic_year integer not null,
  term_number smallint not null check (term_number between 1 and 3), name text not null,
  starts_on date, ends_on date, active boolean not null default false,
  unique (academic_year, term_number),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);
create table public.learners (
  id uuid primary key default gen_random_uuid(), admission_number text not null unique,
  full_name text not null, class_id uuid references public.classes(id) on delete restrict,
  date_of_birth date, gender text, study_mode text not null default 'day' check (study_mode in ('day','boarding')),
  enrollment_status text not null default 'active' check (enrollment_status in ('active','inactive','graduated','transferred')),
  guardian_name text, guardian_phone text, confidential_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.parent_learners (
  id uuid primary key default gen_random_uuid(), parent_id uuid not null references public.profiles(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  relationship text, primary_contact boolean not null default false, created_at timestamptz not null default now(),
  unique (parent_id, learner_id)
);
create table public.teacher_classes (
  id uuid primary key default gen_random_uuid(), teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null, created_at timestamptz not null default now(),
  unique (teacher_id, class_id, subject_id)
);
create table public.attendance (
  id uuid primary key default gen_random_uuid(), learner_id uuid not null references public.learners(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict, attendance_date date not null,
  status text not null check (status in ('present','absent','late','excused')), note text,
  recorded_by uuid not null references public.profiles(id), created_at timestamptz not null default now(),
  unique (learner_id, attendance_date)
);
create table public.assessments (
  id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  term_id uuid not null references public.academic_terms(id) on delete restrict,
  title text not null, assessment_date date, created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.marks (
  id uuid primary key default gen_random_uuid(), assessment_id uuid not null references public.assessments(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  score numeric(7,2), maximum_score numeric(7,2), grade text, feedback text,
  recorded_by uuid not null references public.profiles(id), created_at timestamptz not null default now(),
  unique (assessment_id, learner_id), check (score is null or score >= 0),
  check (maximum_score is null or maximum_score > 0),
  check (score is null or maximum_score is null or score <= maximum_score)
);
create table public.fee_structures (
  id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id) on delete restrict,
  academic_year integer not null, term_number smallint not null check (term_number between 1 and 3),
  study_mode text not null check (study_mode in ('day','boarding')), item_name text not null,
  amount_kes numeric(12,2) not null check (amount_kes >= 0), active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.fee_payments (
  id uuid primary key default gen_random_uuid(), learner_id uuid not null references public.learners(id) on delete restrict,
  amount_kes numeric(12,2) not null check (amount_kes > 0),
  payment_method text not null check (payment_method in ('mpesa','cash','bank','other')),
  payment_reference text, receipt_number text unique, paid_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  recorded_by uuid references public.profiles(id), approved_by uuid references public.profiles(id),
  approved_at timestamptz, notes text, created_at timestamptz not null default now()
);
create table public.payment_submissions (
  id uuid primary key default gen_random_uuid(), learner_id uuid not null references public.learners(id) on delete restrict,
  submitted_by uuid not null references public.profiles(id), amount_kes numeric(12,2) not null check (amount_kes > 0),
  payment_method text not null default 'mpesa' check (payment_method in ('mpesa','bank','other')),
  payment_reference text not null, payer_phone text, submitted_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id), reviewed_at timestamptz, review_note text
);
create table public.learner_documents (
  id uuid primary key default gen_random_uuid(), learner_id uuid not null references public.learners(id) on delete cascade,
  document_type text not null, storage_path text not null unique, original_filename text,
  uploaded_by uuid not null references public.profiles(id), created_at timestamptz not null default now()
);
create table public.notices (
  id uuid primary key default gen_random_uuid(), title text not null, body text not null,
  audience text not null default 'all' check (audience in ('all','parents','teachers','class')),
  class_id uuid references public.classes(id) on delete cascade, published boolean not null default false,
  publish_at timestamptz, expires_at timestamptz, created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check ((audience = 'class' and class_id is not null) or (audience <> 'class' and class_id is null))
);
create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references public.profiles(id),
  action text not null, entity_type text not null, entity_id text,
  details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create index learners_class_idx on public.learners(class_id);
create index parent_learners_parent_idx on public.parent_learners(parent_id);
create index parent_learners_learner_idx on public.parent_learners(learner_id);
create index teacher_classes_teacher_idx on public.teacher_classes(teacher_id);
create index attendance_learner_date_idx on public.attendance(learner_id, attendance_date desc);
create index assessments_class_term_idx on public.assessments(class_id, term_id);
create index marks_learner_idx on public.marks(learner_id);
create index fee_payments_learner_idx on public.fee_payments(learner_id, paid_at desc);
create index payment_submissions_learner_idx on public.payment_submissions(learner_id, submitted_at desc);
create index notices_publish_idx on public.notices(published, publish_at, expires_at);

create or replace function private.is_approved_user()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.approval_status = 'approved'); $$;
create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin' and p.approval_status = 'approved'); $$;
create or replace function private.teaches_class(target_class uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.teacher_classes tc join public.profiles p on p.id = tc.teacher_id
  where tc.teacher_id = (select auth.uid()) and tc.class_id = target_class and p.role = 'teacher' and p.approval_status = 'approved'); $$;
create or replace function private.can_access_learner(target_learner uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select private.is_admin()
  or exists (select 1 from public.parent_learners pl join public.profiles p on p.id = pl.parent_id
    where pl.learner_id = target_learner and pl.parent_id = (select auth.uid()) and p.role = 'parent' and p.approval_status = 'approved')
  or exists (select 1 from public.learners l where l.id = target_learner and private.teaches_class(l.class_id)); $$;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_approved_user() to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.teaches_class(uuid) to authenticated;
grant execute on function private.can_access_learner(uuid) to authenticated;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, approval_status)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'parent', 'pending')
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_school_profile on auth.users;
create trigger on_auth_user_created_school_profile after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.academic_terms enable row level security;
alter table public.learners enable row level security;
alter table public.parent_learners enable row level security;
alter table public.teacher_classes enable row level security;
alter table public.attendance enable row level security;
alter table public.assessments enable row level security;
alter table public.marks enable row level security;
alter table public.fee_structures enable row level security;
alter table public.fee_payments enable row level security;
alter table public.payment_submissions enable row level security;
alter table public.learner_documents enable row level security;
alter table public.notices enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_read_self_or_admin on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));
create policy profiles_admin_manage on public.profiles for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy classes_read_approved on public.classes for select to authenticated using ((select private.is_approved_user()));
create policy classes_admin_manage on public.classes for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy subjects_read_approved on public.subjects for select to authenticated using ((select private.is_approved_user()));
create policy subjects_admin_manage on public.subjects for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy terms_read_approved on public.academic_terms for select to authenticated using ((select private.is_approved_user()));
create policy terms_admin_manage on public.academic_terms for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy learners_read_authorized on public.learners for select to authenticated using ((select private.can_access_learner(id)));
create policy learners_admin_manage on public.learners for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy parent_links_read_self_or_admin on public.parent_learners for select to authenticated using (parent_id = (select auth.uid()) or (select private.is_admin()));
create policy parent_links_admin_manage on public.parent_learners for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy teacher_assignments_read_self_or_admin on public.teacher_classes for select to authenticated using (teacher_id = (select auth.uid()) or (select private.is_admin()));
create policy teacher_assignments_admin_manage on public.teacher_classes for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy attendance_read_authorized on public.attendance for select to authenticated using ((select private.can_access_learner(learner_id)));
create policy attendance_teacher_insert on public.attendance for insert to authenticated
with check (((select private.is_admin()) or (select private.teaches_class(class_id)))
  and exists (select 1 from public.learners l where l.id = attendance.learner_id and l.class_id = attendance.class_id)
  and ((select private.is_admin()) or recorded_by = (select auth.uid())));
create policy attendance_teacher_update on public.attendance for update to authenticated
using ((select private.is_admin()) or (select private.teaches_class(class_id)))
with check (((select private.is_admin()) or (select private.teaches_class(class_id)))
  and exists (select 1 from public.learners l where l.id = attendance.learner_id and l.class_id = attendance.class_id)
  and ((select private.is_admin()) or recorded_by = (select auth.uid())));

create policy assessments_read_authorized on public.assessments for select to authenticated
using ((select private.is_admin()) or (select private.teaches_class(class_id)) or exists (
  select 1 from public.learners l join public.parent_learners pl on pl.learner_id = l.id
  join public.profiles p on p.id = pl.parent_id
  where l.class_id = assessments.class_id and pl.parent_id = (select auth.uid())
    and p.role = 'parent' and p.approval_status = 'approved'));
create policy assessments_admin_teacher_insert on public.assessments for insert to authenticated
with check ((select private.is_admin()) or ((select private.teaches_class(class_id)) and created_by = (select auth.uid())));
create policy assessments_admin_teacher_update on public.assessments for update to authenticated
using ((select private.is_admin()) or (select private.teaches_class(class_id)))
with check ((select private.is_admin()) or ((select private.teaches_class(class_id)) and created_by = (select auth.uid())));
create policy assessments_admin_delete on public.assessments for delete to authenticated using ((select private.is_admin()));

create policy marks_read_authorized on public.marks for select to authenticated using ((select private.can_access_learner(learner_id)));
create policy marks_teacher_insert on public.marks for insert to authenticated
with check ((select private.is_admin()) or (recorded_by = (select auth.uid()) and exists (
  select 1 from public.assessments a join public.learners l on l.id = marks.learner_id
  where a.id = marks.assessment_id and a.class_id = l.class_id and private.teaches_class(a.class_id))));
create policy marks_teacher_update on public.marks for update to authenticated
using ((select private.is_admin()) or exists (select 1 from public.assessments a where a.id = marks.assessment_id and private.teaches_class(a.class_id)))
with check ((select private.is_admin()) or (recorded_by = (select auth.uid()) and exists (
  select 1 from public.assessments a join public.learners l on l.id = marks.learner_id
  where a.id = marks.assessment_id and a.class_id = l.class_id and private.teaches_class(a.class_id))));
create policy marks_admin_delete on public.marks for delete to authenticated using ((select private.is_admin()));

create policy fee_structures_read_parent_class on public.fee_structures for select to authenticated
using ((select private.is_admin()) or exists (
  select 1 from public.learners l join public.parent_learners pl on pl.learner_id = l.id
  join public.profiles p on p.id = pl.parent_id
  where l.class_id = fee_structures.class_id and l.study_mode = fee_structures.study_mode
    and pl.parent_id = (select auth.uid()) and p.role = 'parent' and p.approval_status = 'approved'));
create policy fee_structures_admin_manage on public.fee_structures for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy fee_payments_read_parent_admin on public.fee_payments for select to authenticated
using ((select private.is_admin()) or (status = 'approved' and exists (
  select 1 from public.parent_learners pl join public.profiles p on p.id = pl.parent_id
  where pl.learner_id = fee_payments.learner_id and pl.parent_id = (select auth.uid()) and p.approval_status = 'approved')));
create policy fee_payments_admin_manage on public.fee_payments for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy payment_submissions_read_own_or_admin on public.payment_submissions for select to authenticated
using (submitted_by = (select auth.uid()) or (select private.is_admin()));
create policy payment_submissions_parent_submit on public.payment_submissions for insert to authenticated
with check (submitted_by = (select auth.uid()) and exists (
  select 1 from public.parent_learners pl join public.profiles p on p.id = pl.parent_id
  where pl.learner_id = payment_submissions.learner_id and pl.parent_id = (select auth.uid())
    and p.role = 'parent' and p.approval_status = 'approved'));
create policy payment_submissions_admin_update on public.payment_submissions for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy payment_submissions_admin_delete on public.payment_submissions for delete to authenticated using ((select private.is_admin()));

create policy learner_documents_read_parent_admin on public.learner_documents for select to authenticated
using ((select private.is_admin()) or exists (
  select 1 from public.parent_learners pl join public.profiles p on p.id = pl.parent_id
  where pl.learner_id = learner_documents.learner_id and pl.parent_id = (select auth.uid())
    and p.approval_status = 'approved'));
create policy learner_documents_admin_manage on public.learner_documents for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy notices_read_audience on public.notices for select to authenticated
using (
  (select private.is_admin())
  or (
    (select private.is_approved_user())
    and published = true
    and (publish_at is null or publish_at <= now())
    and (expires_at is null or expires_at > now())
    and (
      audience = 'all'
      or (audience = 'parents' and exists (
        select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'parent'
      ))
      or (audience = 'teachers' and exists (
        select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'teacher'
      ))
      or (audience = 'class' and (
        (select private.teaches_class(class_id))
        or exists (
          select 1 from public.learners l
          join public.parent_learners pl on pl.learner_id = l.id
          join public.profiles p on p.id = pl.parent_id
          where l.class_id = notices.class_id
            and pl.parent_id = (select auth.uid())
            and p.role = 'parent' and p.approval_status = 'approved'
        )
      ))
    )
  )
);
create policy notices_admin_manage on public.notices for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy audit_logs_admin_read on public.audit_logs for select to authenticated using ((select private.is_admin()));
create policy audit_logs_admin_insert on public.audit_logs for insert to authenticated
with check ((select private.is_admin()) and actor_id = (select auth.uid()));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.classes, public.subjects, public.academic_terms, public.learners,
  public.parent_learners, public.teacher_classes, public.attendance, public.assessments, public.marks,
  public.fee_structures, public.fee_payments, public.payment_submissions, public.learner_documents,
  public.notices, public.audit_logs to authenticated;
grant insert, update, delete on public.profiles, public.classes, public.subjects, public.academic_terms,
  public.learners, public.parent_learners, public.teacher_classes, public.attendance, public.assessments,
  public.marks, public.fee_structures, public.fee_payments, public.payment_submissions,
  public.learner_documents, public.notices, public.audit_logs to authenticated;

insert into storage.buckets (id, name, public)
values ('learner-documents', 'learner-documents', false)
on conflict (id) do update set public = false;
create policy learner_documents_storage_read on storage.objects for select to authenticated
using (bucket_id = 'learner-documents' and (
  (select private.is_admin()) or exists (
    select 1 from public.parent_learners pl join public.profiles p on p.id = pl.parent_id
    where pl.parent_id = (select auth.uid()) and p.role = 'parent' and p.approval_status = 'approved'
      and pl.learner_id = case
        when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        then ((storage.foldername(name))[1])::uuid else null end
  )
));
create policy learner_documents_storage_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'learner-documents' and (select private.is_admin()));
create policy learner_documents_storage_admin_update on storage.objects for update to authenticated
using (bucket_id = 'learner-documents' and (select private.is_admin()))
with check (bucket_id = 'learner-documents' and (select private.is_admin()));
create policy learner_documents_storage_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'learner-documents' and (select private.is_admin()));
