create or replace function public.get_finance_learners()
returns table (id uuid, full_name text, admission_number text, class_id uuid)
language sql stable security definer set search_path = ''
as $$
  select l.id, l.full_name, l.admission_number, l.class_id
  from public.learners l where private.is_finance_staff();
$$;
revoke all on function public.get_finance_learners() from public;
revoke all on function public.get_finance_learners() from anon;
grant execute on function public.get_finance_learners() to authenticated;

create policy leadership_read_fee_payments on public.fee_payments
for select to authenticated using (private.is_school_leader());
