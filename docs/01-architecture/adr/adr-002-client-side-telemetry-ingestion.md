# ADR-002: Server-Mediated Telemetry Ingestion (with RLS Insert Policies in Reserve)

> Status: Accepted · Date: 2026-02 · Related: [ADR-001](adr-001-supabase-as-backend.md)

## Context

Telemetry (sessions, pageviews, interaction events, leads) must be written from the browser.
Two viable designs:

1. **Direct client ingestion** — browser uses the publishable (anon) key and Supabase REST, with RLS policies allowing `INSERT` but blocking `SELECT`.
2. **Server-mediated ingestion** — browser `fetch`es own API routes; the server writes via the service-role key.

The RLS policies in `database_setup.sql` (anon INSERT + UPDATE allowed, SELECT denied) were
originally provisioned for design 1.

## Decision

Ingest through **own API routes** (`/api/analytics/track`, `/api/leads`) using `keepalive` fetch.
The RLS anon-insert policies are **retained** as a fallback/future path, but the browser Supabase
client (`src/utils/supabase/client.ts`) is currently not used for ingestion.

## Consequences

**Positive**
- UA parsing, geo resolution (CDN headers → ip-api fallback), validation and batching happen server-side — one source of truth, no secret-shaped logic in the client bundle.
- `sendBeacon`-style `keepalive` fetch survives tab close for the final pageview flush.
- Server can sanitize/normalize before writing; schema evolution is centralized.

**Negative / Risks**
- Extra serverless-function hop per batch; cold-start latency on Vercel.
- Service-role key required at runtime (mitigated: server-only, `force-dynamic`, null-client guard with loud console error).
- RLS policies and API paths must be kept in sync if the direct mode is ever enabled.

## Alternatives considered

- **Pure client ingestion (RLS-only)** — rejected as primary: no geo/UA enrichment, and writes tied to publishable-key policies.
- **Third-party analytics (GA4, Plausible)** — rejected: loss of data ownership and lead personalization.
