create table if not exists public.subject_grade_levels (
  id uuid primary key default gen_random_uuid(),
  grade_level text not null,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  is_optional boolean not null default false,
  curriculum_source text not null default 'KICD CBE curriculum designs',
  created_at timestamptz not null default now(),
  unique (grade_level, subject_id)
);
create index if not exists subject_grade_levels_grade_idx on public.subject_grade_levels (grade_level);
alter table public.subject_grade_levels enable row level security;
grant select, insert, update, delete on public.subject_grade_levels to authenticated;
drop policy if exists subject_grade_levels_approved_read on public.subject_grade_levels;
create policy subject_grade_levels_approved_read on public.subject_grade_levels
for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.approval_status = 'approved')
);
drop policy if exists subject_grade_levels_academic_manage on public.subject_grade_levels;
create policy subject_grade_levels_academic_manage on public.subject_grade_levels
for all to authenticated using (private.is_academic_manager()) with check (private.is_academic_manager());

with grade_map(grade_level, subject_name, is_optional) as (
  values
  ('PP1','Language Activities',false),('PP1','Mathematical Activities',false),('PP1','Creative Arts',false),('PP1','Environmental Activities',false),('PP1','Christian Religious Education',true),('PP1','Islamic Religious Education',true),('PP1','Hindu Religious Education',true),
  ('PP2','Language Activities',false),('PP2','Mathematical Activities',false),('PP2','Creative Arts',false),('PP2','Environmental Activities',false),('PP2','Christian Religious Education',true),('PP2','Islamic Religious Education',true),('PP2','Hindu Religious Education',true),
  ('Grade 1','English',false),('Grade 1','Kiswahili',false),('Grade 1','Mathematics',false),('Grade 1','Environmental Activities',false),('Grade 1','Creative Activities',false),('Grade 1','Christian Religious Education',true),('Grade 1','Islamic Religious Education',true),('Grade 1','Hindu Religious Education',true),('Grade 1','Indigenous Language',true),
  ('Grade 2','English',false),('Grade 2','Kiswahili',false),('Grade 2','Mathematics',false),('Grade 2','Environmental Activities',false),('Grade 2','Creative Activities',false),('Grade 2','Christian Religious Education',true),('Grade 2','Islamic Religious Education',true),('Grade 2','Hindu Religious Education',true),('Grade 2','Indigenous Language',true),
  ('Grade 3','English',false),('Grade 3','Kiswahili',false),('Grade 3','Mathematics',false),('Grade 3','Environmental Activities',false),('Grade 3','Creative Activities',false),('Grade 3','Christian Religious Education',true),('Grade 3','Islamic Religious Education',true),('Grade 3','Hindu Religious Education',true),('Grade 3','Indigenous Language',true),
  ('Grade 4','English',false),('Grade 4','Kiswahili',false),('Grade 4','Mathematics',false),('Grade 4','Agriculture & Nutrition',false),('Grade 4','Social Studies',false),('Grade 4','Creative Activities',false),('Grade 4','Science & Technology',false),('Grade 4','Christian Religious Education',true),('Grade 4','Islamic Religious Education',true),('Grade 4','Hindu Religious Education',true),('Grade 4','Indigenous Language',true),('Grade 4','Arabic',true),('Grade 4','Mandarin',true),('Grade 4','French',true),('Grade 4','German',true),
  ('Grade 5','English',false),('Grade 5','Kiswahili',false),('Grade 5','Mathematics',false),('Grade 5','Agriculture & Nutrition',false),('Grade 5','Social Studies',false),('Grade 5','Creative Activities',false),('Grade 5','Science & Technology',false),('Grade 5','Christian Religious Education',true),('Grade 5','Islamic Religious Education',true),('Grade 5','Hindu Religious Education',true),('Grade 5','Indigenous Language',true),('Grade 5','Arabic',true),('Grade 5','Mandarin',true),('Grade 5','French',true),('Grade 5','German',true),
  ('Grade 6','English',false),('Grade 6','Kiswahili',false),('Grade 6','Mathematics',false),('Grade 6','Agriculture & Nutrition',false),('Grade 6','Social Studies',false),('Grade 6','Creative Activities',false),('Grade 6','Science & Technology',false),('Grade 6','Christian Religious Education',true),('Grade 6','Islamic Religious Education',true),('Grade 6','Hindu Religious Education',true),('Grade 6','Indigenous Language',true),('Grade 6','Arabic',true),('Grade 6','Mandarin',true),('Grade 6','French',true),('Grade 6','German',true),
  ('Grade 7','English',false),('Grade 7','Kiswahili',false),('Grade 7','Mathematics',false),('Grade 7','Integrated Science',false),('Grade 7','Agriculture',false),('Grade 7','Pre-Technical Studies',false),('Grade 7','Creative Arts and Sports',false),('Grade 7','Social Studies',false),('Grade 7','Christian Religious Education',true),('Grade 7','Islamic Religious Education',true),('Grade 7','Hindu Religious Education',true),('Grade 7','Indigenous Language',true),('Grade 7','Arabic',true),('Grade 7','Mandarin',true),('Grade 7','French',true),('Grade 7','German',true),
  ('Grade 8','English',false),('Grade 8','Kiswahili',false),('Grade 8','Mathematics',false),('Grade 8','Integrated Science',false),('Grade 8','Agriculture',false),('Grade 8','Pre-Technical Studies',false),('Grade 8','Creative Arts and Sports',false),('Grade 8','Social Studies',false),('Grade 8','Christian Religious Education',true),('Grade 8','Islamic Religious Education',true),('Grade 8','Hindu Religious Education',true),('Grade 8','Indigenous Language',true),('Grade 8','Arabic',true),('Grade 8','Mandarin',true),('Grade 8','French',true),('Grade 8','German',true),
  ('Grade 9','English',false),('Grade 9','Kiswahili',false),('Grade 9','Mathematics',false),('Grade 9','Integrated Science',false),('Grade 9','Agriculture',false),('Grade 9','Pre-Technical Studies',false),('Grade 9','Creative Arts and Sports',false),('Grade 9','Social Studies',false),('Grade 9','Christian Religious Education',true),('Grade 9','Islamic Religious Education',true),('Grade 9','Hindu Religious Education',true),('Grade 9','Indigenous Language',true),('Grade 9','Arabic',true),('Grade 9','Mandarin',true),('Grade 9','French',true),('Grade 9','German',true)
)
insert into public.subject_grade_levels (grade_level, subject_id, is_optional)
select gm.grade_level, s.id, gm.is_optional from grade_map gm
join public.subjects s on s.name = gm.subject_name and s.active = true
on conflict (grade_level, subject_id) do update
set is_optional = excluded.is_optional, curriculum_source = excluded.curriculum_source;
