# Codebase Breakdown

> Status: Verified against the current working tree. This document describes what the code does now; proposed changes live in the [implementation plan](../IMPLEMENTATION_PLAN.md).

## 1. Executive summary

This is a **localized, interactive developer portfolio with a built-in analytics and lead-capture platform**.

Despite the repository name, there is **no active AI/LLM feature** in the current application. AI-related material is portfolio content, and the old chat bar is disabled with its backend request commented out.

The project has two largely independent sides:

1. **Public portfolio** — welcome page, career visualization, project case studies, about page, and roadmap.
2. **Telemetry platform** — visitor tracking, lead capture, and a password-protected analytics dashboard backed by Supabase.

The most important architectural distinction is:

- **Portfolio content comes from local TypeScript/JSON files.**
- **Supabase stores analytics and leads only.**
- Portfolio content is not managed in a CMS or database.

---

## 2. Technology stack

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 16**, App Router, route handlers |
| UI runtime | **React 19**, TypeScript |
| Compiler | Next.js **React Compiler**, enabled in `next.config.ts` |
| Styling | **Tailwind CSS 4**, CSS variables, SCSS/Sass |
| Components | Radix UI primitives with shadcn-style wrappers |
| Animation | **Framer Motion 12**, custom CSS and Canvas animations |
| Client state | **Zustand 5** |
| Persistence | Browser local/session storage, cookies, **Supabase PostgreSQL** |
| Database access | `@supabase/supabase-js` and `@supabase/ssr`; no ORM |
| Backend | Next.js Node route handlers under `src/app/api` |
| External service | `ip-api.com` fallback geolocation |
| Deployment target | **Vercel** |
| Media | Static images, video, icons, and PDF under `public/` |

There are no active Python services, LLM SDKs, vector databases, or chat APIs in this codebase.

---

## 3. High-level architecture

```text
                           Browser
 ┌──────────────────────────────────────────────────────────┐
 │ React pages and feature components                       │
 │                                                          │
 │ Zustand: language, theme, cursor                         │
 │ Browser storage: session ID, preferences, auth token     │
 │ AnalyticsTracker + LeadWelcomeToast                      │
 └───────────────┬───────────────────┬──────────────────────┘
                 │                   │
        Content requests       Telemetry / lead requests
                 │                   │
                 ▼                   ▼
 ┌──────────────────────────────────────────────────────────┐
 │ Next.js application and API route handlers               │
 │                                                          │
 │ /api/mainpages/*       Content repositories              │
 │ /api/analytics/track   Validation, UA parsing, geo       │
 │ /api/leads             Lead creation and admin retrieval │
 │ /api/analytics/auth    Password → signed admin token     │
 │ /api/analytics/data    Protected analytics read/delete   │
 │ /api/analytics/backup  Protected JSON export             │
 └───────────────┬───────────────────┬──────────────────────┘
                 │                   │
                 ▼                   ▼
       Local JSON content      Supabase PostgreSQL
       src/data/**             analytics + lead tables
                                      ▲
                                      │
                            Service-role key only
```

### Directory responsibilities

| Path | Responsibility |
| --- | --- |
| `src/app` | App Router pages, root layout, and HTTP route handlers |
| `src/components` | Global trackers, toast, media viewer, animation, and UI primitives |
| `src/features` | Page-level feature modules such as Welcome, Career, Projects, and Analytics |
| `src/lib` | Server persistence, auth/security, geo, repositories, and client stores |
| `src/data` | Localized portfolio content |
| `src/types` | Shared content and domain interfaces |
| `src/utils` | i18n, Supabase helper clients, and browser utilities |
| `public` | Static media and downloadable CV |
| `database_setup.sql` | Destructive database recreation script and RLS lockdown |

---

## 4. Application shell and rendering

`src/app/layout.tsx` wraps every route with:

```text
RootLayout
├── AnalyticsTracker
├── LeadWelcomeToast
├── ThemeInitializer
├── Topbar
│   ├── Logo
│   ├── Animated navigation
│   ├── Language selector
│   └── Theme switch
├── Scrollable page container
│   └── Current route
├── Footbar
├── RouteTransitionController
└── AnimationTester
```

### Rendering model

The root layout and a few page wrappers are Server Components, but **almost all actual page experiences are Client Components**.

Consequences:

