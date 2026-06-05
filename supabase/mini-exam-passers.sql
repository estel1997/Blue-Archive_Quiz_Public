create extension if not exists pgcrypto with schema extensions;

alter table public.exam_passers add column if not exists exam_type text not null default 'full';
alter table public.exam_passers add column if not exists genre text not null default '';
alter table public.exam_passers drop constraint if exists exam_passers_player_name_check;
alter table public.exam_passers add constraint exam_passers_player_name_check
  check (length(trim(player_name)) between 1 and 20);
alter table public.exam_passers drop constraint if exists exam_passers_score_check;
alter table public.exam_passers add constraint exam_passers_score_check
  check (
    (exam_type = 'full' and score between 85 and 100 and genre = '')
    or (exam_type = 'mini' and score between 45 and 50 and length(trim(genre)) > 0)
  );

create index if not exists exam_passers_type_genre_created_idx
  on public.exam_passers(exam_type, genre, created_at desc);

alter table public.exam_passer_monthly_counts add column if not exists exam_type text not null default 'full';
alter table public.exam_passer_monthly_counts add column if not exists genre text not null default '';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'exam_passer_monthly_counts_pkey'
      and conrelid = 'public.exam_passer_monthly_counts'::regclass
  ) then
    alter table public.exam_passer_monthly_counts
      drop constraint exam_passer_monthly_counts_pkey;
  end if;
end $$;

alter table public.exam_passer_monthly_counts
  add constraint exam_passer_monthly_counts_pkey
  primary key (month_start, exam_type, genre);

alter table public.endless_rankings drop constraint if exists endless_rankings_player_name_check;
alter table public.endless_rankings add constraint endless_rankings_player_name_check
  check (length(trim(player_name)) between 1 and 20);

delete from public.exam_passer_monthly_counts;

insert into public.exam_passer_monthly_counts(month_start, exam_type, genre, pass_count)
select
  date_trunc('month', timezone('Asia/Tokyo', created_at))::date as month_start,
  exam_type,
  genre,
  count(*)::integer as pass_count
from public.exam_passers
group by 1, 2, 3
on conflict (month_start, exam_type, genre)
do update set
  pass_count = excluded.pass_count,
  updated_at = now();

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

  if length(trim(p_player_name)) > 20 then
    raise exception 'player name must be 20 characters or less';
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
    left(trim(p_player_name), 20),
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

grant execute on function public.submit_endless_score(text, integer, jsonb, text, text, timestamptz)
to anon, authenticated;

drop function if exists public.submit_exam_passer(text, integer);
drop function if exists public.submit_exam_passer(text, integer, jsonb, text, text, timestamptz);
drop function if exists public.submit_exam_passer(text, integer, jsonb, text, text, timestamptz, text, text);

create or replace function public.submit_exam_passer(
  p_player_name text,
  p_score integer,
  p_answer_times jsonb default '[]'::jsonb,
  p_client_id text default null,
  p_session_id text default null,
  p_started_at timestamptz default null,
  p_exam_type text default 'full',
  p_genre text default ''
)
returns table(id bigint, player_name text, score integer, exam_type text, genre text, created_at timestamptz)
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
  normalized_exam_type text;
  normalized_genre text;
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
  normalized_exam_type := case when trim(coalesce(p_exam_type, 'full')) = 'mini' then 'mini' else 'full' end;
  normalized_genre := case
    when normalized_exam_type = 'mini' then left(trim(coalesce(p_genre, '')), 80)
    else ''
  end;
  requester_hash := encode(
    digest(concat_ws('|', trim(remote_ip), user_agent, coalesce(normalized_client_id, '')), 'sha256'),
    'hex'
  );

  if normalized_exam_type = 'full' and (p_score is null or p_score < 85 or p_score > 100) then
    raise exception 'exam score must be between 85 and 100';
  end if;

  if normalized_exam_type = 'mini' and (p_score is null or p_score < 45 or p_score > 50) then
    raise exception 'mini exam score must be between 45 and 50';
  end if;

  if normalized_exam_type = 'mini' and length(normalized_genre) = 0 then
    raise exception 'mini exam genre is required';
  end if;

  if p_player_name is null or length(trim(p_player_name)) = 0 then
    raise exception 'player name is required';
  end if;

  if length(trim(p_player_name)) > 20 then
    raise exception 'player name must be 20 characters or less';
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
      and monthly.exam_type = normalized_exam_type
      and monthly.genre = normalized_genre
      and (
        (normalized_client_id is not null and monthly.client_id = normalized_client_id)
        or (monthly.submitter_hash is not null and monthly.submitter_hash = requester_hash)
      )
  ) >= 2 then
    raise exception 'monthly exam passer save limit reached';
  end if;

  perform pg_advisory_xact_lock(hashtext(target_month::text || ':' || normalized_exam_type || ':' || normalized_genre || ':' || lower(left(trim(p_player_name), 20))));

  if exists (
    select 1
    from public.exam_passers existing_name
    where date_trunc('month', timezone('Asia/Tokyo', existing_name.created_at))::date = target_month
      and existing_name.exam_type = normalized_exam_type
      and existing_name.genre = normalized_genre
      and lower(trim(existing_name.player_name)) = lower(left(trim(p_player_name), 20))
  ) then
    raise exception 'exam passer name already exists this month';
  end if;

  insert into public.exam_passer_monthly_counts(month_start, exam_type, genre, pass_count)
  values (target_month, normalized_exam_type, normalized_genre, 1)
  on conflict (month_start, exam_type, genre)
  do update set
    pass_count = public.exam_passer_monthly_counts.pass_count + 1,
    updated_at = now();

  insert into public.exam_passers(player_name, score, answer_times, client_id, session_id, started_at, submitter_hash, exam_type, genre)
  values (
    left(trim(p_player_name), 20),
    p_score,
    coalesce(p_answer_times, '[]'::jsonb),
    normalized_client_id,
    nullif(left(trim(coalesce(p_session_id, '')), 80), ''),
    p_started_at,
    requester_hash,
    normalized_exam_type,
    normalized_genre
  )
  returning exam_passers.id into inserted_id;

  delete from public.exam_passers p
  where p.id in (
    select monthly_ranked.id
    from (
      select
        ep.id,
        row_number() over (
          partition by date_trunc('month', timezone('Asia/Tokyo', ep.created_at)), ep.exam_type, ep.genre
          order by ep.score desc, ep.created_at asc
        ) as rank_in_month
      from public.exam_passers ep
    ) monthly_ranked
    join public.exam_passers ranked_source on ranked_source.id = monthly_ranked.id
    where monthly_ranked.rank_in_month > case when ranked_source.exam_type = 'mini' then 10000 else 1000 end
  );

  return query
  select ep.id, ep.player_name, ep.score, ep.exam_type, ep.genre, ep.created_at
  from public.exam_passers ep
  where ep.id = inserted_id;
end;
$$;

grant execute on function public.submit_exam_passer(text, integer, jsonb, text, text, timestamptz, text, text) to anon, authenticated;
