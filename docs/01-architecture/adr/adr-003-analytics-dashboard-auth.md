# ADR-003: Analytics Dashboard Password Auth

> Status: Accepted (with caveats) · Date: 2026-02 · Related: [Telemetry Guide](../../06-analytics/telemetry-guide.md)

## Context

The `/analytics` dashboard is a single-admin view over all visitor data. Requirements: minimal
friction for a one-person portfolio, no user-accounts system, works on Vercel without extra
services.

## Decision

A **shared admin password** (`ANALYTICS_PASSWORD` env var) guards the data APIs:

- `POST /api/analytics/auth` verifies the password and sets an `analytics_auth` **HTTP-only
  cookie** (7 days, `secure` in production, `sameSite=lax`).
- Every data route calls `verifyAuth(req)`, accepting (a) `x-analytics-auth` header,
  (b) `Authorization: Bearer <password>`, or (c) the cookie.

## Consequences

**Positive**
- Zero-dependency auth; no auth vendor, no user table, instant revocation by rotating the env var.

**Negative / Risks (documented honestly)**
- ⚠️ **Fallback default:** if the env var is missing, `analyticsAuth.ts` falls back to
  `admin123`. Deployment MUST set `ANALYTICS_PASSWORD` (roadmap: fail-closed instead).
- ⚠️ The cookie value stores the password itself, and the auth route returns it in the JSON body
  (`token`) — acceptable for a single-admin dashboard, not a pattern to copy for multi-user apps.
- No rate limiting / brute-force lockout on `/api/analytics/auth` (roadmap item).

## Alternatives considered

- **Supabase Auth** — rejected for now: adds an auth UI + user management for a single admin.
- **Vercel password protection** — rejected: platform-locked, can't protect API routes granularly.
- **Basic auth middleware** — rejected: worse UX, no clean logout, same security class.
