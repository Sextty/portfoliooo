# Portfolio Project — Complete Documentation

## 🎯 Goal
A commercial-grade portfolio platform for **Wassim Jebali** (a.k.a. Sextty). The pitch: every project is a complete product with a **live in-browser demo** — the site presents them the way a product company would.

**Stack:** React 18 + Vite + TypeScript + Tailwind CSS 4 + Motion

**Production:** https://portfoliowassim.vercel.app (Vercel, auto-deploys from master)

---

## 🧭 Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | PublicPortfolio | Main landing — hero, about, skills, featured projects, contact (eager-loaded) |
| `/projects` | ProjectZone | Full project directory with search & filter (lazy) |
| `/admin` | AdminPanel | Password-protected CRUD dashboard for projects (lazy) |
| `/project/:id` | ProjectPreview | Dynamic detail page for each project (lazy) |
| `/girls-boutique` | GirlsBoutique | Interactive e-commerce demo backed by sql.js (lazy) |

All routes except `/` are code-split via `React.lazy` + `Suspense` in `App.tsx`; the Girls Boutique demo (incl. sql.js) has its own chunk via `src/pages/GirlsBoutique/index.tsx`.

---

## 🎨 Design System — "Harbor" (commercial rebrand, 2026-07-18)

Light, product-company UI — porcelain ground, paper surfaces, ink text, one cobalt accent (the blue of Sidi Bou Said doors). Each project supplies its own color *inside* its product frame; the chrome around it stays disciplined. Tokens live in `src/theme/palette.ts` (`COLORS`, `FONTS`), mirrored into CSS vars in `src/styles/theme.css`.

| Token | Value | Role |
|-------|-------|------|
| Porcelain | `#F6F7F9` | page ground |
| Paper | `#FFFFFF` | cards / raised surfaces |
| Ink | `#0F1222` | headlines, body text, dark bands (contact panel) |
| Slate | `#566070` | secondary text |
| Line | `#E6E8F0` | hairline borders |
| Cobalt | `#2B50E0` | THE accent — links, CTAs, eyebrows, focus rings (hover `#1E3CB8`) |
| Mint | `#0E9F6E` | availability / success signal |
| Project colors | per-project | live inside each product's mockup frame only |
| Card style | White cards, `border-radius: 16px`, hairline borders, quiet shadows, 3px hover lift |
| **Signature** | **`AppMockup.tsx` — every project renders as a CSS/SVG miniature of its actual UI (storefront, dashboard, chat, kanban, files, notes, fitness, polls) inside a `BrowserFrame`; the hero `LiveLauncher` auto-cycles them and launches the real demos** |
| Fonts | Bricolage Grotesque (display, -2% tracking), Instrument Sans (body), JetBrains Mono (chips/labels/code) — loaded via `<link>` in `index.html` |
| A11y | `:focus-visible` cobalt outline, `prefers-reduced-motion` respected (launcher auto-cycle disabled too), labeled form fields, dialog semantics in VideoModal |

**Legacy-alias trick:** old blueprint class names (`.sheet`, `.glow-input`, `.fig-tag`, `.stamp`, `.title-block`, `.sheet-grid`, `.btn-primary`, `.btn-ghost`) and old `COLORS` keys (`ground/field/print/trace/redline`) still exist but resolve to Harbor values — that's how AdminPanel inherited the rebrand without a rewrite.

---

## 🔧 Key Features

### 1. Animations & Interactive Elements
- **`AppMockup` + `BrowserFrame`** — the signature: parameterized miniature product UIs (8 variants + generic fallback), tinted per project color, with micro-life (typing dots, growing chart bars, live-pulse dots)
- **`LiveLauncher`** (in PublicPortfolio) — hero browser frame that auto-cycles featured demos every 4.5s (paused on hover, disabled under reduced motion), with a tab switcher and a real "Launch demo" button
- **`useActiveSection`** — IntersectionObserver hook that tracks which section is in view
- **`ScrollProgress`** — fixed cobalt progress bar at top (useScroll + useSpring)
- **`SectionEntrance`** — fade-up wrapper for section entries
- **Navbar active section** — cobalt dot indicator via `layoutId="nav-indicator"`; scrolled nav gets white blur + border
- **Mobile nav** — hamburger toggle below `md` with animated dropdown (Work / What I do / About / All projects / Start a project)

