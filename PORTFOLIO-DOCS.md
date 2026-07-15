# Portfolio Project — Complete Documentation

## 🎯 Goal
Build a polished, animated portfolio website for **Wassim Jebali** (a.k.a. Sextty) to showcase developer projects, including a PHP e-commerce project (Girls Boutique).

**Stack:** React 18 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui + Motion

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

## 🎨 Design System — "Blueprint / Schematic"

The portfolio is styled as an engineering drawing: a deep drafting-blue sheet, faded print linework, and a single "redline" markup accent. Tokens live in `src/theme/palette.ts` (`COLORS`, `FONTS`), mirrored into CSS vars in `src/styles/theme.css`.

| Token | Value | Role |
|-------|-------|------|
| Drafting Blue | `#0B1E36` | page ground (blueprint sheet) |
| Deep Field | `#071527` | recessed panels, code areas, modal scrims |
| Print White | `#E6EEF7` | primary text / linework |
| Trace Blue | `#7FA3C9` | annotations, dimension lines, muted text |
| Redline | `#FF5C39` | THE accent — links, CTAs, active nav, stamps |
| Girls Boutique accent | Pink (`#ec4899`) | the exhibited product keeps its own brand |
| Card style | Flat drawing sheets (`.sheet`) — hairline borders, near-square corners (`--radius: 2px`), no blur/gradients/tilt |
| Signature | `FIG. 01 — SYSTEM OVERVIEW` animated SVG schematic (`BlueprintSchematic.tsx`): CLIENT→API→DB strokes draw in, redline pulse travels the request path |
| Structural devices | Drawing frame + corner ticks, `FIG. 0n` section labels, dimension-line dividers, title-block footer, mono field labels (`FIELD 01 — NAME`), rubber `OPEN TO WORK` stamp |
| Fonts | Archivo (display, uppercase/wide), IBM Plex Sans (body), IBM Plex Mono (annotations/`.mono`) — loaded via `<link>` in `index.html` (preconnect + `display=swap`) |
| A11y | `:focus-visible` redline outline, `prefers-reduced-motion` disables draw/pulse/entrance, Trace Blue is the minimum muted color (meets WCAG AA on the ground) |

---

## 🔧 Key Features

### 1. Animations & Scroll Effects
- **`useActiveSection`** — IntersectionObserver hook that tracks which section is in view
- **`ScrollProgress`** — fixed progress bar at top (useScroll + useSpring)
- **`SectionDivider`** — dimension line between sections (hairline + end ticks + mono label), draws out on scroll
- **`SectionEntrance`** — fade-up + slight scale wrapper for section entries
- **`BlueprintSchematic`** — hero signature: animated SVG system diagram (replaces the old CodeTerminal, which was deleted)
- **Navbar active section** — animated redline underline via `layoutId="nav-indicator"`
- **Mobile nav** — hamburger toggle below `md` with animated dropdown (About / Projects / Contact / All Projects / Hire Me)

### 2. Project System
- **Storage:** localStorage under key `wassim_portfolio_projects_v3` (bumped to bust stale caches; legacy `liveUrl` migrates to `runUrl`)
- **CRUD:** Full create/read/update/delete via Admin Panel
- **Default projects:** 4 seeded — Girls Boutique (real), plus DevPulse / ChatFlow AI / CloudVault (placeholders)
- **Optional URLs:** `runUrl` and `githubUrl` are optional; buttons only render when URL exists
- **`ProjectCard`** — shared "mini drawing sheet" card in `src/components/ProjectCard.tsx`, used by both PublicPortfolio (`appear="scroll"`) and ProjectZone (`appear="mount"`)
- **Videos:** per-project demo videos stored in IndexedDB (`src/utils/videoDb.ts`), played in the accessible `VideoModal` (Escape closes, `role="dialog"`)
- ⚠️ Projects/videos live only in the browser that edited them — admin changes do NOT reach deployed visitors (no backend)

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
| Projects only persist per-browser | ⚠️ By design (for now) | localStorage/IndexedDB; needs a real backend for cross-device persistence |
| 3 of 4 seed projects are placeholders | ⚠️ Content | DevPulse / ChatFlow AI / CloudVault have no real repos or demos |
| Pre-existing lint errors | ⚠️ Pre-existing | ~18 errors in unused `src/components/ui/*` (react-refresh rule) and GirlsBoutique (`any` types); build unaffected |
| `src/components/ui/*` unused | ℹ️ Note | shadcn scaffolding (~45 files) + many deps not imported by any page |

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
├── App.tsx                          # Routes (lazy-loaded except landing)
├── main.tsx                         # Entry point, global styles
├── pages/
│   ├── PublicPortfolio.tsx          # Main portfolio page (navbar incl. mobile menu, hero, about, projects, contact, footer)
│   ├── ProjectZone.tsx              # Full project directory
│   ├── AdminPanel.tsx               # Admin CRUD dashboard
│   ├── ProjectPreview.tsx           # Single project detail page
│   └── GirlsBoutique/               # E-commerce demo (index.tsx = lazy route entry)
├── components/
│   ├── ProjectCard.tsx              # Shared "mini drawing sheet" card
│   ├── BlueprintSchematic.tsx       # Hero signature: animated SVG system diagram
│   ├── VideoModal.tsx               # Accessible demo-video dialog
│   ├── ScrollProgress.tsx           # Fixed redline scroll progress bar
│   ├── SectionDivider.tsx           # Dimension-line section separator
│   └── SectionEntrance.tsx          # Fade-up entrance wrapper
├── theme/
│   └── palette.ts                   # Blueprint COLORS + FONTS tokens (imported by JSX)
├── utils/
│   ├── projectDb.ts                 # Project interface + localStorage CRUD + defaults
│   ├── videoDb.ts                   # IndexedDB blob storage for demo videos
│   └── useActiveSection.ts          # IntersectionObserver hook
└── styles/
    ├── index.css                    # Imports tailwind/theme/globals (fonts load in index.html)
    ├── theme.css                    # Design tokens (blueprint CSS vars)
    └── globals.css                  # Sheet/grid/frame/stamp/dimension utilities, buttons

public/
├── og-image.png                     # 1200×630 social share image
├── robots.txt / sitemap.xml         # SEO
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
