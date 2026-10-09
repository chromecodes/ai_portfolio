# Local Setup Guide

From a fresh clone to a running dev server in ~10 minutes.

> Last Updated: 2026-02-19 · Owner: hameed · Related: [Environment Variables](environment-variables.md) · [Database Schema](../03-database/database-schema.md)

## Prerequisites

- **Node.js ≥ 20** (project built with 26) + npm
- A **Supabase** account (free tier is fine) — [supabase.com](https://supabase.com)
- Git

## Steps

### 1. Clone & install

```bash
git clone <your-repo-url> ai_portfolio
cd ai_portfolio
npm install
```

### 2. Create the Supabase project

1. Supabase Dashboard → **New project** → pick a region close to you.
2. Copy the **Project URL** and the two keys: **Publishable (anon)** and **service_role**
   (Settings → API). The service-role key is a **secret** — treat it like a password.

### 3. Provision the database

Open **SQL Editor** in the Supabase dashboard, paste the full contents of
[`database_setup.sql`](../../database_setup.sql), and run it. It creates the 4 tables
(sessions, pageviews, events, leads) with RLS enabled. ⚠️ It first drops those tables if they
exist — never run it against an environment whose data you need.

### 4. Configure environment

```bash
cp .env.example .env.local
# fill in the values — see docs/05-setup/environment-variables.md
```

Minimum required for full functionality:
`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANALYTICS_PASSWORD`.

### 5. Run

```bash
npm run dev     # → http://localhost:3000
```

`/` redirects to `/home`. Visit a few pages, then check Supabase → Table Editor →
`analytics_sessions` to confirm telemetry is landing (rows can take a few seconds).

### 6. Verify the analytics dashboard

1. Open `/analytics`.
2. Enter your `ANALYTICS_PASSWORD` value when prompted.
3. You should see sessions/pageviews/events from your own visits; **Export** downloads a JSON backup.

## Useful checks

| Symptom | Likely cause |
| :--- | :--- |
| `[Supabase Analytics] Missing database credentials` in console | `.env.local` missing or quotes/spaces in values (code sanitizes, but they must exist) |
| No rows in `analytics_sessions` | DB script not run, or wrong `SUPABASE_URL` |
| Dashboard 401 | Wrong `ANALYTICS_PASSWORD`, or relying on the insecure `admin123` default |
| Geo shows "Developer Studio" | Expected — local dev falls back when geo resolution fails |

## Build & lint

```bash
npm run build    # production build (TypeScript checked)
npm run lint     # ESLint
```

> Note: there is no test suite in the repo yet — see the [Roadmap](../09-roadmap/roadmap.md).