### 2. Project System
- **Committed source of truth:** `src/data/projects.json` (`{ version, projects[] }`) is baked into the build — it's what **every visitor on every device** sees. Edit it (or Admin → Export for Deploy), commit & push to publish.
- **Local cache:** `getProjects()` seeds localStorage (`wassim_portfolio_projects`) from that JSON. Bumping `version` in the JSON makes every browser drop its cached copy and reload the deployed data (legacy bare-array / `liveUrl` shapes auto-migrate). `DATA_VERSION` is exported from `projectDb.ts`.
- **CRUD:** Full create/read/update/delete via Admin Panel (writes the local cache only — see "Publishing" below to push changes live)
- **Default projects:** 8 seeded — Girls Boutique (in-portfolio demo) plus 7 standalone full-stack repos under github.com/Sextty: DevPulse, ChatFlow AI, CloudVault, TaskForge, SnapNote, FitTrack, PollWave (each a real app with docker-compose)
- **Optional URLs:** `runUrl` and `githubUrl` are optional; buttons only render when URL exists
- **`ProjectCard`** — shared product card in `src/components/ProjectCard.tsx` (AppMockup header on a tinted stage, tagline, stack chips, Case study link, Live demo pill), used by both PublicPortfolio (`appear="scroll"`) and ProjectZone (`appear="mount"`)
- **Videos — two modes:**
  - *Baked-in (visible to everyone):* a file in `public/videos/<id>.mp4` referenced by the project's `videoUrl` = `/videos/<id>.mp4`. This is committed and deployed.
  - *Local upload (this browser only):* uploaded via Admin → stored in IndexedDB (`src/utils/videoDb.ts`), good for a quick preview. `ProjectCard`/`ProjectPreview` prefer the IndexedDB blob, else fall back to `videoUrl`.
  - Played in the accessible `VideoModal` (Escape closes, `role="dialog"`).

### 2a. Publishing admin changes to production
Admin edits (and uploaded videos) live only in the editing browser until baked into the repo. To push them live for all devices:
1. Admin Panel → **Export for Deploy** → downloads `projects.json` (with `videoUrl` rewritten to `/videos/<id>.<ext>`, `version` bumped) + every uploaded video file. (Per-project: **Download for deploy** in the video section.)
2. Replace `src/data/projects.json` with the download; move video file(s) into `public/videos/`.
3. Commit & push (**`git push newrepo master`** — Vercel deploys from the `newrepo` remote) → live on all devices.

### 3. Admin Panel
- **Password gate:** `VITE_ADMIN_PASSWORD` env var (falls back to `admin123`) — client-side only, low security by design
- Fields: title, tagline, description, tags (comma-separated), run URL, GitHub URL, video upload, color, featured toggle, year

### 4. Contact Form
- No backend: submitting opens the visitor's email app via `mailto:` with subject/body pre-filled to `wassimjebali583@gmail.com`
- Email / GitHub / LinkedIn rows in the contact section are clickable links

### 5. SEO & Social
- `index.html`: meta description, canonical, `theme-color`, full Open Graph + Twitter Card tags
- `public/og-image.png` — 1200×630 branded share image
- `public/robots.txt` (disallows `/admin`) + `public/sitemap.xml`

---

## 👤 Personal Details

