-- Supabase Storage setup for quiz image assets.
-- Run this once in Supabase SQL Editor before uploading memolobby images.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quiz-assets',
  'quiz-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "quiz assets are publicly readable" on storage.objects;
create policy "quiz assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'quiz-assets');
