# Next Update Implementation Plan

> Status: **Proposed — not yet implemented**
>
> Context: [Current codebase breakdown](00-overview/codebase-breakdown.md)

## 1. Update objective

Make the existing portfolio and analytics platform **correct, secure, maintainable, and verifiable** before adding new features.

The next update should not change the public visual design or introduce an AI assistant. It should produce a reliable maintenance release with:

- One durable pageview record per route visit, updated with final engagement metrics.
- Accurate success/error responses from Supabase-backed endpoints.
- Browser admin authentication based on the HTTP-only cookie rather than Web Storage tokens.
- Complete Canvas listener cleanup and lower avoidable rendering work.
- Regression tests for critical analytics, lead, auth, and content behavior.
- Documentation that matches the shipped implementation.

## 2. Non-goals for this update

The following are intentionally excluded to keep the release reviewable:

- Building or enabling an LLM/chat assistant.
- Replacing the visual design or animation system.
- Migrating portfolio content to a CMS or Supabase.
- Converting every page to Server Components.
- Introducing a general visitor account system.
- Rewriting the career visualization around the dormant A* modules.
- Adding a third-party analytics platform.
- Running `database_setup.sql` against production or any database containing valuable data.

## 3. Priority summary

| Priority | Workstream | Outcome |
| --- | --- | --- |
| P0 | Baseline and safety | Reproducible starting point and no destructive database work |
| P0 | Telemetry correctness | Idempotent pageviews and trustworthy engagement metrics |
| P0 | Persistence integrity | No false success when lead/analytics writes fail |
| P0 | Admin security | No unnecessary browser token exposure; protected mutations |
| P1 | Runtime cleanup | Correct listener lifecycle and fewer render-loop updates |
| P1 | Automated verification | Unit, route, and browser regression coverage |
| P1 | Documentation/release | README and docs match the release; CI gates changes |
| Deferred | Localization, SSR, distributed infrastructure | Separate scoped updates after this release |

## 4. Implementation sequence

### Phase 0 — Baseline and change safety

#### TASK-001: Establish a verified baseline

**Files:** `package.json`, `README.md`, `docs/**`

- Record the current `npm run lint` and `npm run build` results before changing behavior.
- Inventory current uncommitted work so documentation changes are not mixed accidentally with unrelated feature edits.
- Confirm required environment variable names without printing or committing their values.
- Identify a safe local/test Supabase project for integration verification.
- Do not use the destructive reset SQL as a migration mechanism.

**Acceptance criteria**

- Baseline successes and failures are known.
- Test credentials/data are isolated from production.
- The update has a clean, reviewable scope.

#### TASK-002: Add analytics domain types before changing contracts

**Files:** new `src/types/analytics.ts`, `src/lib/analyticsDb.ts`, `src/features/Analytics/AnalyticsDashboard.tsx`, analytics routes

- Move `VisitorSession`, `PageviewEvent`, `InteractionEvent`, and `LeadSubmission` into a dependency-free types module.
- Update server and client imports, using `import type` in client components.
- Add request/response types for pageview lifecycle and persistence results introduced below.

**Acceptance criteria**

- Client components do not import runtime code from `analyticsDb.ts` merely to obtain types.
- Existing TypeScript data shapes remain available to all current consumers.

---

### Phase 1 — Telemetry correctness

#### TASK-010: Make pageview ingestion idempotent

**Files:** `src/components/AnalyticsTracker.tsx`, `src/app/api/analytics/track/route.ts`, `src/lib/analyticsDb.ts`, `src/types/analytics.ts`

Current behavior inserts one row on entry and additional rows on route change/unload. Replace that with an explicit pageview lifecycle:

1. Generate a stable `pageviewId` whenever a route visit begins.
2. Send that ID with the initial entry payload and every final flush for the same visit.
3. Persist entry metadata and final stay/scroll values against the same database row.
4. Make repeated exit delivery harmless; `pagehide`, route change, or retries must not create duplicates.
5. Preserve initial title/referrer/path when final metrics are applied.
6. Generate a new ID only for a new route visit, not for every telemetry call.

A schema change should not be necessary because `analytics_pageviews.id` is already a text primary key. Prefer using that key for idempotent writes rather than adding another uniqueness mechanism.

**Acceptance criteria**

