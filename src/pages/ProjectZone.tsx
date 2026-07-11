import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { getProjects, Project } from "@/utils/projectDb";
import { Github, Play, ArrowLeft, ExternalLink } from "lucide-react";
import { VideoModal } from "@/components/VideoModal";

function ProjectCard({
  project,
  index,
  onWatchDemo,
}: {
  project: Project;
  index: number;
  onWatchDemo: (src: string, title: string, color?: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasDbVideo, setHasDbVideo] = useState(false);
  const [dbVideoUrl, setDbVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const checkVideo = async () => {
      try {
        const { getVideo } = await import("@/utils/videoDb");
        const blob = await getVideo(project.id);
        if (blob && active) {
          setHasDbVideo(true);
          const url = URL.createObjectURL(blob);
          setDbVideoUrl(url);
        }
      } catch (e) {
        console.error("IndexedDB error", e);
      }
    };
    checkVideo();
    return () => {
      active = false;
      if (dbVideoUrl) {
        URL.revokeObjectURL(dbVideoUrl);
      }
    };
  }, [project.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -9;
    const rotY = ((x - cx) / cx) * 9;
    el.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
    el.style.setProperty("--my", `${(y / rect.height) * 100}%`);
    el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <div
        ref={cardRef}
        className="tilt-card glass rounded-2xl overflow-hidden cursor-pointer relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="card-shine" />

        {/* Top color bar */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${project.color}, ${project.color}44)`,
          }}
        />

        {project.image && (
          <div className="w-full h-48 overflow-hidden relative border-b border-border">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}

        <div className="p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: project.color,
                    letterSpacing: "0.12em",
                  }}
                >
                  {project.year}
                </span>
              </div>
              <Link to={`/project/${project.id}`} style={{ textDecoration: "none" }}>
                <h3
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "#e8ecf4",
                    letterSpacing: "-0.02em",
                    cursor: "pointer",
                    transition: "color 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = project.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#e8ecf4";
                  }}
                >
                  {project.title}
                </h3>
              </Link>
              <p
                style={{
                  fontSize: 12,
                  color: project.color,
                  marginTop: 2,
                }}
              >
                {project.tagline}
              </p>
            </div>

            <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748b",
                    transition: "color 0.25s, background 0.25s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#e8ecf4";
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#64748b";
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.04)";
                  }}
                  title="View Source Code"
                >
                  <Github size={15} />
                </a>
              )}

              {(project.videoUrl || hasDbVideo) && (
                <button
                  onClick={() => onWatchDemo(dbVideoUrl || project.videoUrl!, project.title, project.color)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `${project.color}15`,
                    border: `1px solid ${project.color}30`,
                    color: project.color,
                    cursor: "pointer",
                    transition: "background 0.25s, box-shadow 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${project.color}28`;
                    e.currentTarget.style.boxShadow = `0 0 16px ${project.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${project.color}15`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  title="Watch Demo Video"
                >
                  <Play size={15} fill="currentColor" />
                </button>
              )}

              {project.runUrl && (() => {
                const isInternal = project.runUrl.startsWith("/");
                const btnStyle = {
                  display: "flex" as const,
                  alignItems: "center" as const,
                  justifyContent: "center" as const,
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#64748b",
                  transition: "color 0.25s, background 0.25s",
                  textDecoration: "none" as const,
                };
                const hoverEnter = (e: any) => {
                  e.currentTarget.style.color = "#e8ecf4";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                };
                const hoverLeave = (e: any) => {
                  e.currentTarget.style.color = "#64748b";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                };
                return isInternal ? (
                  <Link to={project.runUrl} style={btnStyle} onMouseEnter={hoverEnter} onMouseLeave={hoverLeave} title="Live Demo">
                    <ExternalLink size={15} />
                  </Link>
                ) : (
                  <a href={project.runUrl} target="_blank" rel="noreferrer" style={btnStyle} onMouseEnter={hoverEnter} onMouseLeave={hoverLeave} title="Live Demo">
                    <ExternalLink size={15} />
                  </a>
                );
              })()}
            </div>
          </div>

          {/* Description */}
          <p
            style={{
              color: "#64748b",
              fontSize: 14,
              lineHeight: 1.75,
              marginBottom: "1.5rem",
            }}
          >
            {project.description}
          </p>

          {/* Stack */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span
                key={t}
                className="mono"
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  letterSpacing: "0.03em",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectZone() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [playingVideo, setPlayingVideo] = useState<{ src: string; title: string; color?: string } | null>(null);

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
      style={{
        background: "#060912",
        color: "#e8ecf4",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
      className="dot-grid"
    >
      {/* Navbar / Header */}
      <header
        style={{
          height: 72,
          background: "rgba(6,9,18,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(99,102,241,0.12)",
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16"
      >
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                color: "white",
              }}
            >
              WJ
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#e8ecf4",
            }}
          >
            Project Zone
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-20 px-8 md:px-16 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="mb-12">
          <p className="section-tag mb-3">◈ &nbsp;Directory</p>
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "#e8ecf4",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            All Shipped Projects
          </h1>
          <div className="gradient-line mt-5 max-w-sm" />
        </div>

        {/* Search */}
        <div className="mb-10 max-w-md">
          <input
            type="text"
            placeholder="Search projects by title, stack, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glow-input w-full px-5 py-3 rounded-xl"
            style={{ fontSize: 14 }}
          />
        </div>

        {/* Grid */}
        {filteredProjects.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center text-muted-foreground">
            No projects found matching &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} onWatchDemo={(src, title, color) => setPlayingVideo({ src, title, color })} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(99,102,241,0.1)",
          padding: "30px 0",
          background: "#060912",
        }}
      >
        <div className="max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <span style={{ fontSize: 13, color: "#4a5568" }}>
            © 2026 Wassim Jebali. Project Zone.
          </span>
          <Link
            to="/admin"
            style={{
              fontSize: 13,
              color: "#4a5568",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#6366f1")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#4a5568")
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
