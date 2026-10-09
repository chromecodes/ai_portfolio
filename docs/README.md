# Documentation Index — AI Portfolio

> Last Updated: 2026-02-19 · Owner: hameed

Single source of truth for everything about this project. Docs live in-repo so they
version-control alongside code.

## Start here

| Doc | What it covers |
| :--- | :--- |
| [Project Overview](00-overview/project-overview.md) | What this app is, key features, tech stack |
| [System Architecture](01-architecture/system-architecture.md) | Component map, data flow, request lifecycle, diagrams |
| [Feature Catalog](02-features/feature-catalog.md) | Every page, feature module, and shared component |
| [Database Schema](03-database/database-schema.md) | Tables, columns, relationships, RLS policies, setup SQL |

## Reference

| Doc | What it covers |
| :--- | :--- |
| [API Reference](04-api/api-reference.md) | All `/api` routes: methods, auth, contracts |
| [Local Setup](05-setup/local-setup.md) | Clone → install → configure → run |
| [Environment Variables](05-setup/environment-variables.md) | Every env var: scope, consumer, required |
| [Telemetry Guide](06-analytics/telemetry-guide.md) | How visitor tracking, sessions, events & leads work |
| [i18n Guide](07-i18n/i18n-guide.md) | Languages (en/es/ar), RTL, adding new languages |
| [Deployment](08-operations/deployment.md) | Vercel deployment, DB provisioning, rollback |
| [Roadmap](09-roadmap/roadmap.md) | Planned work + known tech-debt cleanup items |
| [CHANGELOG](09-roadmap/CHANGELOG.md) | Notable changes per release |

## Decisions & design

- [ADR-001 — Supabase as backend](01-architecture/adr/adr-001-supabase-as-backend.md)
- [ADR-002 — Client-side telemetry ingestion with RLS](01-architecture/adr/adr-002-client-side-telemetry-ingestion.md)
- [ADR-003 — Analytics dashboard password auth](01-architecture/adr/adr-003-analytics-dashboard-auth.md)
- [ADR-004 — i18n via Zustand + JSON dictionaries](01-architecture/adr/adr-004-i18n-zustand-json.md)
- [ADR-005 — Framer Motion route transitions](01-architecture/adr/adr-005-framer-motion-transitions.md)

## Wireframes

- [Career Detail Page](wireframes/career-detail-page.md) — ASCII mockup of the technical deep-dive view

## Conventions

- Each doc header carries `Last Updated` + owner — keep them current when you edit.
- Diagrams are Mermaid (text) so they diff cleanly.
- Link between docs instead of duplicating content.
