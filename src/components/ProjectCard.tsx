import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Github, Play, ArrowUpRight } from "lucide-react";
import { Project } from "@/utils/projectDb";
import { AppMockup, BrowserFrame } from "@/components/AppMockup";
import { tint } from "@/utils/color";
import { useSpotlight } from "@/utils/useSpotlight";
import { COLORS } from "@/theme/palette";

interface ProjectCardProps {
  project: Project;
  index: number;
  onWatchDemo: (src: string, title: string, color?: string) => void;
  /** "scroll" fades in when scrolled into view (landing page); "mount" animates immediately (work index) */
  appear?: "scroll" | "mount";
}

const iconButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 999,
  background: COLORS.paper,
  color: COLORS.slate,
  cursor: "pointer",
  transition: "color 0.2s, border-color 0.2s",
  textDecoration: "none",
};

const iconHoverEnter = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.color = COLORS.cobalt;
  e.currentTarget.style.borderColor = COLORS.cobalt;
};
const iconHoverLeave = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.color = COLORS.slate;
  e.currentTarget.style.borderColor = COLORS.line;
};

export function ProjectCard({
  project,
  index,
  onWatchDemo,
  appear = "scroll",
}: ProjectCardProps) {
  const [hasDbVideo, setHasDbVideo] = useState(false);
  const [dbVideoUrl, setDbVideoUrl] = useState<string | null>(null);
  const spotlight = useSpotlight();

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
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.6, delay: (index % 3) * 0.08 },
        }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: (index % 6) * 0.06 },
        };

  const isInternalDemo = project.runUrl?.startsWith("/");
  const frameUrl = isInternalDemo
    ? `portfoliowassim.vercel.app${project.runUrl}`
    : project.githubUrl
      ? project.githubUrl.replace("https://", "")
      : project.title.toLowerCase();

  return (
    <motion.div {...entrance} className="h-full">
      <div
        onMouseMove={spotlight}
        className="sheet tech-hover spotlight overflow-hidden relative h-full flex flex-col"
      >
        {/* Product miniature on a tinted stage */}
        <Link
          to={`/project/${project.id}`}
          aria-label={`Open ${project.title} case study`}
          style={{
            display: "block",
            padding: "22px 22px 0",
            background: `linear-gradient(160deg, ${tint(project.color, 0.12)}, ${tint(project.color, 0.03)})`,
            borderBottom: `1px solid ${COLORS.lineFaint}`,
          }}
        >
          <BrowserFrame
            url={frameUrl}
            flat
            style={{
              borderRadius: "12px 12px 0 0",
              borderBottom: "none",
              boxShadow: "0 -1px 0 rgba(15,18,34,0.02)",
            }}
          >
            <AppMockup projectId={project.id} color={project.color} />
          </BrowserFrame>
        </Link>

        <div className="p-6 flex flex-col flex-grow">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <Link to={`/project/${project.id}`} style={{ textDecoration: "none" }}>
              <h3
                className="display"
                style={{
                  fontSize: "1.2rem",
                  color: COLORS.ink,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLORS.cobalt;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLORS.ink;
                }}
              >
                {project.title}
              </h3>
            </Link>
            <span
              className="mono"
              style={{ fontSize: 11, color: "#9AA2B8", marginTop: 6 }}
            >
              {project.year}
            </span>
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: COLORS.slate, marginTop: 2 }}>
            {project.tagline}
          </p>

          {/* Description */}
          <p
            style={{
              color: COLORS.slate,
              fontSize: 14,
              lineHeight: 1.65,
              margin: "0.85rem 0 1.1rem",
            }}
          >
            {project.description}
          </p>

          {/* Stack */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>

          {/* Footer actions */}
          <div
            className="flex items-center justify-between gap-3 mt-auto pt-4"
            style={{ borderTop: `1px solid ${COLORS.lineFaint}` }}
          >
            <Link
              to={`/project/${project.id}`}
              className="flex items-center gap-1"
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: COLORS.cobalt,
                textDecoration: "none",
              }}
            >
              Case study <ArrowUpRight size={14} />
            </Link>

            <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={iconButtonStyle}
                  onMouseEnter={iconHoverEnter}
                  onMouseLeave={iconHoverLeave}
                  title="View source code"
                  aria-label={`View source code of ${project.title} on GitHub`}
                >
                  <Github size={15} />
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
                  title="Watch demo video"
                  aria-label={`Watch demo video of ${project.title}`}
                >
                  <Play size={14} fill="currentColor" />
                </button>
              )}

              {project.runUrl &&
                (isInternalDemo ? (
                  <Link
                    to={project.runUrl}
                    className="btn-primary"
                    style={{
                      padding: "8px 15px",
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                    title="Run this project in your browser"
                    aria-label={`Open live demo of ${project.title}`}
                  >
                    Live demo
                  </Link>
                ) : (
                  <a
                    href={project.runUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{
                      padding: "8px 15px",
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                    title="Run this project in your browser"
                    aria-label={`Open live demo of ${project.title}`}
                  >
                    Live demo
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
