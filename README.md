# Wassim Jebali — Portfolio

A commercial-grade portfolio platform for a full-stack developer whose pitch is simple:
**every project ships with a live demo that runs in your browser.**

**Live:** https://portfoliowassim.vercel.app

## What's inside

- **Landing page** — hero with a live product launcher (auto-cycling miniature apps in a
  browser frame that launch the real demos), stats band, product grid, capabilities,
  about, contact.
- **11 real products** — each with a full product page (problem, solution, animated
  architecture diagram, engineering decisions, roadmap), GitHub repo, and an
  interactive in-browser demo — including a complete e-commerce store backed by an
  in-browser SQLite database (sql.js), and three full SaaS-style platforms (an AI
  workspace, a finance dashboard, a two-role healthcare app) each with a real
  standalone Express + Prisma + PostgreSQL + JWT backend under `docker compose up`.
- **Catalog** — searchable and filterable by category (real-time, AI, data,
  e-commerce, productivity) and by technology.
- **App miniatures** — every project renders as a CSS/SVG miniature of its actual UI
  (`src/components/AppMockup.tsx`), tinted with the project's own color. No screenshots.
- **Admin panel** (`/admin`) — CRUD for project data with an export-for-deploy pipeline
  that bakes changes into the repo.

## Design system — "Harbor"

Light commercial UI: porcelain ground `#F6F7F9`, paper surfaces, ink text `#0F1222`,
one cobalt accent `#2B50E0` (the blue of Sidi Bou Said doors). Type: Bricolage Grotesque
(display), Instrument Sans (body), JetBrains Mono (labels/code). Tokens live in
`src/theme/palette.ts` and `src/styles/theme.css`; shared utilities in
`src/styles/globals.css`.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS 4 · Motion · React Router · sql.js

## Development

```bash
npm install
npm run dev        # http://localhost:5173/
npm run build      # type-check + production build
npm run lint
npm run preview
```

## Publishing project-data changes

Project data is baked into the build from `src/data/projects.json`. Edit it directly
(or use Admin → Export for Deploy), bump `version`, put demo videos in
`public/videos/`, then commit and push — Vercel deploys from master.

Full documentation: [PORTFOLIO-DOCS.md](./PORTFOLIO-DOCS.md)
