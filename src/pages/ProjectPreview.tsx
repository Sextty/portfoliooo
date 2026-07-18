import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Github, Download, Play, Video, Check } from "lucide-react";
import { motion } from "motion/react";
import { getProjects } from "@/utils/projectDb";
import { VideoModal } from "@/components/VideoModal";
import { AppMockup, BrowserFrame } from "@/components/AppMockup";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { getCaseStudy } from "@/data/caseStudies";
import { tint } from "@/utils/color";
import { COLORS } from "@/theme/palette";


/* Code highlighting for the dark code panel */
const CODE_COLORS = {
  base: "#B7C0D8",
  comment: "#6B7490",
  keyword: "#93A8FF",
  string: "#8FE3C0",
};

const highlightCode = (code: string) => {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments and strings are stashed as placeholders first so the keyword
  // pass can never match text inside an already-inserted <span> attribute.
  const tokens: string[] = [];
  const stash = (markup: string) => {
    tokens.push(markup);
    return `\uE000${tokens.length - 1}\uE000`;
  };

  html = html.replace(
    /^(\s*)(\/\/|#|--)(.*)$/gm,
    (_m, ws: string, marker: string, rest: string) =>
      ws +
      stash(
        `<span style="color: ${CODE_COLORS.comment}; font-style: italic;">${marker}${rest}</span>`
      )
  );

  html = html.replace(/(['"`])(.*?)\1/g, (m) =>
    stash(`<span style="color: ${CODE_COLORS.string}">${m}</span>`)
  );

  const keywords = [
    "const", "function", "export", "default", "import", "from", "return", "def", "async", "await", "let", "var",
    "CREATE TABLE", "INT AUTO_INCREMENT PRIMARY KEY", "VARCHAR", "DECIMAL", "FOREIGN KEY", "REFERENCES",
    "SELECT", "count", "as", "FROM", "WHERE", "GROUP BY", "NOT NULL", "INT", "PRIMARY KEY", "AUTO_INCREMENT"
  ];

  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    html = html.replace(regex, `<span style="color: ${CODE_COLORS.keyword}">${kw}</span>`);
  });

  html = html.replace(/\uE000(\d+)\uE000/g, (_m, i: string) => tokens[Number(i)]);

  return html;
};

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="eyebrow" style={{ marginBottom: 16 }}>
      {text}
    </p>
  );
}

