create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 120),
  locale text not null default 'pt-BR' check (locale in ('pt-BR')),
  onboarding_status text not null default 'not_started' check (onboarding_status in ('not_started', 'in_progress', 'completed')),
  blocked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('support', 'manager', 'owner')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles
    where user_id = auth.uid()
      and revoked_at is null
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null check (bucket in ('clothing-images', 'inspiration-images')),
  object_path text not null,
  purpose text not null check (purpose in ('clothing', 'inspiration')),
  sha256 text check (sha256 is null or char_length(sha256) = 64),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 10485760),
  width integer check (width is null or width between 1 and 12000),
  height integer check (height is null or height between 1 and 12000),
  status text not null default 'quarantine' check (status in ('quarantine', 'ready', 'rejected', 'expired')),
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_id, object_path)
);

create table if not exists public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.media_assets(id) on delete set null,
  name text check (name is null or char_length(name) <= 120),
  category text not null default 'unknown' check (category in ('top', 'bottom', 'one_piece', 'outerwear', 'shoe', 'bag', 'accessory', 'unknown')),
  subcategory text check (subcategory is null or char_length(subcategory) <= 120),
  colors jsonb not null default '[]'::jsonb check (jsonb_typeof(colors) = 'array'),
  pattern text not null default 'unknown' check (pattern in ('solid', 'stripe', 'plaid', 'floral', 'graphic', 'animal', 'other', 'unknown')),
  material text check (material is null or char_length(material) <= 120),
  fit text not null default 'unknown' check (fit in ('slim', 'regular', 'relaxed', 'oversized', 'unknown')),
  formality smallint not null default 3 check (formality between 1 and 5),
  seasons jsonb not null default '["all_year"]'::jsonb check (jsonb_typeof(seasons) = 'array'),
  weather_range jsonb not null default '{"minC": null, "maxC": null}'::jsonb check (jsonb_typeof(weather_range) = 'object'),
  availability text not null default 'active' check (availability in ('active', 'laundry', 'repair', 'archived')),
  analysis_status text not null default 'manual_review' check (analysis_status in ('not_started', 'queued', 'processing', 'ready', 'manual_review', 'failed')),
  analysis_version text,
  manual_overrides jsonb not null default '{}'::jsonb check (jsonb_typeof(manual_overrides) = 'object'),
  notes text check (notes is null or char_length(notes) <= 1000),
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  default_vibe text check (default_vibe is null or char_length(default_vibe) <= 80),
  preferred_formality smallint check (preferred_formality is null or preferred_formality between 1 and 5),
  avoided_colors jsonb not null default '[]'::jsonb check (jsonb_typeof(avoided_colors) = 'array'),
  favorite_styles jsonb not null default '[]'::jsonb check (jsonb_typeof(favorite_styles) = 'array'),
  units text not null default 'metric' check (units in ('metric')),
  privacy_settings jsonb not null default '{"privateCloset": true}'::jsonb check (jsonb_typeof(privacy_settings) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  occasion text not null check (char_length(occasion) between 1 and 80),
  vibe text check (vibe is null or char_length(vibe) <= 80),
  weather_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(weather_snapshot) = 'object'),
  engine_version text not null,
  ranking_version text,
  status text not null default 'active' check (status in ('active', 'archived', 'invalidated')),
  explanation text check (explanation is null or char_length(explanation) <= 1000),
  score numeric(6, 5) check (score is null or score between 0 and 1),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.outfit_items (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  clothing_item_id uuid not null references public.clothing_items(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('top', 'bottom', 'one_piece', 'outerwear', 'shoe', 'bag', 'accessory')),
  position smallint not null default 0 check (position >= 0),
  primary key (outfit_id, clothing_item_id)
);

create table if not exists public.outfit_feedback (
  owner_id uuid not null references auth.users(id) on delete cascade,
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  kind text not null check (kind in ('liked', 'rejected', 'favorited')),
  reason text check (reason is null or char_length(reason) <= 300),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (owner_id, outfit_id)
);

