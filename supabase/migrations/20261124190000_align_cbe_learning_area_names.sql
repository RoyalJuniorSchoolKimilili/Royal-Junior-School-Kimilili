-- Add current KICD learning-area labels used by the PP1–Grade 9 assessment forms.
insert into public.subjects(name,active) values
 ('Creative Arts',true),
 ('Creative Activities',true),
 ('Agriculture & Nutrition',true),
 ('Creative Arts and Sports',true)
on conflict (name) do update set active=true;
