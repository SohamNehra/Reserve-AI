-- ============================================================
-- ReserveAI — Supabase Schema
-- Run this entire file in the Supabase SQL editor
-- ============================================================

-- ----------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------

create table businesses (
  id                       uuid primary key default gen_random_uuid(),
  clerk_user_id            text not null unique,
  name                     text not null,
  type                     text not null check (type in ('restaurant', 'clinic', 'salon', 'other')),
  description              text,
  phone_number             text,
  timezone                 text not null default 'UTC',
  vapi_assistant_id        text,
  vapi_phone_number_id     text,
  slot_duration_mins       integer not null default 30,
  working_hours            jsonb not null default '{}'::jsonb,
  google_calendar_connected boolean not null default false,
  google_access_token      text,
  google_refresh_token     text,
  google_calendar_id       text,
  created_at               timestamptz not null default now()
);

create table reservations (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references businesses(id) on delete cascade,
  customer_name   text not null,
  customer_phone  text,
  date            date not null,
  time_slot       text not null,  -- stored as "HH:MM", e.g. "18:00"
  party_size      integer,
  notes           text,
  status          text not null default 'confirmed'
                    check (status in ('confirmed', 'cancelled', 'completed')),
  created_via     text not null default 'manual'
                    check (created_via in ('voice', 'manual')),
  vapi_call_id    text,
  created_at      timestamptz not null default now()
);

create table calls (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references businesses(id) on delete cascade,
  vapi_call_id     text not null unique,
  customer_phone   text,
  duration_seconds integer,
  transcript       jsonb,
  outcome          text check (outcome in (
                     'reservation_created',
                     'no_availability',
                     'hung_up',
                     'transferred'
                   )),
  reservation_id   uuid references reservations(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------

create index on reservations(business_id, date);
create index on reservations(business_id, status);
create index on calls(business_id, created_at desc);
create index on calls(vapi_call_id);
create index on businesses(clerk_user_id);

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------

alter table businesses   enable row level security;
alter table reservations enable row level security;
alter table calls        enable row level security;

-- Helper function: reads a session-level variable set per connection
-- Used by RLS policies as a defense-in-depth layer.
-- Primary enforcement is done via service_role key in server code.
create or replace function requesting_user_id()
returns text
language sql stable
as $$
  select current_setting('app.clerk_user_id', true)::text;
$$;

-- businesses: each user can only access their own row
create policy "own_business" on businesses
  for all
  using     (clerk_user_id = requesting_user_id())
  with check (clerk_user_id = requesting_user_id());

-- reservations: accessible only through the owning business
create policy "own_reservations" on reservations
  for all
  using (
    exists (
      select 1 from businesses b
      where b.id = reservations.business_id
        and b.clerk_user_id = requesting_user_id()
    )
  );

-- calls: same pattern
create policy "own_calls" on calls
  for all
  using (
    exists (
      select 1 from businesses b
      where b.id = calls.business_id
        and b.clerk_user_id = requesting_user_id()
    )
  );
