# AI Portfolio

A modern, interactive developer portfolio and analytics engine built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Supabase**.

It combines a rich showcase experience (career timeline, interactive career graph, project case studies, roadmap) with a **custom telemetry system**: session tracking, pageview/scroll engagement, behavioral events, and lead capture — all viewable through a password-protected analytics dashboard.

> Last Updated: 2026-02-19 · Full documentation: [`docs/`](docs/README.md)

## Features

- **👋 Welcome landing page** — guided tour at `/` with quick stats, destination cards to every detail page, and featured project highlights
- **💼 Career showcase** — dynamic company timeline, interactive career-map graph (A\* pathfinding), tech-stack filtering, case-study detail pages
- **🚀 Project hub** — project tiles with modal detail views, media gallery (ImageViewer), live links, bilingual content
- **🔮 Future roadmap** — upcoming projects and learning trajectory page
- **⚡ Real-time telemetry** — visitor sessions, device/OS/browser detection, geo metadata, pageviews, scroll depth, stay duration
- **🎯 Lead capture** — lead form + returning-visitor welcome toast, cookie-linked personalization
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

# 2. Configure environment (see docs/05-setup/environment-variables.md)
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
├── features/                   # Welcome, Career (graph + A* engine), Projects, Future, Topbar, Chatbar, Analytics, Home, Loaders
├── lib/                        # supabase clients, analyticsDb, analyticsAuth, repositories
├── utils/i18n/                 # language store + en/es/ar dictionaries
├── data/                       # career/projects/future content JSON (per language)
└── types/                      # shared TypeScript interfaces
```

## Documentation

| Start with | Link |
| :--- | :--- |
| 📖 Docs index | [`docs/README.md`](docs/README.md) |
| 🏗 Architecture & diagrams | [`docs/01-architecture/system-architecture.md`](docs/01-architecture/system-architecture.md) |
| 🗄 Database & RLS | [`docs/03-database/database-schema.md`](docs/03-database/database-schema.md) |
| 🛠 Setup guide | [`docs/05-setup/local-setup.md`](docs/05-setup/local-setup.md) |
| 🚀 Deploying | [`docs/08-operations/deployment.md`](docs/08-operations/deployment.md) |

## Deployment

The app is deployed on **Vercel**. Set the environment variables listed in
[`docs/05-setup/environment-variables.md`](docs/05-setup/environment-variables.md) in the Vercel
project settings, then push to the main branch. See
[`docs/08-operations/deployment.md`](docs/08-operations/deployment.md) for the full procedure.