- One route visit produces exactly one pageview row, even when an exit signal is delivered twice.
- Entry and final flush refer to the same `pageviewId`.
- Final records contain non-decreasing stay duration and maximum scroll depth.
- Reopening the same route later creates a distinct pageview ID.
- Existing event and session foreign keys remain valid.

#### TASK-011: Correct client telemetry lifecycle and payload consistency

**Files:** `src/components/AnalyticsTracker.tsx`, `src/features/Topbar/ToolBar.tsx`, `src/components/LeadWelcomeToast.tsx`

- Keep route timing, scroll maximum, selection deduplication, and pageview ID in clearly scoped refs.
- Prefer `pagehide` for final delivery and retain `sendBeacon`/`keepalive` behavior suitable for unload.
- Avoid registering overlapping exit handlers that flush the same visit independently.
- Use `path` consistently for language-change and toast events; do not rely on a `routePath` field the API does not read.
- Ensure toast events carry the current route rather than defaulting to `/`.
- Use `crypto.randomUUID()` where supported for new browser session/pageview identifiers; retain the API’s allowed format.
- Keep telemetry fire-and-forget from blocking navigation.

**Acceptance criteria**

- Language-change records contain the route on which the switch occurred.
- Toast step/drop-off records contain a valid session ID and current path.
- Route changes reset only route-specific measurements, not the analytics session.
- Final flush does not prevent or delay navigation.

#### TASK-012: Make dashboard aggregation match the corrected model

**Files:** `src/features/Analytics/AnalyticsDashboard.tsx`

- Treat one pageview row as one route visit after TASK-010.
- Keep average scroll depth based on finalized/current pageview values.
- Verify top-route counts, session view counts, and route timelines against the new records.
- Display a clear empty/loading/error state without interpreting missing data as zero traffic.
- Document that API result limits cap the dashboard snapshot at 100 sessions, 300 pageviews, and 500 events.

**Acceptance criteria**

- Dashboard pageview totals no longer count entry and exit as separate visits.
- Session inspector shows one logical timeline entry per route visit.
- Snapshot limits are visible to the administrator rather than implied to be complete history.

---

### Phase 2 — Persistence and admin security

#### TASK-020: Return truthful persistence outcomes

**Files:** `src/lib/analyticsDb.ts`, all analytics routes, `src/app/api/leads/route.ts`

- Change database helpers to return explicit success/failure results or throw typed errors instead of logging and returning `void`.
- Do not return `{ success: true }` after a failed lead upsert, analytics clear, or required session/pageview write.
- Return a safe service-unavailable/server-error response when persistence is not configured or fails.
- Keep raw Supabase errors in server logs only; never expose SQL, keys, IP data, or internal details to anonymous callers.
- Preserve partial-query diagnostics for the admin dashboard, but distinguish an empty dataset from a failed query.

**Acceptance criteria**

- Missing Supabase credentials cannot produce a successful lead submission response.
- A forced Supabase write failure results in a non-success HTTP response.
- Clear Logs reports failure if deletion fails.
- Anonymous error responses remain generic and server logs retain actionable details.

#### TASK-021: Use the HTTP-only admin cookie as the browser source of truth

**Files:** `src/features/Analytics/AnalyticsDashboard.tsx`, `src/app/api/analytics/auth/route.ts`, `src/lib/analyticsAuth.ts`, `src/app/api/analytics/backup/route.ts`

- Keep the seven-day HMAC token in the `analytics_auth` HTTP-only cookie.
- Stop writing the token to localStorage and sessionStorage.
- Remove the token from the login JSON response for browser login if no other consumer requires it.
- Continue supporting header/Bearer tokens only if needed for deliberate server/CLI access.
- Remove query-string token authentication and download backups through the authenticated same-origin cookie flow.
- Remove legacy stored tokens during logout/auth initialization.
- Remove the stale `admin123` UI hint; state that access is configured by the site administrator.

**Acceptance criteria**

- Login, refresh, dashboard polling, backup, and logout work without Web Storage tokens.
- Browser storage contains no `portfolio_analytics_token` after login or migration cleanup.
- Backup URLs contain no credential.
- Missing/invalid/expired cookies produce a locked dashboard and HTTP 401 from protected APIs.
- Missing `ANALYTICS_PASSWORD` continues to fail closed.

#### TASK-022: Apply same-origin checks to state-changing admin operations

