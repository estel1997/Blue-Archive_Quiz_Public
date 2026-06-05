-- Reduce false positives for fast but legitimate quiz answers.
-- The frontend now sends answer timings rounded to 0.01s, so the server should
-- preserve that precision before checking repeated or uniform timing patterns.
-- Apply this in Supabase SQL Editor.

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

  -- Only reject unrealistically fast averages. Fast visual questions can still
  -- be answered well under 0.3s by a human when the answer is obvious.
  if sum_values / count_values < 0.18 then
    return true;
  end if;

  -- Uniform timings are suspicious only when they are extremely uniform.
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
