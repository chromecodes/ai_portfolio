# Changelog

All notable changes to the AI Portfolio. Format based on [Keep a Changelog](https://keepachangelog.com/);
dates follow the repo's commit history.

> Last Updated: 2026-02-19 · Owner: hameed

---

## [Unreleased] — Documentation overhaul (2026-02-19)

- Added complete `docs/` tree: architecture + 5 ADRs, feature catalog, DB schema, API reference,
  setup & env guides, telemetry guide, i18n guide, deployment guide, roadmap & changelog.
- Rewrote root `README.md` (was create-next-app boilerplate).
- Filled `.env.example` with the full required-variable template.

## [2026-09-14] — Robustness hardening

- **Fixed:** Supabase env values sanitized (trim + quote stripping) at every entry point.
- **Added:** graceful null-client behavior with loud console diagnostics when credentials are missing.
- **Changed:** all API routes forced `dynamic = 'force-dynamic'`; dynamic Supabase client initialization.
- **Improved:** analytics authentication robustness and database error handling.

## [2026-07-27] — Database schema & telemetry refinement

- **Added:** `database_setup.sql` — 4 tables (sessions, pageviews, events, leads) with RLS policies.
- **Changed:** telemetry tracking refined with keepalive fetch (survives tab close).
- **Added:** floating resume download button (i18n-aware) on the home page.
- **Improved:** lead welcome toast localized; session ID integrated into lead flow; analytics backup export.

## [2026-07-26] — Analytics & lead system

- **Added:** end-to-end analytics tracking — visitor sessions, lead-source detection, dashboard visualization.
- **Added:** comprehensive visitor lead tracking, outbound-link monitoring, session-based welcome notifications.
- **Chore:** `legacy-peer-deps` enabled via `.npmrc`.

## [2026-07-24 – 07-25] — Projects & mobile

- **Added:** responsive mobile navigation; hydration-safety attributes on the document root.
- **Changed:** case-study data modularized; UI content localized across portfolio components.
- **Added:** ProStack360 project assets; contact links moved to environment variables; EasyForms metadata.
- **Fixed:** `nofollow` on external links; background-tab utility extracted.

## [2026-07-21 – 07-23] — i18n, projects & career architecture

- **Added:** multi-language support (en/es/ar + RTL), Future page, navigation components, project content sections.
- **Added:** dynamic project detail pages, case-study architecture, project hub data management.
- **Changed:** CareerUI refactored for i18n with design tokens; OrginPage modernized; about page redesigned.
- **Added:** video support + blur placeholders in ImageViewer; new Future page.

## [2026-07-18 – 07-19] — Design system pass

- **Changed:** standardized theme design tokens; semantic color variables replaced across components.

## [2026-07-09 – 07-18] — Foundation

- **Added:** Next.js 16 App Router scaffold, Topbar/Chatbar shell, career page modularization,
  ImageViewer with swipe/dot-navigation, initial project content (ProStack360 overview).
