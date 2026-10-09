# Environment Variables

Complete matrix of every environment variable the code reads, with aliases, scope, and where it's consumed.

> Last Updated: 2026-02-19 · Owner: hameed · Files: `.env.local` (dev) · `.env.vercelprod` (prod reference) · Vercel project settings

---

## Matrix

| Variable (aliases) | Scope | Required | Consumed by | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `SUPABASE_URL` (`NEXT_PUBLIC_SUPABASE_URL`) | server + client | ✅ | `src/utils/supabase/{client,middleware,server}.ts`, `src/lib/analyticsDb.ts` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`) | server + client | ✅* | same as above | Publishable/anon key (currently unused for direct ingestion — see ADR-002) |
| `SUPABASE_SERVICE_ROLE_KEY` (`SUPABASE_SERVICE_KEY`) | **server only** | ✅ | `src/lib/analyticsDb.ts` | Service-role key — bypasses RLS; used by all API routes. **Never expose to the client** |
| `ANALYTICS_PASSWORD` (`ANALYTICS_SECRET_KEY`) | server | ✅ | `src/lib/analyticsAuth.ts` | Admin password for the analytics dashboard + data APIs. ⚠️ Falls back to `admin123` if unset — always set a strong value |
| `NEXT_PUBLIC_EMAIL` | client | optional | about page, Future UI, analytics dashboard | Contact email |
| `NEXT_PUBLIC_GITHUB` | client | optional | about page, Future UI, analytics dashboard | GitHub profile URL |
| `NEXT_PUBLIC_LINKEDIN` | client | optional | about page, Future UI, analytics dashboard | LinkedIn profile URL |

\* Required by config completeness; the anon client exists for a future direct-ingestion mode.

## Sanitization

All readers run values through `sanitizeEnv()` (trim + strip wrapping quotes) — so values with
stray quotes still work. URL trailing slashes are stripped. If server Supabase config is missing,
the analytics layer returns a **null client** and logs
`[Supabase Analytics] Missing database credentials on runtime…` — routes fail gracefully.

## Where to set them

| Environment | Location |
| :--- | :--- |
| Local dev | `.env.local` (git-ignored) |
| Production | Vercel → Project → Settings → Environment Variables |
| Reference copies | `.env.vercelprod` (committed; contains no real secrets — verify before pushing) |

## `.env.example` template

```bash
# --- Supabase (Settings → API) ---
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server only — treat as secret

# --- Analytics dashboard admin password ---
ANALYTICS_PASSWORD=<strong-password>          # no default in production!

# --- Public profile links ---
NEXT_PUBLIC_EMAIL=you@example.com
NEXT_PUBLIC_GITHUB=https://github.com/you
NEXT_PUBLIC_LINKEDIN=https://www.linkedin.com/in/you
```

## Security rules

1. `SUPABASE_SERVICE_ROLE_KEY` and `ANALYTICS_PASSWORD` must appear **only** in server-scoped
   variables and never with the `NEXT_PUBLIC_` prefix.
2. Never commit real secrets: `.gitignore` covers `.env*` — double-check before pushing any
   `.env.vercelprod` update.
3. Rotate `SUPABASE_SERVICE_ROLE_KEY` + `ANALYTICS_PASSWORD` if they ever leak.
