# AI Portfolio

A modern, interactive developer portfolio and analytics engine built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Supabase**.

It combines a rich showcase experience (career timeline, interactive career graph, project case studies, roadmap) with a **custom telemetry system**: session tracking, pageview/scroll engagement, behavioral events, and lead capture — all viewable through a password-protected analytics dashboard.

> Current implementation: [codebase breakdown](docs/00-overview/codebase-breakdown.md) · Next release: [implementation plan](docs/IMPLEMENTATION_PLAN.md)

## Features

- **👋 Welcome landing page** — guided tour at `/` with quick stats, destination cards to every detail page, and featured project highlights
- **💼 Career showcase** — interactive Canvas career map, hover tooltips, and localized case-study detail pages
- **🚀 Project hub** — filterable project tiles, dedicated detail pages, media gallery (ImageViewer), and live links
- **🔮 Future roadmap** — upcoming projects and learning trajectory page
- **⚡ Visitor telemetry** — sessions, device/OS/browser detection, geo metadata, pageviews, scroll depth, and stay duration
- **🎯 Lead capture** — delayed lead form, URL-based personalization, source attribution, and cookie-linked sessions
- **📊 Analytics dashboard** — session metrics, event logs, lead list, engagement stats (password protected)
- **🌍 i18n** — English, Spanish, Arabic with automatic RTL
- **🎨 Modern UI** — light/dark theming, framer-motion route transitions, custom animations, responsive layout

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router, React Compiler), React 19, TypeScript |
| Styling | Tailwind CSS v4, SCSS, Radix UI primitives, shadcn-style components, lucide-react |
| Animation | Framer Motion 12 (custom transition engine) |
| State | Zustand (theme, language, cursor) |
| Database | Supabase (PostgreSQL + RLS) via `@supabase/supabase-js` / `@supabase/ssr` |
| Deployment | Vercel |

## Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see docs/00-overview/codebase-breakdown.md#13-configuration-and-local-execution)
cp .env.example .env.local   # then fill in Supabase credentials

# 3. Provision the database — run database_setup.sql in the Supabase SQL editor

# 4. Run the dev server
npm run dev                 # → http://localhost:3000
```

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── (client)/(mainpages)/   # home, about, career, projects, future, analytics, playground
│   ├── api/                    # analytics (track/data/auth/backup), leads, mainpages
│   ├── page.tsx                # welcome page (rendered via features/Welcome/WelcomeUI)
│   └── layout.tsx              # root layout: topbar, footbar, trackers, transitions
├── components/                 # AnalyticsTracker, LeadWelcomeToast, ImageViewer, animation/, ui/
├── features/                   # Welcome, Career Canvas graph, Projects, Future, Topbar, Chatbar, Analytics, Home, Loaders
├── lib/                        # supabase clients, analyticsDb, analyticsAuth, repositories
├── utils/i18n/                 # language store + en/es/ar dictionaries
├── data/                       # career/projects/future content JSON (per language)
└── types/                      # shared TypeScript interfaces
```

## Documentation

| Start with | Link |
| :--- | :--- |
| 📖 Docs index | [`docs/README.md`](docs/README.md) |
| 🏗 Stack, architecture & dataflows | [`docs/00-overview/codebase-breakdown.md`](docs/00-overview/codebase-breakdown.md) |
| 🛠 Next update implementation plan | [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) |

## Deployment

The app targets **Vercel**. Configure the environment variables documented in the
[codebase breakdown](docs/00-overview/codebase-breakdown.md#13-configuration-and-local-execution),
then follow the [deployment checklist](docs/00-overview/codebase-breakdown.md#14-deployment-model).
`database_setup.sql` is a destructive reset script, not a production migration.
