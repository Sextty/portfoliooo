# Portfolio Project — Complete Documentation

## 🎯 Goal
Build a polished, animated portfolio website for **Wassim Jebali** (a.k.a. Sextty) to showcase developer projects, including a PHP e-commerce project (Girls Boutique).

**Stack:** React 18 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui + Motion

---

## 🧭 Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | PublicPortfolio | Main landing — hero, about, skills, featured projects, contact |
| `/projects` | ProjectZone | Full project directory with search & filter |
| `/admin` | AdminPanel | Password-protected CRUD dashboard for projects |
| `/project/:id` | ProjectPreview | Dynamic detail page for each project |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#060912` |
| Text | `#e8ecf4` |
| Accent | Indigo (`#6366f1`) / Emerald (`#10b981`) |
| Girls Boutique accent | Pink (`#ec4899`) |
| Card style | Glassmorphism (frosted glass, `backdrop-filter: blur`) |
| Effects | 3D tilt on hover, shimmer, fade-up entrance, scroll progress bar |
| Fonts | Sora (headings), system sans-serif, JetBrains Mono (code) |

---

## 🔧 Key Features

### 1. Animations & Scroll Effects
- **`useActiveSection`** — IntersectionObserver hook that tracks which section is in view
- **`ScrollProgress`** — fixed progress bar at top (useScroll + useSpring)
- **`SectionDivider`** — animated gradient line between sections, opacity linked to scroll
- **`SectionEntrance`** — fade-up + slight scale wrapper for section entries
- **`CodeTerminal`** — hero animation (replaces Orb3D): typewriter terminal cycling through 5 code blocks with float animation
- **Navbar active section** — animated underline indicator via `layoutId="nav-indicator"`

### 2. Project System
- **Storage:** localStorage under key `wassim_portfolio_projects_v2` (v2 forces fresh defaults)
- **CRUD:** Full create/read/update/delete via Admin Panel
- **Default projects:** 4 seeded projects — Girls Boutique, Apex.ai, Nexara, CyberForge
- **Optional URLs:** `liveUrl` and `githubUrl` are optional; buttons only render when URL exists

### 3. Admin Panel
- **Password gate:** `VITE_ADMIN_PASSWORD` env var (falls back to `admin123`)
- Fields: title, tagline, description, tags (comma-separated), live URL, GitHub URL, color, featured toggle, year

### 4. Project Preview Page (`/project/:id`)
- Dynamic route for each project
- Shows: title, tagline, tech tags, description, features list, setup instructions (for PHP projects)
- GitHub link + Download ZIP button
- Code snippet preview
- "Run Locally" step-by-step guide

---

## 👤 Personal Details

| Field | Value |
|-------|-------|
| Name | Wassim Jebali |
| GitHub | [github.com/Sextty](https://github.com/Sextty) |
| Email | wassimjebali583@gmail.com |
| LinkedIn | Sextty |

### Tech Categories

| Category | Skills |
|----------|--------|
| Frontend | HTML, CSS, JavaScript, React, Bootstrap, Next.js |
| Backend | Node.js, PHP, Laravel |
| Database | MySQL, NoSQL, MongoDB |
| Tools | Git, REST APIs, Postman |

---

## 🛍️ Girls Boutique — PHP E-Commerce Project

- **Status:** Extracted from `girls.rar` → `girls_extracted/girls/` (45 files, 8 folders)
- **Stack:** PHP, MySQL, Tailwind CSS, JavaScript, HTML/CSS
- **Features:** Product catalog, cart, checkout, wishlist, admin dashboard, MySQL database
- **GitHub:** [github.com/Sextty/girls-boutique](https://github.com/Sextty/girls-boutique)
- **Live URL:** `/project/girls-boutique` (React route with project details & setup guide)
- **No demo server** — GitHub is the primary destination for PHP source code

### How to Run Locally
1. Install XAMPP or MAMP, start Apache + MySQL
2. Copy `girls_extracted/girls/` folder to `htdocs/`
3. Import `schema.sql` into phpMyAdmin
4. Edit `db.php` with your MySQL credentials
5. Visit `http://localhost/girls/` in your browser

---

## 🐛 Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| ESLint config broken | ⚠️ Pre-existing | Does not block `npm run build` |
| `public/girls/` removed | 🔧 Resolved | Vite SPA fallback intercepted `/girls/*` paths; switched to React route |
| Hard refresh required | ℹ️ Note | Ctrl+Shift+R after every code change due to JS caching |

---

## 🛠️ Development

```bash
npm run dev        # Start Vite dev server → http://localhost:5173/
npm run build      # TypeScript check + production build
npm run preview    # Preview production build locally
```

---

## 📁 File Map

```
src/
├── App.tsx                          # Routes
├── main.tsx                         # Entry point, global styles
├── pages/
│   ├── PublicPortfolio.tsx          # Main portfolio page
│   ├── ProjectZone.tsx              # Full project directory
│   ├── AdminPanel.tsx               # Admin CRUD dashboard
│   └── ProjectPreview.tsx           # Single project detail page
├── components/
│   ├── CodeTerminal.tsx             # Terminal typewriter hero animation
│   ├── ProjectCard.tsx              # Glassmorphism 3D tilt card
│   ├── ScrollProgress.tsx           # Fixed scroll progress bar
│   ├── SectionDivider.tsx           # Animated section separator
│   └── SectionEntrance.tsx          # Fade-up entrance wrapper
├── utils/
│   ├── projectDb.ts                 # Project interface + localStorage CRUD + defaults
│   └── useActiveSection.ts          # IntersectionObserver hook
├── styles/
│   └── globals.css                  # Global styles, keyframes, utilities
└── lib/
    └── utils.ts                     # shadcn utility (cn)
```

---

## 🔄 Change History

| Date | Change |
|------|--------|
| Initial | Created Vite + React + Tailwind scaffold, added shadcn/ui |
| — | Added scroll animations (useActiveSection, ScrollProgress, SectionDivider, SectionEntrance) |
| — | Replaced Orb3D with CodeTerminal hero animation |
| — | Updated personal details + tech categories |
| — | Extracted girls.rar, added Girls Boutique as featured project |
| — | Made liveUrl/githubUrl optional in Project interface |
| — | Changed STORAGE_KEY to wassim_portfolio_projects_v2 |
| — | Removed public/girls/ due to Vite SPA routing conflict |
| Latest | Added /project/:id route + ProjectPreview component |
