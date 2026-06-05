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

  if p_score is null or p_score < 90 or p_score > 100 then
    raise exception 'exam score must be between 90 and 100';
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
