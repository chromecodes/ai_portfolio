# Deployment Guide — Vercel

How this portfolio ships to production, and how to recover when something goes wrong.

> Last Updated: 2026-02-19 · Owner: hameed · Related: [Environment Variables](../05-setup/environment-variables.md) · [Local Setup](../05-setup/local-setup.md)

---

## 1. Platform

- **Host:** Vercel, framework preset **Next.js** (auto-detected). Build `next build`, output `.next`.
- **Runtime:** All API routes run as serverless functions with `export const dynamic = 'force-dynamic'`
  — no caching of analytics or content responses.
- **Config:** `next.config.ts` enables the **React Compiler** and `allowedDevOrigins` (LAN dev access).

## 2. First deployment

1. **Import the repo** into Vercel (New Project → GitHub repo).
2. **Set environment variables** (Settings → Environment Variables, *all environments*):

   | Variable | Notes |
   | :--- | :--- |
   | `SUPABASE_URL` | Supabase project URL |
   | `SUPABASE_PUBLISHABLE_KEY` | anon/publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ secret — server only |
   | `ANALYTICS_PASSWORD` | ⚠️ must be set; code falls back to `admin123` |
   | `NEXT_PUBLIC_EMAIL` / `_GITHUB` / `_LINKEDIN` | optional profile links |

   A committed `.env.vercelprod` exists as a **reference of required keys** — it must not contain
   live secrets.
3. **Provision the database** — run `database_setup.sql` against the production Supabase project
   (see [Database Schema §Setup](../03-database/database-schema.md#setup-fresh-environment)). Use a
   separate project from dev if you don't want dev traffic mixed in.
4. Deploy. Verify: home page loads, telemetry rows appear, `/analytics` auth works.

## 3. Deploy flow (ongoing)

- Push to the default branch → automatic production deployment.
- Every PR gets a preview deployment (safe for checking animations/i18n before merge).
- Dashboard command: `vercel --prod` if using the CLI.

## 4. Post-deploy checklist

| Check | How |
| :--- | :--- |
| Telemetry writing | Visit pages → Supabase Table Editor → `analytics_sessions` |
| Lead flow | Submit the lead modal → row appears + welcome toast on return |
| Analytics auth | `/analytics` → password → data loads; wrong password → 401 |
| Env leakage | View page source / bundle — service-role key must not appear |
| Function logs | Vercel → Project → Logs (Supabase errors surface here) |

## 5. Rollback

1. Vercel → **Deployments** → find the last known-good deployment.
2. **⋯ menu → Promote to Production** (instant, no rebuild).
3. If the schema is the culprit, re-run the needed part of `database_setup.sql`
   ⚠️ but note it drops tables — prefer targeted SQL for production recovery.
4. Rotate `ANALYTICS_PASSWORD` / service key if the incident was security-related.

## 6. Operational notes

- **Geo enrichment** depends on Vercel headers (`x-vercel-ip-country`, `x-vercel-ip-city`); on
  other hosts it falls back to `ip-api.com` over **http** (roadmap: https geo provider).
- **No uptime monitoring** is configured — add a Vercel cron or external monitor for `/home` if
  needed (roadmap).
- **No CI pipeline** runs lint/build on PRs yet — recommended: GitHub Action with
  `npm run lint && npm run build` (roadmap).
- **Free-tier pausing:** Supabase pauses inactive free projects; telemetry traffic generally keeps it warm.
