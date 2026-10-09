# ADR-005: Framer Motion Route Transition Engine

> Status: Accepted · Date: 2026-02 · Related: [Feature Catalog](../../02-features/feature-catalog.md)

## Context

Route navigation should feel like a designed product moment, not a browser page swap. The site
shell (Topbar, Footbar) persists across pages, so transitions must cover the content area with
full-screen animated overlays while the new page mounts underneath.

## Decision

Build a small **custom transition engine** on Framer Motion:

- `PageTransitionProvider` / `RouteTransitionController` orchestrate transitions on navigation.
- `NavLink` triggers named transition variants: **BubbleTransition, StripWipe, GridWipe,
  DiagonalSlash, EnergyOverlay / EnergyCanvas**.
- `AnimationTester` (mounted in the root layout) exists as a sandbox for previewing variants.
- Loaders (`LoadingRing`, `RingLoader`, `LoadingSkeleton`) plus per-route `loading.tsx` files
  (e.g. career detail) cover the content-fetching phase.

## Consequences

**Positive**
- Consistent, brand-defining motion system; variants are pluggable components.
- Works with the persistent shell: overlay plays while Next.js streams the next route.

**Negative / Risks**
- `prefers-reduced-motion` handling should be verified per variant (roadmap: global respect).
- Housekeeping debt: `DiagonalSlash copy.tsx` and `CareerMapCanvas copy.tsx` are stale duplicates
  (roadmap cleanup), and `AnimationTester` in production layout should be dev-gated.

## Alternatives considered

- **Next.js View Transitions API** — promising, but limited browser support at time of writing.
- **No transitions** — rejected: core to the product feel of the portfolio.
- **Full animation library (GSAP/Rive)** — rejected: framer-motion is already in the stack and
  integrates natively with React 19.
