import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProjects, Project } from "@/utils/projectDb";
import { ArrowLeft, Search } from "lucide-react";
import { VideoModal } from "@/components/VideoModal";
import { ProjectCard } from "@/components/ProjectCard";
import { COLORS } from "@/theme/palette";

export default function ProjectZone() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [playingVideo, setPlayingVideo] = useState<{
    src: string;
    title: string;
    color?: string;
  } | null>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const filteredProjects = projects.filter((p) => {
    const query = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  return (
    <div
      className="sheet-grid"
      style={{
        background: COLORS.ground,
        color: COLORS.print,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="drawing-frame hidden md:block" />

      {/* Header strip */}
      <header
        style={{
          height: 72,
          background: "rgba(11,30,54,0.94)",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16"
      >
        <Link
          to="/"
          className="mono flex items-center gap-2"
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.trace,
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.print)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.trace)
          }
        >
          <ArrowLeft size={15} /> Back to Sheet 1
        </Link>

        <div className="flex items-center gap-3">
          <div
            style={{
              width: 32,
              height: 32,
              border: `1.5px solid ${COLORS.print}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className="display"
              style={{ fontWeight: 800, fontSize: 12, color: COLORS.print }}
            >
              WJ
            </span>
          </div>
          <span
            className="mono"
            style={{
              fontWeight: 500,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: COLORS.print,
            }}
          >
            Drawing Register
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-20 px-8 md:px-16 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="mb-12">
          <p className="fig-tag mb-3">Index — All Sheets</p>
          <h1
            className="display"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              color: COLORS.print,
              lineHeight: 1.08,
            }}
          >
            Drawing Register
          </h1>
          <div className="dimension-line mt-5 max-w-sm" />
          <p
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              color: COLORS.trace,
              marginTop: 16,
            }}
          >
            {filteredProjects.length} SHEET
            {filteredProjects.length === 1 ? "" : "S"} ON FILE
          </p>
        </div>

        {/* Search */}
        <div className="mb-10 max-w-md relative">
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: COLORS.trace,
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="FILTER REGISTER — title, stack, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glow-input mono w-full py-3"
            style={{
              fontSize: 12,
              letterSpacing: "0.06em",
              paddingLeft: 42,
              paddingRight: 20,
            }}
          />
        </div>

        {/* Grid */}
        {filteredProjects.length === 0 ? (
          <div
            className="sheet p-16 text-center mono"
            style={{ color: COLORS.trace, fontSize: 13, letterSpacing: "0.06em" }}
          >
            NO SHEETS MATCH &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p, i) => (
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
          borderTop: `1px solid ${COLORS.lineFaint}`,
          padding: "24px 0",
        }}
      >
        <div className="max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <span
            className="mono"
            style={{ fontSize: 11, color: COLORS.trace, letterSpacing: "0.08em" }}
          >
            © 2026 WASSIM JEBALI · DRAWING REGISTER
          </span>
          <Link
            to="/admin"
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: COLORS.trace,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.redline)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.trace)
            }
          >
            Admin Panel
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
