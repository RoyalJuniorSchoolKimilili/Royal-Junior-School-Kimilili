alter table public.academic_terms
  add constraint academic_terms_canonical_name_check
  check (name = 'Term ' || term_number::text);
