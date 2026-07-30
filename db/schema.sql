-- AppPulse AI — Full Database Schema
-- Run this in the Supabase SQL editor, in order, top to bottom.

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- USERS
-- Note: Supabase Auth already provides auth.users. This table
-- holds app-specific fields and is linked 1:1 via id = auth.uid()
-- ============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro')),
  app_id text unique not null default encode(gen_random_bytes(12), 'hex'),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamp with time zone default now(),
  current_period_end timestamp with time zone default (now() + interval '30 days'),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_users_app_id on public.users(app_id);

-- ============================================================
-- EVENTS
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null check (type in ('feedback', 'rage_click', 'crash', 'long_pause')),
  page_url text,
  raw_data jsonb not null default '{}',
  user_feedback text,
  ai_diagnosis text,
  ai_skipped_reason text, -- 'budget_exceeded' | null
  is_anonymized boolean default true,
  created_at timestamp with time zone default now()
);

create index idx_events_user_created on public.events(user_id, created_at desc);
create index idx_events_user_page on public.events(user_id, page_url);
create index idx_events_user_type_created on public.events(user_id, type, created_at desc);

-- ============================================================
-- FAKE DOORS
-- ============================================================
create table public.fake_doors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  feature_name text not null,
  feature_description text,
  button_text text,
  is_active boolean default true,
  total_clicks integer default 0,
  sentiment_score float,
  sentiment_summary text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_fake_doors_user on public.fake_doors(user_id);

-- ============================================================
-- FAKE DOOR CLICKS
-- ============================================================
create table public.fake_door_clicks (
  id uuid primary key default gen_random_uuid(),
  fake_door_id uuid references public.fake_doors(id) on delete cascade not null,
  feedback_text text,
  created_at timestamp with time zone default now()
);

create index idx_fake_door_clicks_door on public.fake_door_clicks(fake_door_id);

-- ============================================================
-- AI CALL LOG (crash-loop cost protection)
-- ============================================================
create table public.ai_call_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  app_id text not null,
  called_at timestamp with time zone default now()
);

create index idx_ai_call_log_app_time on public.ai_call_log(app_id, called_at desc);

-- ============================================================
-- ROW LEVEL SECURITY — mandatory, not optional
-- ============================================================

alter table public.users enable row level security;
create policy users_self on public.users
  for all using (auth.uid() = id);

alter table public.events enable row level security;
create policy events_owner on public.events
  for all using (auth.uid() = user_id);

alter table public.fake_doors enable row level security;
create policy fake_doors_owner on public.fake_doors
  for all using (auth.uid() = user_id);

alter table public.fake_door_clicks enable row level security;
create policy fake_door_clicks_owner on public.fake_door_clicks
  for all using (
    fake_door_id in (select id from public.fake_doors where user_id = auth.uid())
  );

alter table public.ai_call_log enable row level security;
create policy ai_call_log_owner on public.ai_call_log
  for all using (auth.uid() = user_id);

-- ============================================================
-- NOTES
-- ============================================================
-- 1. Public-facing endpoints (POST /api/events, POST /api/events/:id/feedback,
--    POST /api/fake-doors/:id/clicks) are called by the widget with NO user
--    JWT — they authenticate via app_id lookup instead. These inserts happen
--    via the Supabase SERVICE ROLE key server-side (bypasses RLS by design,
--    since there's no auth.uid() context from an anonymous widget request).
--    RLS still protects all READ access from the dashboard/frontend, which
--    always uses the user's own JWT.
-- 2. Plan limits (event caps, Fake Door caps) are enforced in application
--    code (see services/planLimits.js), not in the DB layer, since they
--    depend on current billing period and plan tier logic.
