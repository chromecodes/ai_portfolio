# **AI Portfolio (MVP)**

An AI-powered personal portfolio web app built with **Next.js, Supabase, and Groq LLM**. The portfolio showcases your projects, experience, and skills while providing an interactive AI chat assistant capable of answering questions about your work.

**Status:** Actively developed — MVP complete with core pages, AI agent, and RAG-backed knowledge base.

---

## **Table of Contents**

- [**AI Portfolio (MVP)**](#ai-portfolio-mvp)
  - [**Table of Contents**](#table-of-contents)
  - [**Features**](#features)
  - [**Tech Stack**](#tech-stack)
    - [**Frontend**](#frontend)
    - [**Backend / API**](#backend--api)
    - [**Database**](#database)
    - [**Deployment**](#deployment)
    - [**Utilities / Tooling**](#utilities--tooling)
  - [**Folder Structure**](#folder-structure)
  - [**Installation \& Setup**](#installation--setup)
  - [**Environment Variables**](#environment-variables)
  - [**Commands**](#commands)
  - [**Future Enhancements**](#future-enhancements)
  - [**Contact / Maintainers**](#contact--maintainers)

---

## **Features**

* Home / Landing Page: Intro and navigation
* Experience Page: Work history, roles, and achievements
* Projects Page: Showcase of projects with tech stack and details
* About / Contact Page: Personal background and links
* **AI-Powered Chat Agent**:

  * Answers questions about projects and experience
  * Retrieves data from a Supabase-powered RAG database
  * Streams answers for a live chat experience
* Minimalist, responsive UI using **Tailwind CSS** and animations with **Framer Motion**
* Lightweight icon set with **Lucide Icons**

---

## **Tech Stack**

### **Frontend**

* **Next.js 15 (App Router)** — Core frontend framework
* **React 19** — Component library
* **TypeScript** — Type safety
* **Tailwind CSS** — Utility-first styling
* **Framer Motion** — Animations and transitions
* **Lucide Icons** — Iconography
* **Shadcn/UI** — Minimal components (Input, Button, Skeleton)

### **Backend / API**

* **Groq API** — AI LLM for chat and content generation
* **Supabase** — Database, RAG storage, and optional auth
* **Next.js Route Handlers** — Server-side API endpoints

### **Database**

* **Supabase Postgres** — Structured data for projects, experience, and skills
* **Supabase Vector Store** — RAG embeddings for AI retrieval
* **Supabase Storage** — Media assets (project images, icons)

### **Deployment**

* **Vercel (Hobby)** — Free hosting for frontend and API routes
* **Supabase Free Tier** — Database and storage
* **Groq Free Tier** — LLM API access
* **Custom Domain** — Professional portfolio URL

### **Utilities / Tooling**

* **ESLint + Prettier** — Code formatting and linting
* **PNPM / npm** — Package management
* **Git + GitHub** — Version control and CI/CD integration

---

## **Folder Structure**

```
.
├─ package.json
├─ next.config.ts
├─ tsconfig.json
├─ public/
│  ├─ bgsvg/           # Background SVG assets
│  └─ icons/           # Custom icons
├─ src/
│  ├─ app/
│  │  ├─ global.scss   # Global SCSS for animations / special styles
│  │  ├─ globals.css   # Tailwind base styles
│  │  ├─ layout.tsx    # Main layout wrapper
│  │  ├─ page.tsx      # Default landing page
│  │  └─ (client)/
│  │     └─ (mainpages)/
│  │        ├─ home/page.tsx
│  │        ├─ experience/page.tsx
│  │        ├─ projects/page.tsx
│  │        └─ about/page.tsx
│  ├─ components/
│  │  ├─ Agentbar.tsx  # AI agent sidebar
│  │  ├─ Chat.tsx      # Chat interface
│  │  ├─ Topbar.tsx    # Navigation header
│  │  ├─ MainBg.tsx    # Layout background visuals
│  │  ├─ Icons.tsx
│  │  └─ Icons/ArrowUp.tsx
│  └─ lib/
│     ├─ supabase.ts   # Supabase client
│     └─ groq.ts       # Groq API wrapper
└─ app/api/
   ├─ chat/route.ts    # AI chat API
   ├─ embed/route.ts   # Embedding / vector store API
   └─ projects/route.ts # Project data API
```

---

## **Installation & Setup**

```bash
# Clone the repository
git clone https://github.com/yourusername/ai_portfolio.git
cd ai_portfolio

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## **Environment Variables**

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE=your-supabase-service-role-key
GROQ_API_KEY=your-groq-api-key
```

> These keys are required for API routes to access Supabase and Groq securely.

---

## **Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint and format code
npm run lint
```

---

## **Future Enhancements**

* Multi-agent AI interactions
* Voice input / speech-to-text
* Dark/Light mode toggle
* Admin panel for dynamic content updates
* Analytics and usage tracking
* Advanced AI features: project recommendations, filtering, sorting

---

## **Contact / Maintainers**

* **Maintainer**: Hameed Hussain
* **Email**: [hameedhussain782@gmail.com](mailto:hameedhussain782@gmail.com)
* **GitHub**: [github.com/chromecodes](https://github.com/chromecodes)
* **LinkedIn**: [linkedin.com/in/hameedhussain](https://www.linkedin.com/in/hameedhussain)

---

This README gives a **complete overview of your project**, including tech stack, structure, setup, and commands.
