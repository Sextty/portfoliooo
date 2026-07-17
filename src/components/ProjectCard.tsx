import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Github, Play, Zap, ArrowUpRight } from "lucide-react";
import { Project } from "@/utils/projectDb";
import { COLORS } from "@/theme/palette";

interface ProjectCardProps {
  project: Project;
  index: number;
  onWatchDemo: (src: string, title: string, color?: string) => void;
  /** "scroll" fades in when scrolled into view (landing page); "mount" animates immediately (project index) */
  appear?: "scroll" | "mount";
}

const iconButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 2,
  background: "transparent",
  color: COLORS.trace,
  cursor: "pointer",
  transition: "color 0.2s, border-color 0.2s",
  textDecoration: "none",
};

const iconHoverEnter = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.color = COLORS.redline;
  e.currentTarget.style.borderColor = COLORS.redline;
};
const iconHoverLeave = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.color = COLORS.trace;
  e.currentTarget.style.borderColor = COLORS.line;
};

// Labeled "run it now" button — the card's primary action when a demo exists.
const liveDemoButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  height: 32,
  padding: "0 10px",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.12em",
  border: `1px solid ${COLORS.redline}`,
  borderRadius: 2,
  background: "transparent",
  color: COLORS.redline,
  cursor: "pointer",
  transition: "background 0.2s, color 0.2s",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const liveDemoHoverEnter = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.background = COLORS.redline;
  e.currentTarget.style.color = "#0B1E36";
};
const liveDemoHoverLeave = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.background = "transparent";
  e.currentTarget.style.color = COLORS.redline;
};

export function ProjectCard({
  project,
  index,
  onWatchDemo,
  appear = "scroll",
}: ProjectCardProps) {
  const [hasDbVideo, setHasDbVideo] = useState(false);
  const [dbVideoUrl, setDbVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // Track the created URL locally so cleanup revokes the right one
    // (state in the closure would be stale by the time cleanup runs).
    let createdUrl: string | null = null;
    const checkVideo = async () => {
      try {
        const { getVideo } = await import("@/utils/videoDb");
        const blob = await getVideo(project.id);
        if (blob && active) {
          createdUrl = URL.createObjectURL(blob);
          setHasDbVideo(true);
          setDbVideoUrl(createdUrl);
        }
      } catch (e) {
        console.error("IndexedDB error", e);
      }
    };
    checkVideo();
    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [project.id]);

  const entrance =
    appear === "scroll"
      ? {
          initial: { opacity: 0, y: 50 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.7, delay: index * 0.12 },
        }
      : {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: index * 0.08 },
        };

  const figNo = String(index + 1).padStart(2, "0");

  return (
    <motion.div {...entrance} className="h-full">
      <div className="sheet tech-hover overflow-hidden relative h-full flex flex-col">
        {/* Sheet header strip */}
        <div
          className="mono flex items-center justify-between px-5 py-2.5"
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            borderBottom: `1px solid ${COLORS.lineFaint}`,
          }}
        >
          <span className="flex items-center gap-2">
            <span style={{ color: COLORS.redline, fontWeight: 600 }}>
              FIG. {figNo}
            </span>
            {/* Revision color code from the project's accent */}
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                background: project.color,
                display: "inline-block",
              }}
            />
          </span>
          <span style={{ color: COLORS.trace }}>{project.year}</span>
        </div>

        {project.image && (
          <div
            className="w-full h-48 overflow-hidden relative"
            style={{ borderBottom: `1px solid ${COLORS.lineFaint}` }}
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              style={{ filter: "saturate(0.9)" }}
            />
          </div>
        )}

        <div className="p-6 flex flex-col flex-grow">
          {/* Title */}
          <Link to={`/project/${project.id}`} style={{ textDecoration: "none" }}>
            <h3
              className="display"
              style={{
                fontWeight: 700,
                fontSize: "1.15rem",
                letterSpacing: "0.03em",
                color: COLORS.print,
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.redline;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = COLORS.print;
              }}
            >
              {project.title}
            </h3>
          </Link>
          <p
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.06em",
              color: COLORS.trace,
              marginTop: 4,
            }}
          >
            {project.tagline}
          </p>

          {/* Description */}
          <p
            style={{
              color: COLORS.trace,
              fontSize: 14,
              lineHeight: 1.75,
              margin: "1rem 0 1.25rem",
            }}
          >
            {project.description}
          </p>

          {/* Stack */}
          <div className="flex flex-wrap gap-2 mb-5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="mono"
                style={{
                  fontSize: 10,
                  color: COLORS.trace,
                  border: `1px solid ${COLORS.lineFaint}`,
                  padding: "3px 8px",
                  letterSpacing: "0.04em",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Footer: open sheet + actions */}
          <div
            className="flex items-center justify-between mt-auto pt-4"
            style={{ borderTop: `1px solid ${COLORS.lineFaint}` }}
          >
            <Link
              to={`/project/${project.id}`}
              className="mono flex items-center gap-1.5"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: COLORS.redline,
                textDecoration: "none",
              }}
            >
              Open Sheet <ArrowUpRight size={13} />
            </Link>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={iconButtonStyle}
                  onMouseEnter={iconHoverEnter}
                  onMouseLeave={iconHoverLeave}
                  title="View Source Code"
                  aria-label={`View source code of ${project.title} on GitHub`}
                >
                  <Github size={14} />
                </a>
              )}

              {(project.videoUrl || hasDbVideo) && (
                <button
                  onClick={() =>
                    onWatchDemo(
                      dbVideoUrl || project.videoUrl!,
                      project.title,
                      project.color
                    )
                  }
                  style={iconButtonStyle}
                  onMouseEnter={iconHoverEnter}
                  onMouseLeave={iconHoverLeave}
                  title="Watch Demo Video"
                  aria-label={`Watch demo video of ${project.title}`}
                >
                  <Play size={14} fill="currentColor" />
                </button>
              )}

              {project.runUrl &&
                (project.runUrl.startsWith("/") ? (
                  <Link
                    to={project.runUrl}
                    className="mono"
                    style={liveDemoButtonStyle}
                    onMouseEnter={liveDemoHoverEnter}
                    onMouseLeave={liveDemoHoverLeave}
                    title="Run this project in your browser"
                    aria-label={`Open live demo of ${project.title}`}
                  >
                    <Zap size={12} /> LIVE DEMO
                  </Link>
                ) : (
                  <a
                    href={project.runUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mono"
                    style={liveDemoButtonStyle}
                    onMouseEnter={liveDemoHoverEnter}
                    onMouseLeave={liveDemoHoverLeave}
                    title="Run this project in your browser"
                    aria-label={`Open live demo of ${project.title}`}
                  >
                    <Zap size={12} /> LIVE DEMO
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