| Field | Value |
|-------|-------|
| Name | Wassim Jebali |
| GitHub | [github.com/Sextty](https://github.com/Sextty) |
| Email | wassimjebali583@gmail.com |
| LinkedIn | linkedin.com/in/wassim-wess-b3a544380 |

### Tech Categories

| Category | Skills |
|----------|--------|
| Frontend | HTML, CSS, JavaScript, React, Bootstrap, Next.js |
| Backend | Node.js, PHP, Laravel |
| Database | MySQL, NoSQL, MongoDB |
| Tools | Git, REST APIs, Postman |

---

## 🛍️ Girls Boutique — PHP E-Commerce Project

- **Stack (original):** PHP, MySQL, Tailwind CSS, JavaScript, HTML/CSS
- **In this portfolio:** re-created as an interactive React demo at `/girls-boutique`, backed by an in-browser SQLite database (sql.js; `public/sql-wasm.wasm`, ~644 KB, fetched only on that route)
- **Features:** Product catalog, cart, checkout, wishlist, admin dashboard
- **GitHub:** [github.com/Sextty/girls-boutique](https://github.com/Sextty/girls-boutique)

### How to Run the Original Locally
1. Install XAMPP or MAMP, start Apache + MySQL
2. Copy the `girls/` folder to `htdocs/`
3. Import `schema.sql` into phpMyAdmin
4. Edit `db.php` with your MySQL credentials
5. Visit `http://localhost/girls/` in your browser

---

## 🐛 Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| Admin edits don't auto-reach visitors | ℹ️ By design (no backend) | Edits/uploads are per-browser; publish via Admin → Export for Deploy → commit `src/data/projects.json` + `public/videos/*` → push (see §2a) |
| Demo videos not yet recorded | ℹ️ Content | Projects link to real GitHub repos; add `videoUrl`/`runUrl` per project as demos are recorded |
| Pre-existing lint errors | ⚠️ Pre-existing | 11 errors in GirlsBoutique demo code (`any` types from sql.js rows, empty catch blocks, react-refresh); build unaffected |

---

## 🛠️ Development

```bash
npm run dev        # Start Vite dev server → http://localhost:5173/
npm run build      # TypeScript check + production build
npm run lint       # ESLint (flat config — fixed 2026-07-15)
npm run preview    # Preview production build locally
```

---

## 📁 File Map

```
src/
├── App.tsx                          # Routes (lazy-loaded except landing) + light RouteLoader
├── main.tsx                         # Entry point, global styles
├── pages/
│   ├── PublicPortfolio.tsx          # Landing composition (state, hash-scroll, skip link)
│   ├── landing/                     # Landing sections: Navbar, HeroSection (LiveLauncher), StatsBand,
│   │                                #   WorkSection, ServicesSection, PrinciplesSection, AboutSection,
│   │                                #   ContactSection, Footer, LogoMark, SectionHeader
│   ├── ProjectZone.tsx              # Catalog: search + category pills + tech chips + sort + empty state
│   ├── AdminPanel.tsx               # Admin CRUD dashboard (rethemed via legacy-alias classes; list search)
│   ├── ProjectPreview.tsx           # Product page (problem/solution, architecture, decisions, roadmap, CTA)
│   ├── Demos/                       # In-browser demos for the 7 repo projects (own brands, shared DemoShell)
│   └── GirlsBoutique/               # E-commerce demo (index.tsx = lazy route entry)
├── components/
│   ├── AppMockup.tsx                # SIGNATURE: miniature product UIs + BrowserFrame chrome
│   ├── ArchitectureDiagram.tsx      # Animated client→services→data system diagram
│   ├── ProjectCard.tsx              # Shared product card (mockup header + actions + spotlight)
│   ├── Counter.tsx                  # In-view count-up (reduced-motion aware)
│   ├── Magnetic.tsx                 # Magnetic CTA wrapper (fine pointers only)
│   ├── VideoModal.tsx               # Accessible demo-video dialog (white chrome)
│   ├── ScrollProgress.tsx           # Fixed cobalt scroll progress bar
│   ├── SectionEntrance.tsx          # Fade-up entrance wrapper
│   └── ImageWithFallback.tsx        # Img with error fallback
├── data/
│   ├── projects.json                # Committed source of truth ({version, projects[]}) — baked into build
│   ├── caseStudies.ts               # Per-project story content (problem/solution/architecture/decisions/roadmap)
│   └── site.ts                      # Identity constants (email, GitHub, LinkedIn, production URL)
├── theme/
│   └── palette.ts                   # Harbor COLORS + FONTS tokens (legacy key names aliased)
├── utils/
│   ├── projectDb.ts                 # Project interface + localStorage cache seeded from data/projects.json
│   ├── videoDb.ts                   # IndexedDB blob storage for demo videos
│   ├── color.ts                     # tint() hex→rgba helper
│   ├── useSpotlight.ts              # Cursor-spotlight CSS-var handler (pairs with .spotlight)
│   └── useActiveSection.ts          # IntersectionObserver hook
└── styles/
    ├── index.css                    # Imports tailwind/theme/globals (fonts load in index.html)
    ├── theme.css                    # Design tokens (Harbor CSS vars, product radii)
    └── globals.css                  # Cards, buttons, chips, inputs, stamp, mockup keyframes (legacy names aliased)

public/
├── og-image.png                     # 1200×630 social share image
├── robots.txt / sitemap.xml         # SEO
├── videos/                          # Baked-in demo videos (served at /videos/*, visible to all)
└── sql-wasm.wasm                    # sql.js runtime for /girls-boutique
```

---

## 🔄 Change History

| Date | Change |
|------|--------|
| Initial | Created Vite + React + Tailwind scaffold, added shadcn/ui |
| — | Added scroll animations, CodeTerminal hero, personal details |
| — | Extracted girls.rar, added Girls Boutique as featured project |
| — | `/project/:id` route + ProjectPreview; storage key → v3; `liveUrl` → `runUrl` |
| — | Admin video upload (IndexedDB) + localStorage quota error handling |
| 2026-07-15 | **Upgrade pass:** shared ProjectCard (deduped ~280 lines ×2), mobile nav menu, mailto contact form + clickable contact links, route code-splitting (main JS 484→352 KB, boutique/admin/preview lazy), font loading via preconnect links, OG/Twitter meta + og-image + robots.txt + sitemap.xml, VideoModal a11y (Escape, dialog role, labels), fixed object-URL revoke leaks, fixed broken ESLint flat config |
| 2026-07-15 | **Blueprint rebrand:** replaced indigo/emerald neon + glassmorphism with the engineering-drawing design system (drafting-blue sheet, redline accent, Archivo/IBM Plex, drawing frame, FIG labels, dimension lines, title-block footer); new `BlueprintSchematic` hero + `palette.ts`; removed CodeTerminal and all glass/tilt/shimmer/dot-grid; blueprint favicon + og-image. GirlsBoutique demo left on its own pink brand. |
| 2026-07-15 | **Bake-in publishing pipeline:** moved project data to committed `src/data/projects.json` (`{version, projects}`, version-based cache refresh in `projectDb.ts`); added `public/videos/` for baked-in demo videos; Admin **Export for Deploy** (downloads `projects.json` + uploaded videos with `videoUrl` rewritten to `/videos/…`) and per-project **Download for deploy**, so admin changes can be committed and shown on every device. |
| 2026-07-18 | **Demos v2 — every in-browser product upgraded (logic + UI + new interfaces):** DevPulse: Overview/Pipelines/Deploys tabs, 4w/8w/12w range switcher, live running pipeline with step progress, deploy log. ChatFlow: multi-room state with ambient teammate activity + unread badges, emoji reactions (bots react back), in-room search, room-info drawer. TaskForge: card editor modal (title/notes/label/assignee/priority), search + label filters, avatars & priority chips, In-Progress WIP-limit signal, board reset, v2 storage key with migration. CloudVault: storage quota meter, search + type filters, list/grid toggle, file-details modal (image preview, version history, share link, permissions). SnapNote: Write/Split/Preview modes, tag filter chips, trash with restore/delete-forever, .md export. FitTrack: Dashboard/History tabs, editable weekly goal ring with goal line on the chart, quick-add chips, personal records, 6-week training heatmap, day-grouped log. PollWave: live watching counter, LIVE/CLOSED status with close-poll flow + winner 🏆, per-poll details (vote-momentum sparkline + sorted breakdown), share links. Girls Boutique: SQL-backed catalog search page (LIKE across name/brand/description) + order-history page reading the orders/order_items tables; new navbar icons. |
| 2026-07-18 | **v3.0 evolution pass:** case studies became full product pages — new `src/data/caseStudies.ts` (per-project problem/solution, architecture, engineering decisions, roadmap; neutral fallback for admin-added projects) + animated `ArchitectureDiagram` (client→services→data flow) + dark conversion CTA band. Catalog v2: category pills (Real-time/AI/Data/E-commerce/Productivity), technology chips, Featured/Newest sort, result count, premium empty state. Landing: split into `src/pages/landing/` modules; new "How I ship" principles section (workflow timeline + engineering values); count-up stats (`Counter`), cursor-spotlight cards (`useSpotlight` + `.spotlight`), magnetic hero CTA (`Magnetic`), button press physics, skip-to-content link, `/#hash` cross-route scrolling, `MotionConfig reducedMotion="user"`. Admin: list search with filtered count + clear-search empty state. SEO: JSON-LD Person+WebSite. Site identity constants in `src/data/site.ts`. |
| 2026-07-18 | **Commercial platform redesign ("Harbor"):** full rebrand from dark blueprint to a light product-company system — porcelain/paper/ink + cobalt accent, Bricolage Grotesque/Instrument Sans/JetBrains Mono, 16px-radius cards, pill buttons, dark-ink contact band. New signature: `AppMockup.tsx` renders every project as a live CSS/SVG miniature of its actual UI inside a `BrowserFrame`; hero `LiveLauncher` auto-cycles featured demos and launches the real thing. Rewrote PublicPortfolio (stats band computed from project data, services section, multi-column footer), ProjectCard, ProjectZone, ProjectPreview (case-study layout, fixed self-corrupting code highlighter with placeholder tokenizer), VideoModal, RouteLoader. AdminPanel rethemed via legacy-alias classes + hex sweep. Deleted BlueprintSchematic/SectionDivider + shadcn `ui/` folder; pruned 6 unused deps (radix-dialog, cmdk, next-themes, sonner, tailwind-merge, clsx). New favicon, og-image, README, meta copy. |