export default function ProjectPreview() {
  const { id } = useParams<{ id: string }>();
  const projects = getProjects();
  const project = projects.find((p) => p.id === id);

  const [hasDbVideo, setHasDbVideo] = useState(false);
  const [dbVideoUrl, setDbVideoUrl] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<{ src: string; title: string; color?: string } | null>(null);

  useEffect(() => {
    if (!project) return;
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
  }, [project?.id]);

  if (!project) {
    return (
      <div
        style={{
          background: COLORS.porcelain,
          color: COLORS.ink,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1 className="display" style={{ fontSize: 28, color: COLORS.ink }}>
          Project not found
        </h1>
        <p style={{ color: COLORS.slate, fontSize: 15 }}>
          This project doesn&apos;t exist — it may have been renamed or removed.
        </p>
        <Link
          to="/projects"
          className="btn-primary"
          style={{ padding: "11px 22px", fontSize: 14, textDecoration: "none", marginTop: 8 }}
        >
          Browse all projects
        </Link>
      </div>
    );
  }

  const study = getCaseStudy(project);

  const isInternalDemo = project.runUrl?.startsWith("/");

  return (
    <div
      style={{
        background: COLORS.porcelain,
        color: COLORS.ink,
        minHeight: "100vh",
      }}
    >
      {/* Nav */}
      <header
        style={{
          height: 64,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${COLORS.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <Link
          to="/projects"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: COLORS.slate,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.ink)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.slate)
          }
        >
          <ArrowLeft size={16} /> All projects
        </Link>
        <span
          className="mono"
          style={{ fontSize: 11, color: "#9AA2B8", letterSpacing: "0.06em" }}
        >
          CASE STUDY
        </span>
      </header>

      <main
        style={{
          paddingTop: 120,
          paddingBottom: 60,
          paddingLeft: 24,
          paddingRight: 24,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <h1
            className="display"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              letterSpacing: "-0.03em",
              color: COLORS.ink,
              marginBottom: 10,
              lineHeight: 1.04,
            }}
          >
            {project.title}
          </h1>

          <p
            style={{
              fontSize: 17,
              color: COLORS.slate,
              marginBottom: 22,
              lineHeight: 1.6,
              maxWidth: 620,
            }}
          >
            {project.tagline}
          </p>

          {/* Tech tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 26 }}>
            {project.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
            {project.runUrl &&
              (isInternalDemo ? (
                <Link
                  to={project.runUrl}
                  className="btn-primary"
                  style={{ padding: "12px 24px", fontSize: 14.5, textDecoration: "none" }}
                >
                  <Play size={15} fill="currentColor" /> Launch live demo
                </Link>
              ) : (
                <a
                  href={project.runUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ padding: "12px 24px", fontSize: 14.5, textDecoration: "none" }}
                >
                  <Play size={15} fill="currentColor" /> Launch live demo
                </a>
              ))}

            {(project.videoUrl || hasDbVideo) && (
              <button
                onClick={() => setPlayingVideo({ src: dbVideoUrl || project.videoUrl!, title: project.title, color: project.color })}
                className="btn-ghost"
                style={{ padding: "12px 24px", fontSize: 14.5 }}
              >
                <Video size={15} /> Watch video
              </button>
            )}

            {project.githubUrl && (
              <>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost"
                  style={{ padding: "12px 24px", fontSize: 14.5, textDecoration: "none" }}
                >
                  <Github size={15} /> View source
                </a>
                <a
                  href={`${project.githubUrl}/archive/main.zip`}
                  className="btn-ghost"
                  style={{ padding: "12px 24px", fontSize: 14.5, textDecoration: "none" }}
                >
                  <Download size={15} /> Download ZIP
                </a>
              </>
            )}
          </div>

          {/* Product frame */}
          <div style={{ position: "relative", marginBottom: 44 }}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-10% -6%",
                background: `radial-gradient(closest-side, ${tint(project.color, 0.14)}, transparent 72%)`,
                pointerEvents: "none",
              }}
            />
            <BrowserFrame
              url={
                isInternalDemo
                  ? `portfoliowassim.vercel.app${project.runUrl}`
                  : project.githubUrl?.replace("https://", "") || project.title.toLowerCase()
              }
              style={{ position: "relative" }}
            >
              <AppMockup projectId={project.id} color={project.color} />
            </BrowserFrame>
          </div>

          {/* Fact strip */}
          <div className="title-block grid grid-cols-2 sm:grid-cols-4 mb-12">
            <div className="tb-cell">
              <span className="tb-label">Year</span>
              <span className="tb-value">{project.year}</span>
            </div>
            <div className="tb-cell">
              <span className="tb-label">Stack</span>
              <span className="tb-value">{project.tags.length} technologies</span>
            </div>
            <div className="tb-cell">
              <span className="tb-label">Demo</span>
              <span className="tb-value">
                {project.runUrl ? (isInternalDemo ? "Runs in browser" : "External") : "Source only"}
              </span>
            </div>
            <div className="tb-cell">
              <span className="tb-label">Status</span>
              <span className="tb-value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  aria-hidden="true"
                  style={{ width: 7, height: 7, borderRadius: 999, background: COLORS.mint, display: "inline-block" }}
                />
                Shipped
              </span>
            </div>
          </div>

          {/* The story: problem → solution */}
          <div className="grid md:grid-cols-2" style={{ gap: 28, marginBottom: 48 }}>
            <div>
              <SectionLabel text="The problem" />
              <p style={{ fontSize: 15.5, color: COLORS.slate, lineHeight: 1.8 }}>
                {study.problem}
              </p>
            </div>
            <div>
              <SectionLabel text="The solution" />
              <p style={{ fontSize: 15.5, color: COLORS.slate, lineHeight: 1.8 }}>
                {study.solution}
              </p>
            </div>
          </div>

          {/* Features */}
          <SectionLabel text="What's inside" />
          <div
            className="grid sm:grid-cols-2"
            style={{ gap: 10, marginBottom: 44 }}
          >
            {study.features.map((f) => (
              <div
                key={f}
                className="sheet"
                style={{
                  padding: "13px 16px",
                  fontSize: 14.5,
                  color: COLORS.ink,
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: tint(project.color, 0.12),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={12} style={{ color: project.color }} />
                </span>
                {f}
              </div>
            ))}
          </div>

          {/* Code preview */}
          {/* Architecture */}
          <SectionLabel text="Architecture" />
          <div style={{ marginBottom: 44 }}>
            <ArchitectureDiagram
              architecture={study.architecture}
              color={project.color}
            />
          </div>

          <SectionLabel text={`From the codebase — ${study.codeFileName}`} />
          <div
            style={{
              background: "#141830",
              border: "1px solid #232848",
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 44,
              boxShadow: "0 20px 50px -20px rgba(15,18,34,0.35)",
            }}
          >
            <div
              style={{
                padding: "12px 18px",
                borderBottom: "1px solid #232848",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ display: "flex", gap: 5 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: "#3D4368", display: "inline-block" }} />
                <span style={{ width: 9, height: 9, borderRadius: 999, background: "#3D4368", display: "inline-block" }} />
                <span style={{ width: 9, height: 9, borderRadius: 999, background: project.color, display: "inline-block" }} />
              </span>
              <span className="mono" style={{ fontSize: 11.5, color: "#8A93B8", marginLeft: 6, letterSpacing: "0.04em" }}>
                {study.codeFileName}
              </span>
            </div>
            <pre
              className="mono"
              style={{ padding: 22, fontSize: 13, lineHeight: 1.8, color: CODE_COLORS.base, overflowX: "auto", margin: 0 }}
              dangerouslySetInnerHTML={{ __html: highlightCode(study.codeSnippet) }}
            />
          </div>

          {/* Engineering decisions */}
          <SectionLabel text="Engineering decisions" />
          <div className="grid md:grid-cols-3" style={{ gap: 12, marginBottom: 44 }}>
            {study.decisions.map((d) => (
              <div key={d.title} className="sheet" style={{ padding: "20px 22px" }}>
                <div
                  style={{
                    width: 26,
                    height: 3,
                    borderRadius: 2,
                    background: project.color,
                    marginBottom: 14,
                  }}
                />
                <h3
                  className="display"
                  style={{
                    fontSize: "1.02rem",
                    color: COLORS.ink,
                    letterSpacing: "-0.01em",
                    marginBottom: 8,
                    lineHeight: 1.3,
                  }}
                >
                  {d.title}
                </h3>
                <p style={{ fontSize: 13.5, color: COLORS.slate, lineHeight: 1.7 }}>
                  {d.body}
                </p>
              </div>
            ))}
          </div>

          {/* Roadmap */}
          <SectionLabel text="Where it goes next" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 44 }}>
            {study.roadmap.map((item) => (
              <div
                key={item.label}
                className="sheet"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "14px 18px",
                }}
              >
                <span style={{ fontSize: 14.5, color: COLORS.ink, fontWeight: 500 }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 999,
                    padding: "4px 12px",
                    whiteSpace: "nowrap",
                    color: item.status === "planned" ? COLORS.cobalt : "#B45309",
                    background:
                      item.status === "planned"
                        ? COLORS.cobaltSoft
                        : "rgba(245,158,11,0.12)",
                  }}
                >
                  {item.status === "planned" ? "Planned" : "Exploring"}
                </span>
              </div>
            ))}
          </div>

          {/* Setup */}
          <SectionLabel text="Run it locally" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {study.setupSteps.map((step, i) => (
              <div
                key={i}
                className="sheet"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "15px 18px",
                  fontSize: 14.5,
                  color: COLORS.ink,
                  lineHeight: 1.6,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    background: COLORS.cobaltSoft,
                    color: COLORS.cobalt,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12.5,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          {/* Conversion CTA */}
          <div
            style={{
              background: COLORS.ink,
              borderRadius: 24,
              padding: "clamp(2rem, 4vw, 3rem)",
              marginTop: 56,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-40%",
                right: "-10%",
                width: "50%",
                height: "120%",
                background: `radial-gradient(closest-side, ${tint(project.color, 0.28)}, transparent 75%)`,
                pointerEvents: "none",
              }}
            />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2
                  className="display"
                  style={{
                    fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)",
                    letterSpacing: "-0.02em",
                    color: COLORS.darkText,
                    lineHeight: 1.15,
                    marginBottom: 8,
                  }}
                >
                  Want a product built like this?
                </h2>
                <p style={{ fontSize: 14.5, color: COLORS.darkMuted, maxWidth: 420, lineHeight: 1.65 }}>
                  Frontend, API, and database — designed and shipped as one
                  coherent build. Tell me what you&apos;re making.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  to="/#contact"
                  className="btn-on-dark"
                  style={{ padding: "12px 24px", fontSize: 14.5, textDecoration: "none" }}
                >
                  Start a project
                </Link>
                <Link
                  to="/projects"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 24px",
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: COLORS.darkText,
                    border: `1px solid ${COLORS.darkLine}`,
                    borderRadius: 999,
                    textDecoration: "none",
                  }}
                >
                  See more work
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${COLORS.line}`,
          background: COLORS.paper,
          padding: "24px 0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13.5, color: COLORS.slate }}>
          Built with React & TypeScript —{" "}
          <Link to="/" style={{ color: COLORS.cobalt, textDecoration: "none", fontWeight: 600 }}>
            Wassim Jebali
          </Link>
        </p>
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
