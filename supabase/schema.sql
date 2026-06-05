create table if not exists public.students (
  schaledb_id integer primary key,
  name_jp text not null,
  path_name text not null,
  dev_name text not null,
  weapon_name_jp text not null,
  weapon_img text not null,
  family_name_jp text,
  personal_name_jp text,
  profile_intro_jp text,
  school text,
  club text,
  rarity integer,
  squad_type text,
  position text,
  source text not null default 'schaledb',
  updated_at timestamptz not null default now()
);

create table if not exists public.pickup_banners (
  source_id text primary key,
  source text not null,
  source_url text not null,
  year integer not null,
  order_in_year integer not null,
  banner_type text,
  title_en text,
  title_jp text not null,
  pickup_wiki_titles text[] not null default '{}',
  banner_image_url text,
  starts_text text,
  ends_text text,
  updated_at timestamptz not null default now()
);

alter table if exists public.students
  add column if not exists profile_intro_jp text;

create table if not exists public.pickup_banner_students (
  source_id text primary key,
  banner_source_id text not null references public.pickup_banners(source_id) on delete cascade,
  position integer not null,
  wiki_title text not null,
  schaledb_id integer references public.students(schaledb_id),
  student_name_jp text,
  updated_at timestamptz not null default now()
);

create table if not exists public.pickup_title_corrections (
  title_jp text primary key,
  display_title_jp text,
  student_name_jp text,
  applies_to_student_name_jp text,
  note text,
  updated_at timestamptz not null default now()
);

alter table if exists public.pickup_title_corrections
  add column if not exists display_title_jp text,
  add column if not exists student_name_jp text,
  add column if not exists applies_to_student_name_jp text,
  add column if not exists note text,
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.pickup_title_corrections
  alter column display_title_jp drop not null,
  alter column student_name_jp drop not null,
  alter column applies_to_student_name_jp drop not null,
  alter column note drop not null;

create table if not exists public.story_questions (
  source_id text primary key,
  source_title text not null,
  genre text not null default 'ストーリー内容',
  prompt text not null,
  answer text not null,
  distractors text[] not null default '{}',
  distractor_mode text,
  distractor_pattern text,
  synthetic_names text[] not null default '{}',
  distractor_pool text[] not null default '{}',
  status text not null default 'approved',
  difficulty text,
  note text,
  source_url text,
  updated_at timestamptz not null default now()
);

alter table public.story_questions
  add column if not exists genre text not null default 'ストーリー内容';