- Navigation, animations, localization, media galleries, and Canvas rendering happen in the browser.
- Career/project detail pages initially render a loader and then fetch content from Next.js APIs.
- There is no significant server-side rendering of career or project detail content.
- Data fetching uses plain `fetch`; there is no React Query, SWR, or centralized API cache.
- Analytics routes are explicitly dynamic; portfolio content routes use filesystem repositories.

---

## 5. Routes and features

| Route | Implementation |
| --- | --- |
| `/` | Rich guided welcome page aggregating projects, career, and roadmap data |
| `/home` | Simpler animated personal introduction |
| `/about` | Bio, skills, engineering values, and contact links |
| `/career` | Interactive Canvas-based career map |
| `/career/[company]` | Localized career detail page |
| `/career/future` | Special alias rendering the roadmap UI |
| `/projects` | Filterable project catalog |
| `/projects/[slug]` | Standard project or specialized case-study presentation |
| `/future` | Roadmap, current interests, project pipeline, collaboration CTA |
| `/analytics` | Protected analytics administration dashboard |
| `/playground` | ImageViewer development/test page |

The dynamic career route is implemented as a catch-all, but current behavior primarily uses its first segment.

### Welcome page

`src/features/Welcome/WelcomeUI.tsx` combines:

- Project summaries from `projectsData.ts`
- Career statistics and destinations from the career graph data
- Current work and future projects from roadmap JSON
- Framer Motion reveals
- Scroll-reactive gradient background
- Text-scramble animations
- Links into all major sections

It is effectively an aggregated, client-rendered dashboard for the portfolio content.

### Career map

`src/features/Career/Graph/CareerMapCanvas.tsx` implements:

- Randomized organic node placement
- A force-repulsion pass to reduce node overlap
- Moving particles
- Multiple paths between sequential career nodes
- Hover tooltips
- Click-to-navigate career details
- Theme and language-dependent redraws

**Implementation detail:** the active Canvas uses a custom nearest-candidate/DFS path search. A separate A* implementation exists under `Graph/pathfinding/`, but it is not connected to the active Canvas. The current map should therefore not be documented as running on A*.

### Projects

The catalog is bundled directly into the client from:

```text
src/data/projects/pojecthub/{en,ar}.json
```

Users filter projects locally by category. Opening a project calls:

```text
GET /api/mainpages/projects/:slug?lang=:language
```

The route reads the matching JSON file from `src/data/projects/<slug>/`.

The returned `project_type` determines the UI:

- `Case Study` → `CaseStudyDetailUI`
- Anything else → `ProjectDetailUI`

Media is rendered through the reusable `ImageViewer`, which supports blur placeholders, in-view loading, arrows, dots, keyboard navigation, and swipe gestures.

---

## 6. Localization and client state

### Language

`src/utils/i18n/useLanguageStore.ts` is a persisted Zustand store:

```text
User selects EN / ES / AR
        │
        ▼
Zustand updates language + translation dictionary
        │
        ├── Saves selection in localStorage: portfolio_language
        ├── Sets <html lang="...">
        ├── Sets RTL for Arabic, LTR otherwise
        ├── Client pages re-render
        └── Detail pages refetch localized content
```

Content support is not uniform:

| Content | Languages/fallback |
| --- | --- |
| General UI | English, Spanish, Arabic |
| Project catalog | English and Arabic; other languages fall back to English |
| Career graph | English and Arabic; other languages fall back to English |
| Career/project details | Requested language, with English file fallback |
| Roadmap | English, Spanish, Arabic |

### Theme

Theme is handled separately:

- `ThemeInitializer` reads the saved theme or system preference.
- `useThemeStore` toggles the `dark` class on `<html>`.
- Preference is stored in `localStorage.theme`.
- Tailwind semantic colors resolve through CSS variables in `globals.css`.

### Browser state inventory

| Data | Storage |
| --- | --- |
| Analytics session ID | `localStorage`, sliding one-hour expiry |
| Lead identity | 90-day `portfolio_lead_cookie` |
| Lead attribution | `sessionStorage` |
| Toast dismissal/name | `sessionStorage` |
| Admin token | HTTP-only cookie plus local/session storage |
| Cursor position | Non-persistent Zustand store |

---

## 7. Content dataflow

### Career detail

```text
/career/prostack360
        │
        ▼
CareerPath client page
        │
        ▼
GET /api/mainpages/career/prostack360/en
        │
        ▼
getCareer()
        │
        ├── Validate company and language path segments
        ├── Read src/data/career/prostack360/en.json
        └── Fall back to en.json if necessary
        │
        ▼
CareerUI / OrginPage
```

### Roadmap