**Files:** `src/lib/apiSecurity.ts`, auth/data routes, related tests

- Apply the existing origin check to admin login and analytics deletion, and any future state-changing admin endpoint.
- Retain explicit `verifyAuth` checks; origin validation is CSRF defense, not a replacement for authentication.
- Keep production cookies `secure`, `httpOnly`, `sameSite=lax`, and path-scoped.

**Acceptance criteria**

- Cross-origin browser POST/DELETE requests receive 403 before database work.
- Valid same-origin authenticated operations continue to work.
- Unauthenticated same-origin requests still receive 401.

---

### Phase 3 — Runtime and code hygiene

#### TASK-030: Fix career Canvas lifecycle and rendering pressure

**Files:** `src/features/Career/Graph/CareerMapCanvas.tsx`, optionally a small extracted Canvas helper module

- Convert anonymous mousemove/click registrations into named handlers and remove them during effect cleanup.
- Cancel both animation-frame loops on unmount and when dependencies recreate the effect.
- Avoid calling React `setTooltip` with a new object on every animation frame; update only when hover/position meaningfully changes or position the overlay without React renders.
- Pause animation while the document is hidden and when the Canvas is offscreen where practical.
- Respect reduced-motion preferences for continuous particle motion.
- Recreate language/theme-dependent resources without accumulating listeners or images.

**Acceptance criteria**

- Repeated language/theme switches do not multiply mouse/click handlers.
- Navigating away leaves no animation frame or DOM listener running.
- Hover/click still works after resize, theme change, and language change.
- Tooltip updates do not force a React render at 60 FPS while idle.
- Reduced-motion users receive a static or substantially reduced-motion map.

#### TASK-031: Remove accidental production/debug behavior

**Files:** `src/components/ImageViewer/ImageViewer.tsx`, `src/components/ImageViewer/ImageSlide.tsx`, `src/features/Career/page/OrginPage.tsx`, `src/app/layout.tsx`, `src/components/animation/AnimationTester.tsx`

- Remove media/career `console.log` calls.
- Remove the globally mounted `AnimationTester`, or gate it behind an explicit development-only flag.
- Keep `/playground` and experimental transitions out of the production navigation unless intentionally supported.
- Leave `Agentbar` disabled; do not describe it as a working AI integration.

**Acceptance criteria**

- Normal browsing emits no component debug spam.
- No test overlay runs on initial production page load.
- Experimental behavior is opt-in and clearly identified.

#### TASK-032: Centralize content registry behavior without changing rendering

**Files:** `src/lib/career/repository.ts`, `src/lib/projects/repository.ts`, `src/lib/future/repository.ts`, `src/data/projectsData.ts`

- Keep the existing API/client-rendering model for this release.
- Consolidate supported-language and slug fallback rules so they are easy to test.
- Return consistent not-found behavior for unknown company/project slugs.
- Preserve safe path-segment validation and English fallback.
- Do not silently add partial translations; record missing locale content as a separate content task.

**Acceptance criteria**

- Existing valid URLs return the same content.
- Unknown slugs return 404 without filesystem details.
- Unsupported/missing translations consistently fall back to English.

---

### Phase 4 — Regression tests and delivery

#### TASK-040: Add fast unit and route tests

**Files:** new `tests/**`, test configuration, `package.json`

Use **Vitest** for domain/route-level tests and React Testing Library only where component behavior needs a DOM.

Minimum coverage:

- `leadSources`: URL aliases, referrer aliases, stored source, custom source, organic fallback.
- Repositories: valid content, fallback language, invalid segments, unknown slugs.
- Auth: password failure/success, token expiry/tampering, fail-closed configuration.
- API security: origin allow/deny and rate-limit boundary.
- Track route: invalid session, pageview entry/update idempotency, event mapping, sanitized values, rate limit, persistence failure.
- Leads route: validation, new/existing lead behavior, no false success on persistence failure, admin-only GET.
- Analytics data/backup: 401 for anonymous callers and authorized response contracts.
- Tracker lifecycle: stable pageview ID, route-change flush, language/toast path consistency.

Mock Supabase and external geolocation in unit/route tests. Do not call production services.

**Acceptance criteria**

- `npm test` runs locally without real Supabase credentials or network access.
- Critical success, validation, auth, and failure branches are covered.
- Tests prove duplicate exit delivery does not duplicate pageviews.

