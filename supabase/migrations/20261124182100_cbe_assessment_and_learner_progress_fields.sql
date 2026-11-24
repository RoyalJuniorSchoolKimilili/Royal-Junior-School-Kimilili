-- CBE planning and learner-progress fields for Royal Junior School.
alter table public.assessments
  add column if not exists grade_level text,
  add column if not exists assessment_type text,
  add column if not exists strand text,
  add column if not exists sub_strand text,
  add column if not exists specific_learning_outcomes text,
  add column if not exists key_inquiry_question text,
  add column if not exists learning_experiences text,
  add column if not exists core_competencies text,
  add column if not exists values_to_nurture text,
  add column if not exists pertinent_contemporary_issues text,
  add column if not exists community_service_learning text,
  add column if not exists learning_resources text,
  add column if not exists assessment_method text,
  add column if not exists assessment_tool text,
  add column if not exists assessment_rubric text,
  add column if not exists evidence_of_learning text,
  add column if not exists inclusion_adaptations text,
  add column if not exists teacher_reflection text;

alter table public.marks
  add column if not exists competency_progress text,
  add column if not exists learner_strengths text,
  add column if not exists support_needs text,
  add column if not exists next_steps text,
  add column if not exists evidence_notes text,
  add column if not exists learner_reflection text,
  add column if not exists parent_support text;

insert into public.subjects(name,active) values
 ('Language Activities',true),('Mathematics Activities',true),('Creative Arts',true),
 ('Environmental Activities',true),('Religious Education',true),
 ('English',true),('Kiswahili',true),('Mathematics',true),('Creative Activities',true),
 ('Indigenous Language',true),('Agriculture & Nutrition',true),('Social Studies',true),
 ('Science & Technology',true),('Arabic',true),('Mandarin',true),('French',true),('German',true),
 ('Agriculture',true),('Pre-Technical Studies',true),('Creative Arts & Sports',true),
 ('Integrated Science',true),('Pre-Braille Activities',true),('Kenya Sign Language',true),
 ('Braille Literacy',true)
on conflict (name) do update set active=true;
