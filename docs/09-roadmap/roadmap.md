# Roadmap & Technical Debt

Planned work, honest assessment of known gaps, and the priority order for tackling them.

> Last Updated: 2026-02-19 · Owner: hameed · Gaps here are referenced from throughout the docs.

---

## Priority legend

🔴 security/privacy · 🟠 correctness/robustness · 🟡 quality/SEO · 🟢 nice-to-have

## Near term (next sprint)

| # | Item | Why | Where documented |
| :- | :--- | :--- | :--- |
| 1 | 🔴 Add `verifyAuth` to `GET /api/leads` (dashboard should call it with the auth cookie) | Currently **all lead PII is public** | [API Reference §Leads](../04-api/api-reference.md#leads) |
| 2 | 🔴 Fail-closed auth: remove `admin123` default; require `ANALYTICS_PASSWORD` | Default password on misconfigured deploys | [ADR-003](../01-architecture/adr/adr-003-analytics-dashboard-auth.md) |
| 3 | 🔴 Add rate limiting / lockout to `/api/analytics/auth` and `/api/analytics/track` | Brute force + telemetry spam | [Telemetry Guide §5](../06-analytics/telemetry-guide.md#5-privacy--data-governance-read-this) |
| 4 | 🟠 Delete stale duplicates (`DiagonalSlash copy.tsx`, `CareerMapCanvas copy.tsx`) and empty `test.md`; dev-gate `AnimationTester` | Bundle hygiene, confusion risk | [ADR-005](../01-architecture/adr/adr-005-framer-motion-transitions.md) |
| 5 | 🟠 Replace `http://ip-api.com` with an HTTPS geo provider or header-only enrichment | Mixed-content + data-in-plain-text risk | [Deployment §6](../08-operations/deployment.md) |
| 6 | 🟡 Add GitHub Actions CI: `npm run lint && npm run build` on PRs | Catch breakage pre-merge | [Deployment §6](../08-operations/deployment.md) |

## Mid term

| Item | Notes |
| :--- | :--- |
| 🔴 Consent + retention strategy | Add a consent banner or reduce collection (text selections!), plus a Supabase retention job — see [Telemetry Guide §5](../06-analytics/telemetry-guide.md#5-privacy--data-governance-read-this) |
| 🟠 Database indexes | `created_at` + `session_id` indexes on pageviews/events as data grows — [Database Schema](../03-database/database-schema.md#notes--known-gaps-roadmap-items) |
| 🟠 `navigator.sendBeacon` fallback | More reliable final-pageview flush than keepalive in some browsers |
| 🟡 Spanish content coverage | Career/projects data JSONs are `en`/`ar` only — [i18n Guide §3](../07-i18n/i18n-guide.md#3-content-files-page-data) |
| 🟡 SEO for locales | Consider `next-intl` locale routes if multilingual SEO becomes a goal — [ADR-004](../01-architecture/adr/adr-004-i18n-zustand-json.md) |
| 🟡 Arabic-optimized font | Only Inter (latin) is loaded today — [i18n Guide §6](../07-i18n/i18n-guide.md#6-rtl-notes) |
| 🟡 `prefers-reduced-motion` | Verify all transition variants respect the media query |

## Long term

- **Testing strategy** — no test suite exists. Suggested order: unit tests for `pathfinding/`
  (pure logic), API route integration tests with a Supabase test project, then component tests.
- **Playground expansion** — turn `/playground` into an interactive AI/agent demo showcase (the
  original intent behind "AI Portfolio").
- **Direct client ingestion mode** — decide whether to actually enable the RLS anon-insert path
  (would remove the serverless hop) or delete the unused browser client — [ADR-002](../01-architecture/adr/adr-002-client-side-telemetry-ingestion.md).
- **Content management** — moving career/projects JSON into Supabase tables for editing without deploys.
- **Monorepo packaging** — extract the transition engine + ImageViewer into reusable packages if
  other sites need them.

## Done (previously roadmap)

- 2026-09: env sanitization, dynamic client init, forced dynamic routes (robust Supabase layer)
- 2026-07: full telemetry system, lead tracking + welcome toast, i18n (en/es/ar), career graph