create table if not exists public.outfit_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  outfit_id uuid not null references public.outfits(id) on delete restrict,
  used_on date not null default current_date,
  source text not null default 'user' check (source in ('user', 'imported')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inspirations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.media_assets(id) on delete set null,
  source_type text not null check (source_type in ('upload', 'url')),
  source_url text check (source_url is null or char_length(source_url) <= 2000),
  analysis_status text not null default 'manual_review' check (analysis_status in ('not_started', 'queued', 'processing', 'ready', 'manual_review', 'failed')),
  analysis_version text,
  attributes jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes) = 'object'),
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inspiration_matches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  inspiration_id uuid not null references public.inspirations(id) on delete cascade,
  clothing_item_id uuid not null references public.clothing_items(id) on delete cascade,
  match_type text not null check (match_type in ('color', 'silhouette', 'layer', 'texture', 'occasion', 'mixed')),
  score numeric(6, 5) check (score is null or score between 0 and 1),
  explanation text check (explanation is null or char_length(explanation) <= 500),
  engine_version text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (inspiration_id, clothing_item_id)
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code ~ '^[a-z0-9_-]{2,50}$'),
  name text not null check (char_length(name) between 1 and 100),
  description text,
  active boolean not null default false,
  price_minor integer not null default 0 check (price_minor >= 0),
  currency text not null default 'BRL' check (currency in ('BRL')),
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year', 'one_time')),
  limits jsonb not null default '{}'::jsonb check (jsonb_typeof(limits) = 'object'),
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  provider text not null,
  provider_customer_id text,
  provider_subscription_id text,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'paused', 'unknown')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider, provider_subscription_id)
);

create table if not exists public.entitlements (
  owner_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (char_length(key) between 1 and 80),
  value jsonb not null default 'false'::jsonb,
  source text not null check (source in ('plan', 'trial', 'manual', 'system')),
  valid_until timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (owner_id, key)
);

