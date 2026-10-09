# i18n Guide — English · Español · العربية

How the three-language (RTL-aware) system works, and how to extend it.

> Last Updated: 2026-02-19 · Owner: hameed · Code: `src/utils/i18n/useLanguageStore.ts` · Related: [ADR-004](../01-architecture/adr/adr-004-i18n-zustand-json.md)

---

## 1. Architecture

- **Store:** `useLanguageStore` (Zustand + `persist`) holds `{ language, strings, setLanguage }`.
- **Persistence:** `localStorage` key `portfolio_language`; rehydration applies RTL on boot.
- **Dictionaries:** statically imported JSON — UI strings in `src/utils/i18n/{en,es,ar}.json`;
  type-checked via `TranslationStrings = typeof en | typeof es | typeof ar`.
- **Direction:** `updateDocumentDir()` sets `document.documentElement.dir = 'rtl'` for Arabic
  (`ltr` otherwise) and updates `lang`. The root `<html dir="ltr">` carries
  `suppressHydrationWarning`.

## 2. Usage

```tsx
'use client';
import { useLanguageStore } from '@/utils/i18n/useLanguageStore';

const { strings, language, setLanguage } = useLanguageStore();
// strings.projectsTitle etc.
<button onClick={() => setLanguage('ar')}>العربية</button>
```

Language switching is instant and client-side — no navigation, no reload.

## 3. Content files (page data)

Long-form content is NOT in the i18n JSONs. It lives per-language under `src/data/` and is served
by content APIs:

| Content | Path | API |
| :--- | :--- | :--- |
| Career company pages | `src/data/career/<company>/{en,ar}.json` | `GET /api/mainpages/career/[company]/[lang]` |
| Career map data | `src/data/career/careergraph/{en,ar}.json` | via career repository |
| Future page | `src/data/future/{en,es,ar}.json` | `GET /api/mainpages/future/[lang]` |
| Project pages | `src/data/projects/<slug>/{en,ar}.json` | `GET /api/mainpages/projects/[slug]?lang=` |

**Coverage status:** UI strings + future page exist in all three languages; career/projects
content currently ships `en` + `ar` only — `es` falls back to English silently.

## 4. How to add a new UI string

1. Add the key to **all three** dictionaries (`en.json`, `es.json`, `ar.json`).
2. TypeScript will flag missing keys (strings are typed off `en.json`).
3. Consume via `strings.yourKey` — optional chain fallbacks are used in some components
   (`strings.toastMissingName || 'Default'`); prefer adding proper translations instead.

## 5. How to add a language (e.g. `fr`)

1. Create `src/utils/i18n/fr.json` (copy the full key set from `en.json`).
2. In `useLanguageStore.ts`: extend `Lang` type (`'en' | 'es' | 'ar' | 'fr'`), add
   `fr` to the `translations` map and `Lang` union everywhere it's referenced.
3. Check RTL logic: only `ar` flips direction — add `fr` to the LTR side (no change needed).
4. Add content JSONs where needed (`src/data/future/fr.json`, etc.).
5. Add a language option to the Topbar/ToolBar selector.
6. Test persistence (switch → reload → still `fr`) and `document.dir`.

## 6. RTL notes

- Direction is flipped globally via `<html dir>`; Tailwind logical properties handle spacing.
- Canvas components (career map, transitions) are **direction-agnostic** — verify new
  canvas features manually in RTL.
- Fonts: only `Inter` (latin) is loaded via `next/font`; Arabic renders with system fallback
  (roadmap: add an Arabic-optimized font).