#### TASK-041: Add browser smoke coverage

**Files:** new Playwright configuration and `tests/e2e/**`

Cover a small critical path:

1. Welcome page renders and navigates to projects.
2. Project catalog filters and a project detail loads.
3. Language switch updates UI and document direction for Arabic.
4. Career node interaction still navigates after repeated theme/language changes.
5. Analytics login gate rejects invalid credentials.
6. With a test backend, login/dashboard/logout and backup remain cookie-driven.

Use test-specific credentials/data and isolate or mock telemetry where appropriate.

**Acceptance criteria**

- `npm run test:e2e` runs against a local/test deployment.
- Tests contain no production password or service-role key.
- The suite verifies real navigation and cookie behavior, not just component snapshots.

#### TASK-042: Add repeatable quality gates

**Files:** `package.json`, `.github/workflows/ci.yml`

Suggested scripts:

```text
npm run lint
npm test
npm run build
npm run test:e2e   # deployment/CI job with browser dependencies
```

- Run lint, unit tests, and production build on pull requests.
- Run browser smoke tests in a suitable CI/deployment job.
- Do not require production secrets for the basic PR gate.

**Acceptance criteria**

- CI fails on lint, unit-test, or build regression.
- Test commands are documented and reproducible.
- Secrets are provided only to jobs that genuinely require isolated test services.

#### TASK-043: Finalize docs and release verification

**Files:** `README.md`, `docs/**`, `.env.example`

- Update the telemetry contract with `pageviewId` and its lifecycle.
- Update authentication docs to remove Web Storage/query-token behavior.
- Document test commands and safe test-database setup.
- Keep architecture and implementation-plan status accurate after merge.
- Verify no Markdown links point to removed documentation.
- Perform a deployed smoke test without clearing production analytics.

**Acceptance criteria**

- Documentation matches observed deployed behavior.
- No secret value appears in docs, tests, logs, or committed files.
- Production telemetry and leads are not reset during verification.

## 5. Dependency order

```text
TASK-001 baseline
   │
   ├── TASK-002 shared types
   │      │
   │      ├── TASK-010/011/012 pageview lifecycle
   │      └── TASK-020 truthful persistence
   │              │
   │              └── TASK-021/022 admin security
   │
   ├── TASK-030/031 runtime hygiene
   └── TASK-032 repository consistency
              │
              ▼
       TASK-040/041 regression coverage
              │
              ▼
       TASK-042 CI + TASK-043 release/docs
```

Tests should be added alongside each behavior change where practical, not postponed until every task is complete. The dependency graph shows review/deployment order, not a reason to delay regression coverage.

## 6. Release gate

The update is ready only when all of the following are true:

- [ ] One route visit produces one pageview record under normal and duplicate-exit conditions.
- [ ] Database failures return truthful errors and never silently report saved leads.
- [ ] Admin browser flows work with an HTTP-only cookie and no token in Web Storage or URLs.
- [ ] Cross-origin state-changing admin requests are rejected.
- [ ] Career Canvas listeners and animation frames clean up correctly.
- [ ] No production debug overlay or component debug logging remains.
- [ ] Existing content URLs and English fallbacks still work.
- [ ] `npm run lint`, `npm test`, and `npm run build` pass.
- [ ] Browser smoke tests pass in an isolated environment.
- [ ] Documentation and README match the shipped behavior.

## 7. Deferred follow-up roadmap

These items are valuable but should be separately estimated and scoped after the maintenance release.

| Candidate | Reason to defer |
| --- | --- |
| Complete Spanish/Arabic project and career content | Requires content authoring/review, not just code |
| Strongly typed canonical translation schema | Best done with a locale-completeness pass |
| Server-rendered/statically generated detail pages | Useful for SEO/performance, but changes rendering and metadata architecture |
| Distributed rate limiting and geo cache | Requires shared infrastructure such as Upstash/Redis |
| Lead privacy/consent and retention controls | Needs an explicit product/legal decision before changing collection behavior |
| Non-destructive migration tooling | Should use versioned migrations rather than extending the reset SQL |
| Pagination/time-range filtering for full analytics history | Requires API and dashboard query design beyond the current snapshot |
| Real AI assistant | Needs product requirements, backend/provider selection, security, cost limits, and evaluation |
| A* integration or removal | Make a deliberate visualization decision after lifecycle/performance fixes |
