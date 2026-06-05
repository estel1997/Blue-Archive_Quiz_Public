-- 2026-05-02
-- 本番を50問/45点以上、小テストを30問/27点以上に変更するためのSupabase更新SQL。
-- 既存の100問時代の合格者データを残せるよう、テーブル制約は過去スコアを許容し、
-- 現在の保存条件は submit_exam_passer RPC 内で判定します。

alter table public.exam_passers drop constraint if exists exam_passers_score_check;

alter table public.exam_passers add constraint exam_passers_score_check
  check (
    (exam_type = 'full' and score between 0 and 100 and genre = '')
    or (exam_type = 'mini' and score between 0 and 50 and length(trim(genre)) > 0)
  );

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

  if normalized_exam_type = 'full' and (p_score is null or p_score < 45 or p_score > 50) then
    raise exception 'exam score must be between 45 and 50';
  end if;

  if normalized_exam_type = 'mini' and (p_score is null or p_score < 27 or p_score > 30) then
    raise exception 'mini exam score must be between 27 and 30';
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