create table if not exists public.story_trivia_questions (
  source_id text primary key,
  source_title text not null,
  genre text not null default 'ストーリー・イベント内容(小ネタ)',
  prompt text not null,
  answer text not null,
  distractors text[] not null default '{}',
  distractor_mode text,
  distractor_pattern text,
  synthetic_names text[] not null default '{}',
  distractor_pool text[] not null default '{}',
  status text not null default 'approved',
  difficulty text,
  note text,
  source_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.performance_icon_assets (
  icon_key text primary key,
  group_key text not null,
  label_jp text not null,
  asset_url text not null,
  source_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.performance_students (
  schaledb_id integer primary key,
  name_jp text not null,
  weapon jsonb not null,
  role jsonb not null,
  combat jsonb not null,
  terrain_adaptation jsonb not null,
  source text not null default 'bluearchive-api.skyia.jp',
  updated_at timestamptz not null default now()
);

create table if not exists public.halo_assets (
  name_jp text primary key,
  image_url text not null,
  image_alt text,
  source_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.memolobby_zoom_assets (
  source_id text primary key,
  student_name_jp text not null,
  file_name text not null,
  storage_bucket text not null default 'quiz-assets',
  storage_path text not null,
  image_url text,
  image_alt text,
  updated_at timestamptz not null default now()
);

create table if not exists public.memolobby_answer_assets (
  student_name_jp text primary key,
  display_name_jp text not null,
  image_url text,
  storage_bucket text not null default 'quiz-assets',
  storage_path text,
  bond_level integer,
  source_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.combat_skill_questions (
  source_id text primary key,
  schaledb_id integer,
  student_name_jp text not null,
  skill_group text not null check (skill_group in ('ex', 'basic')),
  display_title_jp text not null,
  skills jsonb not null,
  source_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.endless_rankings (
  id bigint generated always as identity primary key,
  player_name text not null check (length(trim(player_name)) between 1 and 24),
  score integer not null check (score > 0),
  answer_times jsonb not null default '[]'::jsonb,
  client_id text,
  session_id text,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.exam_passers (
  id bigint generated always as identity primary key,
  player_name text not null check (length(trim(player_name)) between 1 and 24),
  score integer not null check (score >= 85 and score <= 100),
  answer_times jsonb not null default '[]'::jsonb,
  client_id text,
  session_id text,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.exam_passer_monthly_counts (
  month_start date primary key,
  pass_count integer not null default 0 check (pass_count >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_syncs (
  id bigint generated always as identity primary key,
  source text not null,
  source_count integer not null,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;
alter table public.pickup_banners enable row level security;
alter table public.pickup_banner_students enable row level security;
alter table public.pickup_title_corrections enable row level security;
alter table public.story_questions enable row level security;
alter table public.story_trivia_questions enable row level security;
alter table public.performance_icon_assets enable row level security;
alter table public.performance_students enable row level security;
alter table public.halo_assets enable row level security;
alter table public.memolobby_zoom_assets enable row level security;
alter table public.memolobby_answer_assets enable row level security;
alter table public.combat_skill_questions enable row level security;
alter table public.endless_rankings enable row level security;
alter table public.exam_passers enable row level security;
alter table public.exam_passer_monthly_counts enable row level security;
alter table public.quiz_syncs enable row level security;

alter table public.endless_rankings add column if not exists answer_times jsonb not null default '[]'::jsonb;
alter table public.endless_rankings add column if not exists client_id text;
alter table public.endless_rankings add column if not exists session_id text;
alter table public.endless_rankings add column if not exists started_at timestamptz;
alter table public.exam_passers add column if not exists answer_times jsonb not null default '[]'::jsonb;
alter table public.exam_passers add column if not exists client_id text;
alter table public.exam_passers add column if not exists session_id text;
alter table public.exam_passers add column if not exists started_at timestamptz;

drop policy if exists "students are publicly readable" on public.students;
create policy "students are publicly readable"
  on public.students for select
  using (true);

drop policy if exists "pickup banners are publicly readable" on public.pickup_banners;
create policy "pickup banners are publicly readable"
  on public.pickup_banners for select
  using (true);

drop policy if exists "pickup banner students are publicly readable" on public.pickup_banner_students;
create policy "pickup banner students are publicly readable"
  on public.pickup_banner_students for select
  using (true);

drop policy if exists "pickup title corrections are publicly readable" on public.pickup_title_corrections;
create policy "pickup title corrections are publicly readable"
  on public.pickup_title_corrections for select
  using (true);

drop policy if exists "story questions are publicly readable" on public.story_questions;
create policy "story questions are publicly readable"
  on public.story_questions for select
  using (true);

drop policy if exists "story trivia questions are publicly readable" on public.story_trivia_questions;
create policy "story trivia questions are publicly readable"
  on public.story_trivia_questions for select
  using (true);

drop policy if exists "performance icon assets are publicly readable" on public.performance_icon_assets;
create policy "performance icon assets are publicly readable"
  on public.performance_icon_assets for select
  using (true);

drop policy if exists "performance students are publicly readable" on public.performance_students;
create policy "performance students are publicly readable"
  on public.performance_students for select
  using (true);

drop policy if exists "halo assets are publicly readable" on public.halo_assets;
create policy "halo assets are publicly readable"
  on public.halo_assets for select
  using (true);

drop policy if exists "memolobby zoom assets are publicly readable" on public.memolobby_zoom_assets;
create policy "memolobby zoom assets are publicly readable"
  on public.memolobby_zoom_assets for select
  using (true);

drop policy if exists "memolobby answer assets are publicly readable" on public.memolobby_answer_assets;
create policy "memolobby answer assets are publicly readable"
  on public.memolobby_answer_assets for select
  using (true);

drop policy if exists "combat skill questions are publicly readable" on public.combat_skill_questions;
create policy "combat skill questions are publicly readable"
  on public.combat_skill_questions for select
  using (true);

drop policy if exists "endless rankings are publicly readable" on public.endless_rankings;
create policy "endless rankings are publicly readable"
  on public.endless_rankings for select
  using (true);

drop policy if exists "exam passers are publicly readable" on public.exam_passers;
create policy "exam passers are publicly readable"
  on public.exam_passers for select
  using (true);

drop policy if exists "exam passer monthly counts are publicly readable" on public.exam_passer_monthly_counts;
create policy "exam passer monthly counts are publicly readable"
  on public.exam_passer_monthly_counts for select
  using (true);

create index if not exists pickup_banners_year_idx on public.pickup_banners (year, order_in_year);
create index if not exists pickup_banner_students_banner_idx on public.pickup_banner_students (banner_source_id);
create index if not exists pickup_banner_students_schaledb_idx on public.pickup_banner_students (schaledb_id);
create index if not exists pickup_title_corrections_student_idx on public.pickup_title_corrections (student_name_jp);
create index if not exists story_questions_status_idx on public.story_questions (status);
create index if not exists story_questions_source_title_idx on public.story_questions (source_title);
create index if not exists story_questions_genre_idx on public.story_questions (genre);
create index if not exists story_trivia_questions_status_idx on public.story_trivia_questions (status);
create index if not exists story_trivia_questions_source_title_idx on public.story_trivia_questions (source_title);
create index if not exists story_trivia_questions_genre_idx on public.story_trivia_questions (genre);
create index if not exists performance_icon_assets_group_idx on public.performance_icon_assets (group_key);
create index if not exists performance_students_name_jp_idx on public.performance_students (name_jp);
create index if not exists halo_assets_name_jp_idx on public.halo_assets (name_jp);
create index if not exists memolobby_zoom_assets_student_idx on public.memolobby_zoom_assets (student_name_jp);
create index if not exists memolobby_answer_assets_display_name_idx on public.memolobby_answer_assets (display_name_jp);
create index if not exists combat_skill_questions_student_idx on public.combat_skill_questions (student_name_jp);
create index if not exists combat_skill_questions_group_idx on public.combat_skill_questions (skill_group);
create index if not exists endless_rankings_score_idx on public.endless_rankings (score desc, created_at asc);
create index if not exists endless_rankings_created_at_idx on public.endless_rankings (created_at);
create index if not exists endless_rankings_client_created_idx on public.endless_rankings (client_id, created_at);
create index if not exists endless_rankings_session_idx on public.endless_rankings (session_id);
create index if not exists exam_passers_score_idx on public.exam_passers (score desc, created_at asc);
create index if not exists exam_passers_created_at_idx on public.exam_passers (created_at);
create index if not exists exam_passers_client_created_idx on public.exam_passers (client_id, created_at);
create index if not exists exam_passers_session_idx on public.exam_passers (session_id);
create index if not exists students_name_jp_idx on public.students (name_jp);

create unique index if not exists students_schaledb_id_uq on public.students (schaledb_id);
create unique index if not exists pickup_banners_source_id_uq on public.pickup_banners (source_id);
create unique index if not exists pickup_banner_students_source_id_uq on public.pickup_banner_students (source_id);
create unique index if not exists pickup_title_corrections_title_jp_uq on public.pickup_title_corrections (title_jp);
create unique index if not exists story_questions_source_id_uq on public.story_questions (source_id);
create unique index if not exists story_trivia_questions_source_id_uq on public.story_trivia_questions (source_id);
create unique index if not exists performance_icon_assets_icon_key_uq on public.performance_icon_assets (icon_key);
create unique index if not exists performance_students_schaledb_id_uq on public.performance_students (schaledb_id);
create unique index if not exists halo_assets_name_jp_uq on public.halo_assets (name_jp);
create unique index if not exists memolobby_zoom_assets_source_id_uq on public.memolobby_zoom_assets (source_id);
create unique index if not exists memolobby_answer_assets_student_name_jp_uq on public.memolobby_answer_assets (student_name_jp);
create unique index if not exists combat_skill_questions_source_id_uq on public.combat_skill_questions (source_id);
create unique index if not exists exam_passer_monthly_counts_month_start_uq on public.exam_passer_monthly_counts (month_start);

insert into public.exam_passer_monthly_counts(month_start, pass_count)
select
  date_trunc('month', timezone('Asia/Tokyo', created_at))::date as month_start,
  count(*)::integer as pass_count
from public.exam_passers
group by 1
on conflict (month_start)
do update set
  pass_count = excluded.pass_count,
  updated_at = now();

create or replace function public.is_suspicious_answer_times(p_answer_times jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  timing_values numeric[] := '{}';
  value_text text;
  value numeric;
  count_values integer;
  repeated_count integer;
  period integer;
  index_value integer;
  is_periodic boolean;
  sum_values numeric := 0;
  min_value numeric;
  max_value numeric;
begin
  if p_answer_times is null or jsonb_typeof(p_answer_times) <> 'array' then
    return false;
  end if;

  for value_text in select jsonb_array_elements_text(p_answer_times) loop
    if value_text ~ '^[0-9]+(\.[0-9]+)?$' then
      value := round(value_text::numeric, 2);
      timing_values := array_append(timing_values, value);
      sum_values := sum_values + value;
      min_value := least(coalesce(min_value, value), value);
      max_value := greatest(coalesce(max_value, value), value);
    end if;
  end loop;

  count_values := coalesce(array_length(timing_values, 1), 0);
  if count_values < 12 then
    return false;
  end if;

  if sum_values / count_values < 0.18 then
    return true;
  end if;

  if max_value - min_value <= 0.03 and sum_values / count_values < 0.55 then
    return true;
  end if;

  select max(grouped.count_value) into repeated_count
  from (
    select count(*) as count_value
    from unnest(timing_values) as answer_value(value)
    group by answer_value.value
  ) grouped;
  if coalesce(repeated_count, 0) >= greatest(24, ceil(count_values * 0.8)::integer) then
    return true;
  end if;

  for period in 1..5 loop
    if count_values >= period * 5 then
      is_periodic := true;
      for index_value in (period + 1)..count_values loop
        if abs(timing_values[index_value] - timing_values[index_value - period]) > 0.02 then
          is_periodic := false;
          exit;
        end if;
      end loop;
      if is_periodic then
        return true;
      end if;
    end if;
  end loop;

  return false;
end;
$$;

drop function if exists public.submit_endless_score(text, integer);
drop function if exists public.submit_endless_score(text, integer, jsonb, text, text, timestamptz);
create or replace function public.submit_endless_score(
  p_player_name text,
  p_score integer,
  p_answer_times jsonb default '[]'::jsonb,
  p_client_id text default null,
  p_session_id text default null,
  p_started_at timestamptz default null
)
returns table(id bigint, player_name text, score integer, created_at timestamptz, all_rank bigint, monthly_rank bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id bigint;
  inserted_created_at timestamptz;
begin
  if p_score is null or p_score <= 0 then
    raise exception 'score must be positive';
  end if;

  if p_player_name is null or length(trim(p_player_name)) = 0 then
    raise exception 'player name is required';
  end if;

  if public.is_suspicious_answer_times(p_answer_times) then
    raise exception 'answer timing pattern is not eligible for ranking';
  end if;

  if p_client_id is not null and exists (
    select 1
    from public.endless_rankings recent
    where recent.client_id = left(trim(p_client_id), 80)
      and recent.created_at > now() - interval '10 seconds'
  ) then
    raise exception 'please wait before saving another score';
  end if;

  if p_client_id is not null and p_session_id is not null and exists (
    select 1
    from public.endless_rankings existing
    where existing.client_id = left(trim(p_client_id), 80)
      and existing.session_id = left(trim(p_session_id), 80)
  ) then
    raise exception 'this session has already been saved';
  end if;

  insert into public.endless_rankings(player_name, score, answer_times, client_id, session_id, started_at)
  values (
    left(trim(p_player_name), 24),
    p_score,
    coalesce(p_answer_times, '[]'::jsonb),
    nullif(left(trim(coalesce(p_client_id, '')), 80), ''),
    nullif(left(trim(coalesce(p_session_id, '')), 80), ''),
    p_started_at
  )
  returning endless_rankings.id, endless_rankings.created_at into inserted_id, inserted_created_at;

  delete from public.endless_rankings r
  where r.id not in (
    select all_time.id
    from (
      select er.id
      from public.endless_rankings er
      order by er.score desc, er.created_at asc
      limit 10000
    ) all_time
    union
    select monthly.id
    from (
      select er.id
      from public.endless_rankings er
      where date_trunc('month', timezone('Asia/Tokyo', er.created_at)) = date_trunc('month', timezone('Asia/Tokyo', now()))
      order by er.score desc, er.created_at asc
      limit 1000
    ) monthly
  );

  return query
  select
    er.id,
    er.player_name,
    er.score,
    er.created_at,
    (
      select count(*) + 1
      from public.endless_rankings a
      where a.score > er.score
         or (a.score = er.score and a.created_at < er.created_at)
         or (a.score = er.score and a.created_at = er.created_at and a.id < er.id)
    )::bigint as all_rank,
    (
      select count(*) + 1
      from public.endless_rankings m
      where date_trunc('month', timezone('Asia/Tokyo', m.created_at)) = date_trunc('month', timezone('Asia/Tokyo', er.created_at))
        and (
          m.score > er.score
          or (m.score = er.score and m.created_at < er.created_at)
          or (m.score = er.score and m.created_at = er.created_at and m.id < er.id)
        )
    )::bigint as monthly_rank
  from public.endless_rankings er
  where er.id = inserted_id;
end;
$$;

grant execute on function public.submit_endless_score(text, integer, jsonb, text, text, timestamptz) to anon, authenticated;

create extension if not exists pgcrypto with schema extensions;

alter table public.exam_passers add column if not exists submitter_hash text;
create index if not exists exam_passers_submitter_hash_created_idx
  on public.exam_passers(submitter_hash, created_at desc);

drop function if exists public.submit_exam_passer(text, integer);
drop function if exists public.submit_exam_passer(text, integer, jsonb, text, text, timestamptz);
create or replace function public.submit_exam_passer(
  p_player_name text,
  p_score integer,
  p_answer_times jsonb default '[]'::jsonb,
  p_client_id text default null,
  p_session_id text default null,
  p_started_at timestamptz default null
)
returns table(id bigint, player_name text, score integer, created_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  inserted_id bigint;
  target_month date;
  headers jsonb;
  remote_ip text;
  user_agent text;
  normalized_client_id text;
  requester_hash text;
begin
  headers := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  remote_ip := coalesce(
    headers ->> 'cf-connecting-ip',
    split_part(coalesce(headers ->> 'x-forwarded-for', ''), ',', 1),
    headers ->> 'x-real-ip',
    'unknown'
  );
  user_agent := left(coalesce(headers ->> 'user-agent', 'unknown'), 240);
  normalized_client_id := nullif(left(trim(coalesce(p_client_id, '')), 80), '');
  requester_hash := encode(
    digest(concat_ws('|', trim(remote_ip), user_agent, coalesce(normalized_client_id, '')), 'sha256'),
    'hex'
  );

  if p_score is null or p_score < 85 or p_score > 100 then
    raise exception 'exam score must be between 85 and 100';
  end if;

  if p_player_name is null or length(trim(p_player_name)) = 0 then
    raise exception 'player name is required';
  end if;

  if public.is_suspicious_answer_times(p_answer_times) then
    raise exception 'answer timing pattern is not eligible for ranking';
  end if;

  if normalized_client_id is not null and exists (
    select 1
    from public.exam_passers recent
    where recent.client_id = normalized_client_id
      and recent.created_at > now() - interval '10 seconds'
  ) then
    raise exception 'please wait before saving another score';
  end if;

  if normalized_client_id is not null and p_session_id is not null and exists (
    select 1
    from public.exam_passers existing
    where existing.client_id = normalized_client_id
      and existing.session_id = left(trim(p_session_id), 80)
  ) then
    raise exception 'this session has already been saved';
  end if;

  target_month := date_trunc('month', timezone('Asia/Tokyo', now()))::date;

  if (
    select count(*)
    from public.exam_passers monthly
    where date_trunc('month', timezone('Asia/Tokyo', monthly.created_at))::date = target_month
      and (
        (normalized_client_id is not null and monthly.client_id = normalized_client_id)
        or (monthly.submitter_hash is not null and monthly.submitter_hash = requester_hash)
      )
  ) >= 2 then
    raise exception 'monthly exam passer save limit reached';
  end if;

  perform pg_advisory_xact_lock(hashtext(target_month::text || ':' || lower(left(trim(p_player_name), 24))));

  if exists (
    select 1
    from public.exam_passers existing_name
    where date_trunc('month', timezone('Asia/Tokyo', existing_name.created_at))::date = target_month
      and lower(trim(existing_name.player_name)) = lower(left(trim(p_player_name), 24))
  ) then
    raise exception 'exam passer name already exists this month';
  end if;

  insert into public.exam_passer_monthly_counts(month_start, pass_count)
  values (target_month, 1)
  on conflict (month_start)
  do update set
    pass_count = public.exam_passer_monthly_counts.pass_count + 1,
    updated_at = now();

  insert into public.exam_passers(player_name, score, answer_times, client_id, session_id, started_at, submitter_hash)
  values (
    left(trim(p_player_name), 24),
    p_score,
    coalesce(p_answer_times, '[]'::jsonb),
    normalized_client_id,
    nullif(left(trim(coalesce(p_session_id, '')), 80), ''),
    p_started_at,
    requester_hash
  )
  returning exam_passers.id into inserted_id;

  delete from public.exam_passers p
  where p.id not in (
    select monthly_top.id
    from (
      select ep.id
      from public.exam_passers ep
      where date_trunc('month', timezone('Asia/Tokyo', ep.created_at)) = date_trunc('month', timezone('Asia/Tokyo', p.created_at))
      order by ep.score desc, ep.created_at asc
      limit 1000
    ) monthly_top
  );

  return query
  select ep.id, ep.player_name, ep.score, ep.created_at
  from public.exam_passers ep
  where ep.id = inserted_id;
end;
$$;

grant execute on function public.submit_exam_passer(text, integer, jsonb, text, text, timestamptz) to anon, authenticated;
