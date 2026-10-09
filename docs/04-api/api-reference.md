# API Reference — `/api`

All routes are Next.js App Router route handlers (`force-dynamic`, Node runtime). JSON in/out unless noted.

> Last Updated: 2026-02-19 · Owner: hameed · Related: [Telemetry Guide](../06-analytics/telemetry-guide.md) · [ADR-002](../01-architecture/adr/adr-002-client-side-telemetry-ingestion.md)

---

## Telemetry

### `POST /api/analytics/track` — public
Single ingestion endpoint for all telemetry. The server resolves IP, parses the user agent
(device/browser/OS), resolves geo (CDN headers → ip-api.com → local-dev fallback), and upserts the
session on every call.

| Body field | Type | Notes |
| :--- | :--- | :--- |
| `sessionId` | string | **required** — client UUID (localStorage `portfolio_analytics_sid`) |
| `type` | string | `session_init` \| `pageview` \| `text_selection` \| `scroll` \| event types |
| `path`, `title`, `referrer` | string | Page context (pageviews) |
| `stayDuration`, `maxScrollPercentage` | number | Engagement metrics |
| `selectedText`, `selectedContext`, `scrollDepth` | string/number | Selection events |
| `leadSource`, `visitorEmail`, `visitorName` | string | Session enrichment (welcome toast) |
| `screenResolution`, `language` | string | Session init |

Cookie: `portfolio_lead_cookie` (90 days) links the visitor to their lead record.

Responses: `200` upserted/inserted · `400` missing sessionId · `500` DB failure.

### `GET /api/analytics/data` — 🔒 auth
Returns aggregated dashboard data (sessions, pageviews, events, leads counts) via
`getAnalyticsData()`.

### `DELETE /api/analytics/data` — 🔒 auth
Clears all analytics data (destructive).

### `GET /api/analytics/backup` — 🔒 auth
Downloads `portfolio_analytics_backup_YYYY-MM-DD.json` (all analytics + leads) as an attachment.

## Analytics Auth

`verifyAuth(req)` accepts, in order: `x-analytics-auth` header, `Authorization: Bearer <password>`,
or the `analytics_auth` HTTP-only cookie.

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics/auth` | Check current auth status → `{ authenticated: bool }` |
| `POST` | `/api/analytics/auth` | Body `{ password }` → on success sets `analytics_auth` cookie (7 days, HTTP-only, `secure` in prod, `sameSite=lax`) and returns `{ token }` |
| `DELETE` | `/api/analytics/auth` | Logout — deletes the cookie |

Password source: `ANALYTICS_PASSWORD` env (fallback `ANALYTICS_SECRET_KEY`; ⚠️ code default
`admin123` — always set the env var). See [ADR-003](../01-architecture/adr/adr-003-analytics-dashboard-auth.md).

## Leads

### `POST /api/leads` — public
| Body field | Type | Validation |
| :--- | :--- | :--- |
| `email` | string | **required**, must contain `@`, normalized lowercase |
| `reason` | string | **required** |
| `name` | string | optional; falls back to existing lead's name on re-submit |
| `source` | string | attribution (UTM params / referrer via `detectLeadSource`) |
| `sessionId` | string | links lead → analytics session |

Behavior: upsert by email (UNIQUE); reuses existing `cookie_id`/lead id; resolves IP + geo
location. Responses: `200` · `400` invalid input · `500`.

### `GET /api/leads` — ⚠️ **UNPROTECTED**
Returns `{ success, leads }` — **all lead submissions (names, emails, IPs)**.
No `verifyAuth` guard is applied. **Security gap — fix is a roadmap priority**
([Roadmap](../09-roadmap/roadmap.md)). Until fixed, do not consider lead data private.

## Content (localized pages)

All return `{ success: true, data }` on success, `404 { success: false, message }` on miss.
Data comes from repositories reading `src/data/**/<lang>.json`.

| Method | Route | Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/mainpages/career/[company]/[lang]` | path | Company detail content (e.g. `cognizant`/`ar`) |
| `GET` | `/api/mainpages/future/[lang]` | path | Future/roadmap page content |
| `GET` | `/api/mainpages/projects/[slug]` | path + query `lang` (default `en`) | Project / case-study content |

## Error format

```json
{ "error": "Human-readable message" }        // failures
{ "success": false, "message": "…", "error": … } // content 404s
```

## Conventions & caveats

- **No rate limiting** exists on any route (roadmap).
- Tracking/lead routes log server-side to `console` — visible in Vercel function logs.
- `AbortSignal.timeout` guards geo lookups (2–3 s) so tracking never hangs.
