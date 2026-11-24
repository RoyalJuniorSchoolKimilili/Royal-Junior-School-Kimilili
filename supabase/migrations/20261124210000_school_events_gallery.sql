-- School events calendar and photo gallery, managed by administrators.
create table if not exists public.school_events (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 3 and 180),
 description text not null default '',
 location text,
 starts_at timestamptz not null,
 ends_at timestamptz,
 status text not null default 'draft' check (status in ('draft','published','cancelled')),
 created_by uuid not null references public.profiles(id) on delete restrict,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (ends_at is null or ends_at >= starts_at)
);
create index if not exists school_events_public_idx on public.school_events(status,starts_at);
alter table public.school_events enable row level security;
grant select on public.school_events to anon;
grant select,insert,update,delete on public.school_events to authenticated;
create policy "Public read published events" on public.school_events for select to anon using (status='published');
create policy "Authenticated read published events and admins all" on public.school_events for select to authenticated using (status='published' or private.is_admin());
create policy "Admins create events" on public.school_events for insert to authenticated with check (private.is_admin() and created_by=(select auth.uid()));
create policy "Admins update events" on public.school_events for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins delete events" on public.school_events for delete to authenticated using (private.is_admin());

create table if not exists public.school_gallery (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 2 and 180),
 description text not null default '',
 image_url text not null,
 category text not null default 'School life',
 display_order integer not null default 0,
 status text not null default 'draft' check (status in ('draft','published')),
 created_by uuid not null references public.profiles(id) on delete restrict,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists school_gallery_public_idx on public.school_gallery(status,display_order,created_at desc);
alter table public.school_gallery enable row level security;
grant select on public.school_gallery to anon;
grant select,insert,update,delete on public.school_gallery to authenticated;
create policy "Public read published gallery" on public.school_gallery for select to anon using (status='published');
create policy "Authenticated read published gallery and admins all" on public.school_gallery for select to authenticated using (status='published' or private.is_admin());
create policy "Admins create gallery items" on public.school_gallery for insert to authenticated with check (private.is_admin() and created_by=(select auth.uid()));
create policy "Admins update gallery items" on public.school_gallery for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins delete gallery items" on public.school_gallery for delete to authenticated using (private.is_admin());
