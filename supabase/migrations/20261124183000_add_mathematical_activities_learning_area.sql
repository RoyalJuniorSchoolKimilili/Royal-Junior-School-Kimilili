-- Add the KICD pre-primary learning-area label used in the PP1/PP2 form.
insert into public.subjects(name,active) values ('Mathematical Activities',true)
on conflict (name) do update set active=true;
