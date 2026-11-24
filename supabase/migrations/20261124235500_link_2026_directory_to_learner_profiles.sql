-- Connect imported 2026 directory entries to canonical learner records.
-- Linking is manual and explicit; no names or phone numbers are auto-matched.
alter table public.learner_directory_2026
  add column if not exists learner_id uuid references public.learners(id) on delete set null;

create unique index if not exists learner_directory_2026_learner_id_uidx
  on public.learner_directory_2026(learner_id)
  where learner_id is not null;
