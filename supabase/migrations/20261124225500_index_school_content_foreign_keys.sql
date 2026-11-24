create index if not exists school_events_created_by_idx on public.school_events (created_by);
create index if not exists school_gallery_created_by_idx on public.school_gallery (created_by);
create index if not exists school_posts_reviewed_by_idx on public.school_posts (reviewed_by);