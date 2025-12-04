# AI Portfolio (Frontend + Backend)

This repository is an in-progress portfolio web app that combines a modern Next.js frontend with a small Python backend. The project demonstrates an interactive UI built with React + TypeScript and componentized design, plus a backend entrypoint for AI or API integrations.

**Status**: actively developed — core frontend layout, components, and styles are in place; a minimal Python backend file exists at `backend/main.py`.

**Quick start**

```bash
# Install node dependencies
npm install

# Run the Next.js dev server
npm run dev

# (Optional) Run the Python backend if needed
# e.g. `python backend/main.py` — framework not enforced in repo
```

**Project Tech Stack**
- **Frontend framework**: `Next.js` (App Router)
- **UI library**: `React` (with TypeScript support configured in `tsconfig.json`)
- **Styling**: `Sass` / `SCSS` and plain CSS
- **Icons**: `lucide-react` and SVGs in `public/icons`
- **Build tools**: Node.js scripts in `package.json` (`dev`, `build`, `start`, `lint`)
- **Backend**: lightweight Python entrypoint at `backend/main.py` (no specific framework enforced in repository)

**Notable dependencies** (from `package.json`)
- `next` (v15+), `react` (v19+), `react-dom` (v19+), `sass`, `lucide-react`

**What we've built so far**
- Core app shell using Next.js App Router (`src/app/`)
- Global styles in `src/app/globals.css` and `src/app/global.scss`
- Reusable UI components in `src/components/`:
  - `Agentbar.tsx` — agent/control sidebar
  - `Chat.tsx` — chat UI component
  - `Topbar.tsx` — top navigation/header
  - `MainBg.tsx` — background / layout visuals
  - `Icons.tsx` and `Icons/ArrowUp.tsx` — icon components
  - SCSS module: `src/components/SCSS/agentbar.scss`
- Client subpages under `src/app/(client)/(mainpages)/profile/page.tsx`
- Static/public assets in `public/` including `bgsvg/` and `icons/`
- Minimal Python backend file: `backend/main.py` (placeholder for API/AI integration)

**Folder structure (high level)**
```
.
├─ package.json
├─ next.config.ts
├─ tsconfig.json
├─ public/
│  ├─ bgsvg/
│  └─ icons/
├─ src/
│  ├─ app/
│  │  ├─ global.scss
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ (client)/
│  │     └─ (mainpages)/
│  │        └─ profile/page.tsx
│  ├─ components/
│  │  ├─ Agentbar.tsx
│  │  ├─ Chat.tsx
│  │  ├─ Topbar.tsx
│  │  ├─ MainBg.tsx
│  │  ├─ Icons.tsx
│  │  └─ Icons/ArrowUp.tsx
│  └─ components/SCSS/agentbar.scss
└─ backend/
   └─ main.py
```

**How to contribute / next steps**
- Add a backend framework (FastAPI / Flask) to `backend/` if API endpoints are required.
- Wire frontend components to backend endpoints for dynamic AI features.
- Add tests and lint rules; run `npm run lint` to check JS/TS linting.
- Improve README with API docs once backend endpoints exist.

**Commands**
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`

**Contact / Maintainers**
- Repository: `chromecodes/ai_portfolio` (local workspace)
