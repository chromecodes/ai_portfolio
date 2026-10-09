# ADR-001: Supabase as the Backend

> Status: Accepted · Date: 2026-02 · Related: [ADR-002](adr-002-client-side-telemetry-ingestion.md)

## Context

The portfolio needs a persistence layer for telemetry (sessions, pageviews, events) and lead
capture, with zero budget for server operations. Data is written by anonymous visitors and read
only by the site owner via a protected dashboard.

## Decision

Use **Supabase** (managed PostgreSQL + REST auto-API) as the single backend. All DB access goes
through `@supabase/supabase-js` / `@supabase/ssr`; the schema lives in `database_setup.sql`.

## Consequences

**Positive**
- No API servers to maintain; free tier covers portfolio-scale traffic.
- PostgreSQL guarantees (UNIQUE on `lead_submissions.email`, FK cascades, JSONB metadata).
- Row Level Security gives a real defense-in-depth layer even though writes are server-mediated.
- Auto-generated REST API available if direct client ingestion is ever enabled.

**Negative / Risks**
- Vendor coupling; project ID / URL baked into environment config.
- Free-tier pausing on inactivity — mitigate by keeping a periodic write (telemetry does this).
- Service-role key becomes a high-value secret (must never reach the client bundle).

## Alternatives considered

- **Vercel KV / Upstash** — rejected: no relational integrity or rich queries for analytics.
- **Serverless SQL (Neon/PlanetScale)** — rejected: would require hand-writing the entire ingestion API.
- **Google Analytics** — rejected: no control over data, no lead personalization, cookie-banner overhead.
