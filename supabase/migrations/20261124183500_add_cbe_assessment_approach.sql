-- Record the CBE assessment approach as assessment for, as or of learning.
alter table public.assessments add column if not exists assessment_approach text;
