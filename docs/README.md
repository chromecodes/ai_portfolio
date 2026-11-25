# AI Portfolio Documentation

This documentation describes the **current implementation**, not an aspirational design. It was rebuilt from the application source, API routes, content repositories, and database setup after the previous documentation set was removed.

## Start here

| Document | Purpose |
| --- | --- |
| [Codebase breakdown](00-overview/codebase-breakdown.md) | Stack, routes, rendering model, state, content flow, analytics, leads, authentication, and database design |
| [Next update implementation plan](IMPLEMENTATION_PLAN.md) | Prioritized tasks, file targets, dependencies, acceptance criteria, and release gates |

Recommended reading order:

1. Read the **Executive summary** and **High-level architecture** in the codebase breakdown.
2. Trace the content, telemetry, lead, and dashboard dataflows.
3. Use the implementation plan to understand what should change next and what is intentionally deferred.

## Current system in one paragraph

The project is a Next.js 16 and React 19 portfolio whose public content is stored in local TypeScript/JSON files. Most experiences are client-rendered and localized with Zustand. A separate custom telemetry pipeline sends browser events through Next.js API routes into Supabase PostgreSQL. Leads use the same server-side persistence layer, while a shared-password/HMAC-token flow protects the analytics dashboard. There is no active LLM or chat backend.

## Source-of-truth rules

When documentation and implementation disagree:

1. The current source code is authoritative for existing behavior.
2. `database_setup.sql` is authoritative for the intended database schema and RLS setup.
3. `.env.example` documents required configuration; real `.env*` files must never be copied into documentation.
4. The implementation plan describes proposed behavior and must not be presented as already shipped.
5. Update the relevant document in the same change that alters routes, payload contracts, tables, authentication, or deployment requirements.

## Important boundaries

- **Portfolio content:** local files under `src/data`, not Supabase.
- **Analytics and leads:** Supabase, accessed only by server code using the service-role key.
- **Public APIs:** telemetry ingestion and lead submission are intentionally anonymous but validated and rate-limited.
- **Admin APIs:** analytics reads/deletion, backups, and lead listing require a valid signed token.
- **Experimental code:** the repository contains unused A*, chat, Supabase browser, and animation code; presence in the tree does not mean it is active.

## Verification commands

```bash
npm run lint
npm run build
```

The repository currently has no automated test suite. Adding and running regression tests is part of the next update plan.
