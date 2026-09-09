create or replace function public.reserve_usage_counter(
  p_owner_id uuid,
  p_metric text,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_reserved integer;
  current_consumed integer;
begin
  if auth.uid() is null or auth.uid() <> p_owner_id then
    return false;
  end if;
  if p_limit < 0 or char_length(p_metric) = 0 then
    return false;
  end if;

  insert into public.usage_counters (owner_id, period_start, metric, limit_value)
  values (p_owner_id, date_trunc('month', timezone('utc', now()))::date, p_metric, p_limit)
  on conflict (owner_id, period_start, metric) do update
    set limit_value = excluded.limit_value,
        updated_at = timezone('utc', now());

  select reserved, consumed
    into current_reserved, current_consumed
    from public.usage_counters
   where owner_id = p_owner_id
     and period_start = date_trunc('month', timezone('utc', now()))::date
     and metric = p_metric
   for update;

  if current_consumed + current_reserved >= p_limit then
    return false;
  end if;

  update public.usage_counters
     set reserved = reserved + 1,
         updated_at = timezone('utc', now())
   where owner_id = p_owner_id
     and period_start = date_trunc('month', timezone('utc', now()))::date
     and metric = p_metric;
  return true;
end;
$$;

create or replace function public.commit_usage_counter(
  p_owner_id uuid,
  p_metric text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> p_owner_id then
    return;
  end if;
  update public.usage_counters
     set reserved = greatest(0, reserved - 1),
         consumed = consumed + 1,
         updated_at = timezone('utc', now())
   where owner_id = p_owner_id
     and period_start = date_trunc('month', timezone('utc', now()))::date
     and metric = p_metric
     and reserved > 0;
end;
$$;

create or replace function public.release_usage_counter(
  p_owner_id uuid,
  p_metric text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> p_owner_id then
    return;
  end if;
  update public.usage_counters
     set reserved = greatest(0, reserved - 1),
         updated_at = timezone('utc', now())
   where owner_id = p_owner_id
     and period_start = date_trunc('month', timezone('utc', now()))::date
     and metric = p_metric
     and reserved > 0;
end;
$$;

revoke all on function public.reserve_usage_counter(uuid, text, integer) from public;
revoke all on function public.commit_usage_counter(uuid, text) from public;
revoke all on function public.release_usage_counter(uuid, text) from public;
grant execute on function public.reserve_usage_counter(uuid, text, integer) to authenticated;
grant execute on function public.commit_usage_counter(uuid, text) to authenticated;
grant execute on function public.release_usage_counter(uuid, text) to authenticated;

insert into public.plans (code, name, description, active, price_minor, currency, billing_interval, limits, features, display_order)
values (
  'free',
  'Closet essencial',
  'O espaço para começar a vestir melhor o que já é seu.',
  true,
  0,
  'BRL',
  'month',
  '{"maxClosetItems":50,"maxLookGenerationsPerMonth":20,"maxAiAnalysesPerMonth":10,"maxInspirationAnalysesPerMonth":3}'::jsonb,
  '["Até 50 peças no closet","20 gerações de looks por mês","10 análises de peças por mês","3 inspirações por mês"]'::jsonb,
  0
)
on conflict (code) do nothing;
