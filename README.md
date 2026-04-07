# ReserveAI

An AI-powered voice reservation system. Customers call your business phone number, talk to an AI receptionist, and get a reservation booked — automatically, 24/7.

**Live demo:** [reserve-ai.vercel.app](https://reserve-ai.vercel.app)

---

## What it does

- AI answers every inbound call in your business's name
- Checks real-time availability (your hours + existing bookings + Google Calendar)
- Books the reservation and confirms it to the caller
- Everything shows up instantly in your dashboard
- Syncs to Google Calendar automatically

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | Clerk |
| Database | Supabase (Postgres) |
| Voice AI | Vapi (phone calls + tool calling) |
| LLM | GPT-4o mini (via Vapi) |
| Calendar | Google Calendar API (OAuth2) |
| Deployment | Vercel |
| Styling | Tailwind CSS v4, Ubuntu font |

## Features

- **AI voice calls** — Vapi handles inbound calls, GPT-4o mini understands natural language, tool calls hit your webhook to check/book slots
- **Real-time availability** — slots generated from your configured working hours, filtered against existing bookings and Google Calendar events
- **Dashboard** — today's slot grid, upcoming reservations, call logs with transcripts, monthly stats
- **Reservation management** — create, edit (date/time/party size/notes), complete, and cancel reservations
- **Google Calendar sync** — connect once, bookings appear as calendar events; existing events block availability
- **Settings** — business profile, working hours, slot duration, voice assistant details, integrations
- **5-step onboarding** — business info → hours → slot config → AI assistant creation → done

## Getting started

### Prerequisites

- Node.js 18+
- Accounts on: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Vapi](https://vapi.ai), [OpenAI](https://platform.openai.com), [Google Cloud Console](https://console.cloud.google.com)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/reserve-ai.git
cd reserve-ai
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Vapi
VAPI_API_KEY=...
VAPI_PHONE_NUMBER_ID=...
VAPI_WEBHOOK_SECRET=any_random_secret

# OpenAI
OPENAI_API_KEY=sk-...

# Google Calendar OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback

# App URL (update to your Vercel URL in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase

Run the following SQL in your Supabase SQL editor:

```sql
create table businesses (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  name text not null,
  type text not null,
  description text,
  phone_number text,
  timezone text not null default 'America/New_York',
  working_hours jsonb not null default '{}',
  slot_duration_mins integer not null default 30,
  vapi_assistant_id text,
  google_calendar_connected boolean default false,
  google_access_token text,
  google_refresh_token text,
  google_token_expiry bigint,
  created_at timestamptz default now()
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  customer_name text not null,
  customer_phone text,
  date date not null,
  time_slot text not null,
  party_size integer,
  notes text,
  status text not null default 'confirmed',
  created_via text not null default 'manual',
  vapi_call_id text,
  created_at timestamptz default now()
);

create table calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  vapi_call_id text unique,
  customer_phone text,
  duration_seconds integer,
  transcript jsonb,
  outcome text default 'hung_up',
  reservation_id uuid references reservations(id),
  created_at timestamptz default now()
);
```

### 4. Configure Clerk

- Create an application in [Clerk Dashboard](https://dashboard.clerk.com)
- For production, create a Production instance and add your Vercel domain
- Add your app URL to allowed origins

### 5. Configure Google OAuth

- In [Google Cloud Console](https://console.cloud.google.com), create an OAuth 2.0 Client ID
- Add `http://localhost:3000/api/google/callback` to authorized redirect URIs (and your Vercel URL for production)
- Enable the Google Calendar API

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and complete onboarding. The AI assistant is created automatically during onboarding.

### 7. Connect Vapi webhook (required for voice calls to work)

After onboarding, the assistant's webhook URL needs to point to your public URL. For local development use [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Update `NEXT_PUBLIC_APP_URL` in `.env.local` to your ngrok URL, restart the dev server, then run in your browser console while logged in:

```js
fetch('/api/businesses/update-webhook', { method: 'PATCH' }).then(r => r.json()).then(console.log)
```

For production on Vercel this only needs to be done once with your permanent URL.

## Deployment

1. Push to GitHub
2. Import to [Vercel](https://vercel.com) — Next.js auto-detected
3. Add all environment variables in Vercel project settings
4. Update `NEXT_PUBLIC_APP_URL` and `GOOGLE_REDIRECT_URI` to your `*.vercel.app` URL
5. Add the Vercel URL to Google Cloud Console's authorized redirect URIs
6. Create a Clerk Production instance and update the Clerk keys in Vercel
7. After deploy, run the webhook patch once from your browser console

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Sign in / sign up pages
│   ├── api/             # API routes (reservations, calls, webhook, google oauth)
│   ├── dashboard/       # Dashboard pages (overview, reservations, calls, settings)
│   ├── onboarding/      # 5-step onboarding wizard
│   └── page.tsx         # Landing page + auth redirect
├── components/
│   ├── calls/           # Call logs table + badges
│   ├── dashboard/       # TopNav, LeftPanel, SlotGrid, GoogleCalendarCard
│   ├── onboarding/      # Wizard steps
│   ├── reservations/    # Reservations table, create/edit dialogs
│   ├── settings/        # Settings tabs
│   └── ui/              # shadcn base components
└── lib/
    ├── availability.ts  # Slot generation + GCal conflict detection
    ├── reservation.ts   # Reservation creation helper
    ├── format-time.ts   # 12h time formatter (client-safe)
    ├── google/          # OAuth helpers + Calendar API
    ├── supabase/        # Supabase client + types
    └── vapi/            # Vapi assistant creation + webhook update
```

## How voice booking works

```
Customer calls AI phone number
         ↓
    Vapi receives call
         ↓
  GPT-4o mini handles conversation
         ↓
  Tool call: check_availability(date)
         ↓
  POST /api/webhook/vapi
  → queries Supabase + Google Calendar
  → returns available slots in 12h format
         ↓
  GPT reads slots to customer, customer picks one
         ↓
  Tool call: create_reservation(date, time, name, ...)
         ↓
  POST /api/webhook/vapi
  → saves to Supabase reservations table
  → creates Google Calendar event (fail-open)
  → revalidates dashboard cache
         ↓
  GPT confirms booking to customer
```