create table if not exists public.usage_counters (
  owner_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  metric text not null check (char_length(metric) between 1 and 80),
  reserved integer not null default 0 check (reserved >= 0),
  consumed integer not null default 0 check (consumed >= 0),
  limit_value integer not null default 0 check (limit_value >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (owner_id, period_start, metric)
);

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  provider text not null,
  model text not null,
  operation text not null,
  request_key text unique not null,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  estimated_cost_minor integer check (estimated_cost_minor is null or estimated_cost_minor >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  status text not null check (status in ('success', 'failed', 'timeout', 'rejected')),
  error_code text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (char_length(kind) between 1 and 80),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 1000),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('product', 'look', 'bug', 'other')),
  body text not null check (char_length(body) between 1 and 2000),
  context jsonb not null default '{}'::jsonb check (jsonb_typeof(context) = 'object'),
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved', 'archived')),
  response text check (response is null or char_length(response) <= 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text,
  action text not null,
  resource_type text not null,
  resource_id text,
  outcome text not null check (outcome in ('success', 'denied', 'failed')),
  request_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.system_settings (
  key text primary key check (char_length(key) between 1 and 120),
  value jsonb not null check (jsonb_typeof(value) in ('object', 'array', 'string', 'number', 'boolean', 'null')),
  environment text not null default 'production' check (environment in ('development', 'staging', 'production')),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.feature_flags (
  key text primary key check (char_length(key) between 1 and 120),
  enabled boolean not null default false,
  rollout_percent smallint not null default 0 check (rollout_percent between 0 and 100),
  allowlist jsonb not null default '[]'::jsonb check (jsonb_typeof(allowlist) = 'array'),
  starts_at timestamptz,
  ends_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 320),
  subject text not null check (char_length(subject) between 1 and 160),
  body text not null check (char_length(body) between 1 and 3000),
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'spam')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  provider text not null,
  event_type text not null,
  external_reference text,
  amount_minor integer check (amount_minor is null or amount_minor >= 0),
  currency text check (currency is null or currency = 'BRL'),
  occurred_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null,
  signature_verified boolean not null default false,
  headers jsonb not null default '{}'::jsonb check (jsonb_typeof(headers) = 'object'),
  body_hash text,
  status text not null default 'received' check (status in ('received', 'processed', 'ignored', 'failed')),
  processed_at timestamptz,
  error_code text,
  received_at timestamptz not null default timezone('utc', now()),
  unique (provider, external_event_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'media_assets', 'clothing_items', 'user_preferences', 'outfits',
    'outfit_feedback', 'inspirations', 'plans', 'subscriptions', 'entitlements',
    'usage_counters', 'feedback', 'system_settings', 'feature_flags',
    'contact_requests'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  insert into public.user_preferences (owner_id)
  values (new.id)
  on conflict (owner_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.enforce_outfit_item_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  outfit_owner uuid;
  item_owner uuid;
begin
  select owner_id into outfit_owner from public.outfits where id = new.outfit_id;
  select owner_id into item_owner from public.clothing_items where id = new.clothing_item_id and deleted_at is null;
  if outfit_owner is null or item_owner is null or outfit_owner <> item_owner or new.owner_id <> outfit_owner then
    raise exception using errcode = '42501', message = 'outfit_item_owner_mismatch';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_outfit_item_owner on public.outfit_items;
create trigger enforce_outfit_item_owner
  before insert or update on public.outfit_items
  for each row execute function public.enforce_outfit_item_owner();

create index if not exists clothing_items_owner_created_idx on public.clothing_items (owner_id, created_at desc);
create index if not exists clothing_items_owner_category_idx on public.clothing_items (owner_id, category) where deleted_at is null;
create index if not exists clothing_items_owner_status_idx on public.clothing_items (owner_id, analysis_status) where deleted_at is null;
create index if not exists media_assets_owner_status_idx on public.media_assets (owner_id, status, created_at desc);
create index if not exists outfits_owner_created_idx on public.outfits (owner_id, created_at desc);
create index if not exists outfits_owner_occasion_idx on public.outfits (owner_id, occasion, created_at desc);
create index if not exists outfit_items_owner_item_idx on public.outfit_items (owner_id, clothing_item_id);
create index if not exists outfit_history_owner_used_idx on public.outfit_history (owner_id, used_on desc);
create index if not exists inspirations_owner_created_idx on public.inspirations (owner_id, created_at desc);
create index if not exists ai_usage_owner_created_idx on public.ai_usage (owner_id, created_at desc);
create index if not exists ai_usage_operation_created_idx on public.ai_usage (operation, created_at desc);
create index if not exists notifications_owner_created_idx on public.notifications (owner_id, created_at desc);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists webhook_events_status_idx on public.webhook_events (status, received_at);

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.media_assets enable row level security;
alter table public.clothing_items enable row level security;
alter table public.user_preferences enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.outfit_feedback enable row level security;
alter table public.outfit_history enable row level security;
alter table public.inspirations enable row level security;
alter table public.inspiration_matches enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.usage_counters enable row level security;
alter table public.ai_usage enable row level security;
alter table public.notifications enable row level security;
alter table public.feedback enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;
alter table public.feature_flags enable row level security;
alter table public.contact_requests enable row level security;
alter table public.billing_events enable row level security;
alter table public.webhook_events enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy admin_roles_select_self on public.admin_roles for select to authenticated using (user_id = auth.uid());

create policy media_assets_select_own on public.media_assets for select to authenticated using (owner_id = auth.uid());
create policy media_assets_insert_own on public.media_assets for insert to authenticated with check (owner_id = auth.uid());
create policy media_assets_update_own on public.media_assets for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy media_assets_delete_own on public.media_assets for delete to authenticated using (owner_id = auth.uid());

create policy clothing_select_own on public.clothing_items for select to authenticated using (owner_id = auth.uid());
create policy clothing_insert_own on public.clothing_items for insert to authenticated with check (owner_id = auth.uid());
create policy clothing_update_own on public.clothing_items for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy clothing_delete_own on public.clothing_items for delete to authenticated using (owner_id = auth.uid());

create policy preferences_select_own on public.user_preferences for select to authenticated using (owner_id = auth.uid());
create policy preferences_insert_own on public.user_preferences for insert to authenticated with check (owner_id = auth.uid());
create policy preferences_update_own on public.user_preferences for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy outfits_select_own on public.outfits for select to authenticated using (owner_id = auth.uid());
create policy outfits_insert_own on public.outfits for insert to authenticated with check (owner_id = auth.uid());
create policy outfits_update_own on public.outfits for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy outfits_delete_own on public.outfits for delete to authenticated using (owner_id = auth.uid());

create policy outfit_items_select_own on public.outfit_items for select to authenticated using (owner_id = auth.uid());
create policy outfit_items_insert_own on public.outfit_items for insert to authenticated with check (owner_id = auth.uid());
create policy outfit_items_update_own on public.outfit_items for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy outfit_items_delete_own on public.outfit_items for delete to authenticated using (owner_id = auth.uid());

create policy feedback_select_own on public.outfit_feedback for select to authenticated using (owner_id = auth.uid());
create policy feedback_insert_own on public.outfit_feedback for insert to authenticated with check (owner_id = auth.uid());
create policy feedback_update_own on public.outfit_feedback for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy history_select_own on public.outfit_history for select to authenticated using (owner_id = auth.uid());
create policy history_insert_own on public.outfit_history for insert to authenticated with check (owner_id = auth.uid());

create policy inspirations_select_own on public.inspirations for select to authenticated using (owner_id = auth.uid());
create policy inspirations_insert_own on public.inspirations for insert to authenticated with check (owner_id = auth.uid());
create policy inspirations_update_own on public.inspirations for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy inspirations_delete_own on public.inspirations for delete to authenticated using (owner_id = auth.uid());

create policy inspiration_matches_select_own on public.inspiration_matches for select to authenticated using (owner_id = auth.uid());
create policy inspiration_matches_insert_own on public.inspiration_matches for insert to authenticated with check (owner_id = auth.uid());

create policy plans_select_published on public.plans for select to anon, authenticated using (active = true);
create policy subscriptions_select_own on public.subscriptions for select to authenticated using (owner_id = auth.uid());
create policy entitlements_select_own on public.entitlements for select to authenticated using (owner_id = auth.uid());
create policy usage_counters_select_own on public.usage_counters for select to authenticated using (owner_id = auth.uid());
create policy ai_usage_select_own on public.ai_usage for select to authenticated using (owner_id = auth.uid());
create policy notifications_select_own on public.notifications for select to authenticated using (owner_id = auth.uid());
create policy notifications_update_own on public.notifications for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy product_feedback_select_own on public.feedback for select to authenticated using (owner_id = auth.uid());
create policy product_feedback_insert_own on public.feedback for insert to authenticated with check (owner_id = auth.uid());

create policy feature_flags_select_enabled on public.feature_flags for select to anon, authenticated using (enabled = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));

insert into storage.buckets (id, name, public)
values
  ('clothing-images', 'clothing-images', false),
  ('inspiration-images', 'inspiration-images', false)
on conflict (id) do update set public = excluded.public;

create policy clothing_storage_select_own on storage.objects for select to authenticated
  using (bucket_id = 'clothing-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy clothing_storage_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'clothing-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy clothing_storage_update_own on storage.objects for update to authenticated
  using (bucket_id = 'clothing-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'clothing-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy clothing_storage_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'clothing-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy inspiration_storage_select_own on storage.objects for select to authenticated
  using (bucket_id = 'inspiration-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy inspiration_storage_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'inspiration-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy inspiration_storage_update_own on storage.objects for update to authenticated
  using (bucket_id = 'inspiration-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'inspiration-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy inspiration_storage_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'inspiration-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy contact_requests_insert_public on public.contact_requests for insert to anon, authenticated
  with check (consent = true);

create table if not exists public.request_rate_limits (
  key text primary key check (char_length(key) between 16 and 200),
  window_start timestamptz not null,
  hits integer not null default 0 check (hits >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.request_rate_limits enable row level security;

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_window timestamptz;
  current_hits integer;
  now_utc timestamptz := timezone('utc', now());
begin
  if p_limit < 1 or p_window_seconds < 1 or char_length(p_key) < 16 then
    raise exception using errcode = '22023', message = 'invalid_rate_limit_arguments';
  end if;

  insert into public.request_rate_limits (key, window_start, hits)
  values (p_key, now_utc, 1)
  on conflict (key) do nothing;

  select window_start, hits
  into current_window, current_hits
  from public.request_rate_limits
  where key = p_key
  for update;

  if current_window + make_interval(secs => p_window_seconds) <= now_utc then
    update public.request_rate_limits
    set window_start = now_utc, hits = 1, updated_at = now_utc
    where key = p_key;
    return true;
  end if;

  if current_hits >= p_limit then
    return false;
  end if;

  update public.request_rate_limits
  set hits = current_hits + 1, updated_at = now_utc
  where key = p_key;
  return true;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to anon, authenticated;