The roadmap has a two-stage strategy:

1. Immediately initialize from statically imported JSON through `clientRepository.ts`.
2. Fetch `/api/mainpages/future/:lang` and replace the data if successful.
3. If the request fails, retain/fall back to bundled data.

### Project detail

```text
/projects/easyform
        │
        ▼
GET /api/mainpages/projects/easyform?lang=ar
        │
        ▼
getProject()
        │
        ├── Validate slug/language
        ├── Try slug variants
        ├── Read requested JSON
        └── Fall back to English
        │
        ▼
Standard or case-study renderer
```

Content route parameters are restricted with safe-segment regular expressions to prevent path traversal. Errors returned to browsers are generic rather than raw filesystem errors.

---

## 8. Analytics dataflow

### Browser collection

`AnalyticsTracker` runs globally and collects:

- Page entry and route changes
- Stay duration
- Maximum scroll depth
- Text selections
- Outbound/contact link clicks
- Tab-hidden events for identified visitors
- Language changes, dispatched separately by `ToolBar`
- Lead-source attribution from URL parameters and referrers

A typical request is:

```text
POST /api/analytics/track
{
  sessionId,
  type,
  path,
  title,
  stayDuration,
  maxScrollPercentage,
  selectedText,
  selectedContext,
  leadSource,
  cookieId
}
```

Requests use `keepalive` where appropriate so final telemetry can survive navigation/unload.

### Server processing

`src/app/api/analytics/track/route.ts` then:

1. Applies an IP rate limit: **120 requests/minute**.
2. Checks same-origin for browser POST requests.
3. Validates the session ID and sanitizes/clamps inputs.
4. Parses device, browser, and OS from the User-Agent.
5. Resolves IP and geolocation.
6. Upserts `analytics_sessions`.
7. Inserts a pageview or interaction event depending on `type`.

```text
Browser event
   │
   ▼
/api/analytics/track
   │
   ├── Session upsert ───────────────► analytics_sessions
   │
   ├── type=pageview ────────────────► analytics_pageviews
   │
   └── type=text_selection/click/etc ► analytics_events
```

Geolocation prefers Vercel/Cloudflare headers. Otherwise it calls `ip-api.com`, with an in-memory TTL cache to avoid repeated lookups.

Pageviews are inserted both on entry and when final engagement statistics are flushed. Entry and exit records should not currently be interpreted as one row per unique navigation. Making this lifecycle idempotent is a next-update priority.

---

## 9. Lead-capture dataflow

After 15 seconds, `LeadWelcomeToast` appears if:

- There is no lead cookie.
- It was not dismissed during the current browser session.

The flow is:

```text
Select visitor category
        │
        ├── Send toast_step telemetry
        │
        ▼
Enter name/email
        │
        ▼
POST /api/leads
        │
        ├── Rate limit: 10 submissions/hour/IP
        ├── Validate email and reason
        ├── Find existing lead by normalized email
        ├── Reuse or create lead/cookie ID
        ├── Resolve IP location
        ├── Upsert lead_submissions on unique email
        ├── Associate identity with analytics session(s)
        └── Set 90-day portfolio_lead_cookie
```

A visitor arriving with both `name` and `email` URL parameters can also be captured automatically.

No email is actually sent by the application; it stores the lead for later follow-up.

The current `GET /api/leads` is **admin-only** and returns all leads. It is not a public returning-user lookup.

---

## 10. Analytics dashboard and authentication

### Login

```text
Password
   │
   ▼
POST /api/analytics/auth
   │
   ├── Constant-time password comparison
   ├── Login rate limit: 10 attempts/15 minutes/IP
   └── Create seven-day HMAC-signed token
           │
           ├── HTTP-only analytics_auth cookie
           └── Token returned to dashboard
```

Protected APIs accept the signed token via:

- `x-analytics-auth`
- `Authorization: Bearer`
- `analytics_auth` cookie
- `token` query parameter for backup downloads

The server fails closed when `ANALYTICS_PASSWORD` is missing. The dashboard text claiming a default `admin123` password is stale.

### Dashboard retrieval

After authentication:

- `GET /api/analytics/data` fetches:
  - Latest 100 sessions
  - Latest 300 pageviews
  - Latest 500 events
- `GET /api/leads` separately retrieves leads.
- Aggregation and filtering happen in the browser.
- Visible dashboards refresh every 60 seconds.
- Backup downloads produce JSON containing analytics and leads.
- Clear Logs deletes analytics sessions/pageviews/events, not leads.

