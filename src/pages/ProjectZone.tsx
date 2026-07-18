import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getProjects, Project } from "@/utils/projectDb";
import { ArrowLeft, Search, X } from "lucide-react";
import { VideoModal } from "@/components/VideoModal";
import { ProjectCard } from "@/components/ProjectCard";
import { COLORS } from "@/theme/palette";

/* ─── Facets ─────────────────────────────────────────────── */

const hasTag = (p: Project, names: string[]) =>
  p.tags.some((t) => names.includes(t.toLowerCase()));

const CATEGORIES: { id: string; label: string; match: (p: Project) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  {
    id: "realtime",
    label: "Real-time",
    match: (p) => hasTag(p, ["websockets", "socket.io"]),
  },
  {
    id: "ai",
    label: "AI-powered",
    match: (p) => hasTag(p, ["openai"]) || /\bAI\b/.test(`${p.title} ${p.tagline} ${p.description}`),
  },
  {
    id: "data",
    label: "Data & analytics",
    match: (p) => hasTag(p, ["clickhouse", "d3.js", "recharts"]),
  },
  {
    id: "commerce",
    label: "E-commerce",
    match: (p) => /commerce|boutique|shop/i.test(`${p.title} ${p.tagline}`),
  },
  {
    id: "productivity",
    label: "Productivity",
    match: (p) => /kanban|board|notes|markdown|task/i.test(`${p.tagline} ${p.description}`),
  },
];

type SortMode = "newest" | "featured";

/* ─── Page ───────────────────────────────────────────────── */

export default function ProjectZone() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("featured");
  const [playingVideo, setPlayingVideo] = useState<{
    src: string;
    title: string;
    color?: string;
  } | null>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const allTags = useMemo(
    () => [...new Set(projects.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b)),
    [projects]
  );

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    const cat = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];
    const list = projects.filter((p) => {
      const matchesQuery =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query));
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      return matchesQuery && matchesTag && cat.match(p);
    });
    return [...list].sort((a, b) => {
      if (sort === "featured" && a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }
      return Number(b.year) - Number(a.year);
    });
  }, [projects, search, category, activeTag, sort]);

  const hasActiveFilters = search !== "" || category !== "all" || activeTag !== null;

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setActiveTag(null);
  };

  const pill = (active: boolean): React.CSSProperties => ({
    border: "none",
    cursor: "pointer",
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: "'Instrument Sans', sans-serif",
    background: active ? COLORS.ink : COLORS.paper,
    color: active ? "#fff" : COLORS.slate,
    boxShadow: active ? "none" : `inset 0 0 0 1px ${COLORS.line}`,
    transition: "background 0.2s, color 0.2s",
    whiteSpace: "nowrap",
  });

  return (
    <div
      style={{
        background: COLORS.porcelain,
        color: COLORS.ink,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: 68,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-16"
      >
        <Link
          to="/"
          className="flex items-center gap-2"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: COLORS.slate,
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.ink)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.slate)
          }
        >
          <ArrowLeft size={16} /> Back to home
        </Link>

        <Link
          to="/#contact"
          className="btn-primary hidden sm:inline-flex"
          style={{ padding: "9px 18px", fontSize: 13.5, textDecoration: "none" }}
        >
          Start a project
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="mb-10">
          <p className="eyebrow mb-3">Catalog</p>
          <h1
            className="display"
            style={{
              fontSize: "clamp(2.1rem, 4.6vw, 3.2rem)",
              letterSpacing: "-0.03em",
              color: COLORS.ink,
              lineHeight: 1.05,
            }}
          >
            All projects
          </h1>
          <p
            style={{
              fontSize: 15,
              color: COLORS.slate,
              marginTop: 14,
              maxWidth: 520,
              lineHeight: 1.7,
            }}
          >
            {projects.length} complete builds — every one with source on GitHub,
            most with a live demo that runs right here in your browser.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9AA2B8",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search by name, stack, or what it does…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search projects"
                className="glow-input w-full py-3"
                style={{ fontSize: 14.5, paddingLeft: 44, paddingRight: 20 }}
              />
            </div>

            {/* Sort */}
            <div
              role="radiogroup"
              aria-label="Sort projects"
              className="flex gap-1 self-start sm:self-auto"
              style={{
                background: COLORS.paper,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 999,
                padding: 4,
              }}
            >
              {(
                [
                  { id: "featured", label: "Featured" },
                  { id: "newest", label: "Newest" },
                ] as { id: SortMode; label: string }[]
              ).map((s) => (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={sort === s.id}
                  onClick={() => setSort(s.id)}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 999,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'Instrument Sans', sans-serif",
                    background: sort === s.id ? COLORS.ink : "transparent",
                    color: sort === s.id ? "#fff" : COLORS.slate,
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
                style={pill(category === c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Technology chips */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by technology">
            {allTags.map((t) => {
              const active = activeTag === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTag(active ? null : t)}
                  aria-pressed={active}
                  className="mono"
                  style={{
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 999,
                    padding: "4px 11px",
                    fontSize: 11,
                    letterSpacing: "0.02em",
                    background: active ? COLORS.cobalt : "#F2F4F9",
                    color: active ? "#fff" : COLORS.slate,
                    boxShadow: active ? "none" : `inset 0 0 0 1px ${COLORS.line}`,
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Result count */}
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 13.5, color: "#9AA2B8" }}>
              {filtered.length} of {projects.length} project
              {projects.length === 1 ? "" : "s"}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.cobalt,
                  padding: 0,
                }}
              >
                <X size={13} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div
            className="sheet flex flex-col items-center text-center"
            style={{ padding: "64px 32px" }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: COLORS.cobaltSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Search size={22} style={{ color: COLORS.cobalt }} />
            </div>
            <h2
              className="display"
              style={{ fontSize: "1.3rem", color: COLORS.ink, marginBottom: 8 }}
            >
              Nothing matches those filters
            </h2>
            <p style={{ fontSize: 14.5, color: COLORS.slate, maxWidth: 380, lineHeight: 1.7, marginBottom: 20 }}>
              Try a broader search — or a technology like “React” or
              “PostgreSQL”.
            </p>
            <button
              onClick={clearFilters}
              className="btn-ghost"
              style={{ padding: "10px 22px", fontSize: 14 }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                appear="mount"
                onWatchDemo={(src, title, color) =>
                  setPlayingVideo({ src, title, color })
                }
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${COLORS.line}`,
          background: COLORS.paper,
          padding: "24px 0",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <span style={{ fontSize: 13.5, color: COLORS.slate }}>
            © {new Date().getFullYear()} Wassim Jebali
          </span>
          <Link
            to="/admin"
            style={{
              fontSize: 13.5,
              color: "#9AA2B8",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.cobalt)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "#9AA2B8")
            }
          >
            Admin
          </Link>
        </div>
      </footer>

      <VideoModal
        isOpen={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        videoSrc={playingVideo?.src || ""}
        projectTitle={playingVideo?.title || ""}
        projectColor={playingVideo?.color}
      />
    </div>
  );
}
