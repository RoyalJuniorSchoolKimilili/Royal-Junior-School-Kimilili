-- School news/blog with teacher review and admin publishing.
create table if not exists public.school_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  slug text not null unique,
  excerpt text not null default '',
  content text not null,
  cover_image_url text,
  status text not null default 'pending_review' check (status in ('draft','pending_review','published','rejected')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  reviewed_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists school_posts_public_idx on public.school_posts(status, published_at desc);
create index if not exists school_posts_author_idx on public.school_posts(created_by, created_at desc);
alter table public.school_posts enable row level security;
grant select on public.school_posts to anon;
grant select, insert, update, delete on public.school_posts to authenticated;
create policy "Public can read published school posts" on public.school_posts
  for select to anon using (status = 'published' and published_at is not null and published_at <= now());
create policy "Approved users can read published and own posts" on public.school_posts
  for select to authenticated using (
    (status = 'published' and published_at is not null and published_at <= now())
    or created_by = (select auth.uid()) or private.is_admin()
  );
create policy "Approved staff can submit school posts" on public.school_posts
  for insert to authenticated with check (
    created_by = (select auth.uid()) and private.is_approved_user()
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin','teacher'))
    and (
      (status = 'pending_review' and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'teacher'))
      or (status in ('draft','published') and private.is_admin())
    )
  );
create policy "Authors edit own submissions and admins manage posts" on public.school_posts
  for update to authenticated using (
    private.is_admin() or (created_by = (select auth.uid()) and status in ('draft','pending_review'))
  ) with check (
    private.is_admin() or (created_by = (select auth.uid()) and status in ('draft','pending_review'))
  );
create policy "Admins delete school posts" on public.school_posts
  for delete to authenticated using (private.is_admin());
