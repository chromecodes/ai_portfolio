# Feature & Component Catalog

Inventory of every route, feature module, shared component, store, and content data file in the app.

> Last Updated: 2026-10-04 · Owner: hameed · Related: [System Architecture](../01-architecture/system-architecture.md)

---

## 1. Pages & Routes

| Route | File (`src/app/`) | Description |
| :--- | :--- | :--- |
| `/` | `page.tsx` + `features/Welcome/WelcomeUI.tsx` | Welcome page — hero tour CTAs, quick stats, destination cards (→ career/projects/about/future), featured projects |
| `/home` | `(client)/(mainpages)/home/page.tsx` | Landing page — hero, pulse background, floating resume button |
| `/about` | `(client)/(mainpages)/about/page.tsx` | Personal introduction |
| `/career` | `(client)/(mainpages)/career/page.tsx` | Career map — interactive canvas graph of companies |
| `/career/[...path]` | `career/[...path]/page.tsx` (+ `loading.tsx`) | Company detail page (e.g. `/career/cognizant`) — deep-dive case study |
| `/projects` | `(client)/(mainpages)/projects/page.tsx` | Project hub — tiles grid |
| `/projects/[slug]` | `projects/[slug]/page.tsx` | Project / case-study detail (e.g. easyform, localllmmemory) |
| `/future` | `(client)/(mainpages)/future/page.tsx` | Roadmap & goals page |
| `/analytics` | `(client)/(mainpages)/analytics/page.tsx` | Analytics dashboard (password gated data APIs) |
| `/playground` | `(client)/(mainpages)/playground/page.tsx` | Component sandbox — ImageViewer demo |

API routes are documented separately in the [API Reference](../04-api/api-reference.md).

## 2. Feature Modules (`src/features/`)

| Module | Key files | What it does |
| :--- | :--- | :--- |
| **Career** | `page/` (CareerUI, HeroSection, FeaturesTile, ProjectLinks, OrginPage, PlaceholderTerminal, CareerFooter) | Company detail pages: hero, product context, tech stack, deliverables |
| **Career/Graph** | `CareerMapCanvas.tsx`, `CareerTooltip.tsx`, `data/careerData.ts` | Canvas-rendered career map with hover tooltips |
| **Career/Graph/pathfinding** | `AStarEngine.tsx`, `AStar.ts`, `PathEngine.ts`, `HeuristicEngine.ts`, `MinHeap.ts` | In-house A\* pathfinding (heap + heuristics) to route between company nodes |
| **Projects** | `ProjectTile*` (Header/Content/Footer/IntroTile), `page/` (ProjectHeroSection, CaseStudyDetailUI, ProjectTerminalUI, StickyProjectLinks, NavBackSection, ProjectFooter) | Project tiles and detail/case-study layouts |
| **Future** | `FutureUI.tsx` | Roadmap tiles & timeline |
| **Topbar** | `Topbar.tsx`, `Navbar.tsx`, `ToolBar.tsx`, `LogoViewer.tsx` | Persistent top navigation, theme & language controls |
| **Chatbar** | `Agentbar.tsx`, `Leftwing.tsx`, `Rightwing.tsx`, `Footbar.tsx` | Bottom floating bar: contact actions, social links, agent-style prompt UI |
| **Analytics** | `AnalyticsDashboard.tsx` | Dashboard UI: session/event/lead tables and stats (auth flow via `/api/analytics/auth`) |
| **Home** | `PulseBackground.tsx`, `FloatingResumeButton.tsx` | Animated background + resume download CTA |
| **Welcome** | `WelcomeUI.tsx` | Landing page at `/`: guided tour with destination cards to every detail page, data-driven stats, featured projects |
| **Loaders** | `LoadingRing.tsx`, `RingLoader.tsx`, `LoadingSkeleton.tsx` | Reusable loading states |

## 3. Global Components (`src/components/`)

| Component | Purpose |
| :--- | :--- |
| `AnalyticsTracker.tsx` | Client telemetry engine: sessions, pageviews (stay duration, scroll depth), selection/click events; keepalive fetch to `/api/analytics/track` |
| `LeadWelcomeToast.tsx` | Returns personalized toast for known leads 15 s after load; enriches session with visitor name/email |
| `ThemeInitializer.tsx` | Applies persisted theme on mount (prevents FOUC) |
| `MainBg.tsx` | Global background layer (currently commented out in layout) |
| `ImageViewer/` | Media gallery: slides, dot navigation, arrows, captions + hooks (`useImageLoader`, `useInView`, `useViewer`, `useSwipe`) |
| `animation/` | Transition engine: `PageTransitionProvider`, `RouteTransitionController`, `NavLink`, `AnimationTester` + variants `BubbleTransition`, `StripWipe`, `GridWipe`, `DiagonalSlash`, `EnergyOverlay`, `EnergyCanvas` |
| `ui/` | Radix-based primitives (button, dialog, input, label, select, switch) in shadcn style |
| `UI/tags/` | `Tags`, `TagsCapsule` — tech-stack tag pills |
| `UI/QuotationBox.tsx` | Styled quote block |
| `SCSS/` | `global.scss`, `agentbar.scss` — global styles |

## 4. State Stores (`src/lib`, `src/utils/i18n`)

| Store | File | Persisted | Purpose |
| :--- | :--- | :--- | :--- |
| `useThemeStore` | `src/lib/useThemeStore.ts` | `localStorage: theme` | Light/dark toggle → `dark` class on `<html>` |
| `useLanguageStore` | `src/utils/i18n/useLanguageStore.ts` | `localStorage: portfolio_language` | Language + `strings` + `dir=rtl` for Arabic |
| `useCursor` | `src/lib/useCursor.ts` | — | Custom cursor tracking |
| `useLeadSource` | `src/lib/leadSources.ts` | — | Attribution of lead sources (UTM/referrer) |

## 5. Content Data (`src/data/`)

| Path | Languages | Consumer |
| :--- | :--- | :--- |
| `career/origin/` | en, ar | Origin story page |
| `career/careergraph/` | en, ar | Career map nodes/edges |
| `career/prostack360/`, `career/cognizant/` | en, ar | Company detail pages |
| `projects/pojecthub/` | en, ar | Project hub tiles *(folder name typo — roadmap cleanup)* |
| `projects/{easyform,financialledgercasestudy,localllmmemory}/` | en, ar | Project detail pages |
| `future/` | en, es, ar | Future/roadmap page |
| `projectsData.ts` | — | Static project registry |
| `utils/i18n/{en,es,ar}.json` | UI strings | All pages |

## 6. Known component-level debt (tracked in roadmap)

- Stale duplicates: `DiagonalSlash copy.tsx`, `CareerMapCanvas copy.tsx` — delete.
- `AnimationTester` renders in production layout — dev-gate it.
- `es` content JSON missing for career/projects data (UI strings + future page are translated).
- `playground` page has test data (`p1.webp` alt text "test image 1").