---

## 11. Database model

`database_setup.sql` defines four tables:

```text
analytics_sessions
  └── analytics_pageviews  (session_id FK, cascade delete)
  └── analytics_events     (session_id FK, cascade delete)

lead_submissions
  └── logically linked to sessions through cookie_id/email
```

| Table | Purpose |
| --- | --- |
| `analytics_sessions` | Device, location, attribution, identity, first/last seen metadata |
| `analytics_pageviews` | Path, referrer, stay duration, scroll depth, timestamp |
| `analytics_events` | Text selections, clicks, route/inactivity, and language events |
| `lead_submissions` | Name, email, reason, source, location, and persistent cookie identity |

### Security model

- RLS is enabled on every table.
- Anonymous and authenticated Supabase roles have table privileges revoked.
- Server routes use `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS.
- The browser-side Supabase helpers exist but are unused by the current application.
- There is no general user authentication system; only the shared analytics admin credential.

Rate limiting and geo caching are **per serverless instance**, not globally distributed.

> **Operational warning:** `database_setup.sql` drops and recreates all four tables. It is a reset script, not a non-destructive migration. Never run it against data that must be preserved.

---

## 12. HTTP API summary

| Endpoint | Methods | Access | Purpose |
| --- | --- | --- | --- |
| `/api/mainpages/career/[company]/[lang]` | GET | Public | Load localized career JSON |
| `/api/mainpages/projects/[slug]` | GET | Public | Load localized project JSON |
| `/api/mainpages/future/[lang]` | GET | Public | Load localized roadmap JSON |
| `/api/analytics/track` | POST | Public, same-origin browser, rate-limited | Upsert session and insert telemetry |
| `/api/leads` | POST | Public, same-origin browser, rate-limited | Create/update a lead and set identity cookie |
| `/api/leads` | GET | Admin | List collected leads |
| `/api/analytics/auth` | GET, POST, DELETE | Public login/status/logout | Check auth, mint token, clear cookie |
| `/api/analytics/data` | GET, DELETE | Admin | Read or clear analytics |
| `/api/analytics/backup` | GET | Admin | Download analytics and lead JSON |

---

## 13. Configuration and local execution

Required server configuration:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANALYTICS_PASSWORD`

Public profile links:

- `NEXT_PUBLIC_EMAIL`
- `NEXT_PUBLIC_GITHUB`
- `NEXT_PUBLIC_LINKEDIN`

`SUPABASE_PUBLISHABLE_KEY` supports the currently unused Supabase browser/server helper clients; active analytics persistence requires the service-role key.

```bash
npm install
cp .env.example .env.local
# Fill in environment values and provision Supabase separately.
npm run dev
```

Available checks:

```bash
npm run lint
npm run build
npm run start
```

There is currently no automated test script or checked-in application test suite.

---

## 14. Deployment model

The application targets Vercel:

1. Provision the Supabase tables without running the reset script against valuable existing data.
2. Configure environment variables in the Vercel project.
3. Build with `npm run build` and deploy the Next.js application.
4. Verify CDN geo headers and same-origin behavior in production.
5. Exercise telemetry, lead capture, login, backup, and logout against the deployed environment.

The service-role key and admin password are server secrets and must never use a `NEXT_PUBLIC_` prefix or appear in client code/documentation.

---

## 15. Current-state observations

1. **This is a content-driven portfolio plus a custom analytics backend**, not an AI application.
2. **Most application behavior is client-side**, including localization, animations, filtering, aggregation, and detail-page fetching.
3. **Portfolio content is static JSON/TypeScript**, while only analytics and leads use Supabase.
4. **All active database access goes through Next.js server routes** using the service-role key.
5. **The codebase contains dormant or experimental pieces**: A* pathfinding, Supabase browser helpers, chat UI, transition variants, and playground components.
6. **Telemetry currently creates multiple pageview rows per navigation**, so dashboard pageview totals and averages need a defined aggregation/idempotency model.
7. **Persistence helpers commonly log and swallow errors**, allowing routes to report success even when nothing was saved.
8. **The admin token is duplicated into Web Storage**, despite also being available in an HTTP-only cookie; backup URLs can expose it through query strings.
9. **The Canvas effect registers anonymous DOM listeners without complete cleanup**, and tooltip state is synchronized on every animation frame.
10. **Locale coverage and automated verification are incomplete.**

The prioritized remediation sequence is in the [next update implementation plan](../IMPLEMENTATION_PLAN.md).
