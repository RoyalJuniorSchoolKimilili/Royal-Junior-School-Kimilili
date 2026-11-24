-- Complete the curriculum-design record with framework components and current KICD area names.
alter table public.assessments
  add column if not exists national_goal text,
  add column if not exists essence_statement text,
  add column if not exists general_learning_outcomes text,
  add column if not exists curriculum_design_reference text;

insert into public.subjects(name,active) values
 ('English Activities',true),('Psychomotor and Creative Activities',true),
 ('Religious Education Activities',true),('Christian Religious Education',true),
 ('Islamic Religious Education',true),('Hindu Religious Education',true),
 ('Creative Arts & Sports',true)
on conflict (name) do update set active=true;
