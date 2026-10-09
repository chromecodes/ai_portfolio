# ADR-004: i18n via Zustand Store + JSON Dictionaries (en / es / ar, RTL-aware)

> Status: Accepted · Date: 2026-02 · Related: [i18n Guide](../../07-i18n/i18n-guide.md)

## Context

The portfolio is presented in **English, Spanish, and Arabic** (Arabic requires RTL layout).
Content includes both UI chrome strings and long-form page content (career, projects, future).
Next.js App Router offers locale-routed alternatives (next-intl, next-i18next, `[lang]` segments).

## Decision

Implement i18n with a **Zustand store** (`src/utils/i18n/useLanguageStore.ts`) persisted to
`localStorage` (key: `portfolio_language`), fed from statically imported JSON dictionaries:

- UI strings: `src/utils/i18n/{en,es,ar}.json`
- Page content: `src/data/**/{en,es,ar}.json` served via `/api/mainpages/*` routes
- On language change the store sets `document.documentElement.dir = rtl` for Arabic and
  updates `lang`; `<html dir>` is controlled client-side (`suppressHydrationWarning` on `<html>`).

## Consequences

**Positive**
- Instant, fully client-side switch (no navigation, no re-render of the route tree).
- Static imports bundle all languages — works offline, zero extra requests.
- Type-safe `strings` object derived from `typeof en`.
- RTL handled by flipping `dir` + Tailwind logical utilities.

**Negative / Risks**
- All languages ship in the bundle (acceptable at portfolio scale).
- SEO: no locale-prefixed URLs → crawlers see the default language (roadmap: consider `next-intl` if SEO in all locales becomes a requirement).
- Content files for `es` are partial (career/projects data currently en/ar only; es exists for UI + future page).

## Alternatives considered

- **next-intl with `[lang]` route segments** — rejected for now: URL-driven routing conflicts with the single-page animated shell and adds routing complexity for a portfolio.
- **i18next** — rejected: heavier runtime; JSON typing weaker than static imports.
