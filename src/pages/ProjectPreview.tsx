import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Github, Download, Play, Video } from "lucide-react";
import { motion } from "motion/react";
import { getProjects } from "@/utils/projectDb";
import { VideoModal } from "@/components/VideoModal";
import { COLORS, FONTS } from "@/theme/palette";

interface ProjectExtra {
  features: string[];
  codeFileName: string;
  codeSnippet: string;
  setupSteps: string[];
}

const PROJECT_EXTRAS: Record<string, ProjectExtra> = {
  "girls-boutique": {
    features: [
      "Product catalog with categories",
      "Shopping cart & checkout",
      "Wishlist management",
      "Admin dashboard",
      "MySQL database",
      "Responsive design",
    ],
    codeFileName: "schema.sql",
    codeSnippet: `-- Categories, Products, Users, Orders\nCREATE TABLE products (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(150) NOT NULL,\n  price DECIMAL(10,2) NOT NULL,\n  image_url VARCHAR(255) NOT NULL,\n  category_id INT NOT NULL,\n  FOREIGN KEY (category_id) REFERENCES categories(id)\n);`,
    setupSteps: [
      "Install XAMPP or MAMP and start Apache + MySQL",
      "Copy the girls/ folder to htdocs/",
      "Import schema.sql into phpMyAdmin",
      "Edit db.php with your MySQL credentials",
      "Visit http://localhost/girls/ in your browser",
    ]
  },
  "devpulse": {
    features: [
      "Real-time engineering metrics",
      "CI/CD pipeline insights",
      "Team velocity charts",
      "Automated performance reports",
      "ClickHouse high-performance queries",
      "Interactive D3.js visualizations",
    ],
    codeFileName: "analytics.py",
    codeSnippet: `# Fetch velocity metrics from ClickHouse\ndef get_velocity(team_id: str):\n    query = f"SELECT count() as velocity, date FROM cicd_pipelines WHERE team_id = '{team_id}' GROUP BY date"\n    return db.execute(query)`,
    setupSteps: [
      "Install Python 3.10+",
      "Install dependencies: pip install fastapi uvicorn clickhouse-driver",
      "Configure your .env with ClickHouse credentials",
      "Start backend server: uvicorn main:app --reload",
      "Run frontend development server: npm run dev",
    ]
  },
  "chatflow-ai": {
    features: [
      "Real-time message synchronization",
      "AI-powered smart replies",
      "Conversation threading",
      "Voice messages",
      "End-to-end encryption",
      "MongoDB database integrations",
    ],
    codeFileName: "server.js",
    codeSnippet: `// Socket.io connection for real-time messaging\nio.on('connection', (socket) => {\n  socket.on('message', async (data) => {\n    const response = await ai.generateSmartReply(data.text);\n    io.emit('reply', { text: response, to: data.sender });\n  });\n});`,
    setupSteps: [
      "Install Node.js (v18+)",
      "Run npm install to install dependencies",
      "Set up MongoDB & Redis instances",
      "Configure your OpenAI API key in .env",
      "Start application server: npm run dev",
    ]
  },
  "cloudvault": {
    features: [
      "Secure file uploads (AWS S3)",
      "Real-time document editing",
      "Granular permission management",
      "Version control history",
      "WebSockets notifications",
      "Database security roles",
    ],
    codeFileName: "s3.service.ts",
    codeSnippet: `// Upload file stream to AWS S3\nasync uploadFile(file: Express.Multer.File, userId: string) {\n  return this.s3.upload({\n    Bucket: process.env.AWS_BUCKET,\n    Key: \`users/\${userId}/\${file.originalname}\`,\n    Body: file.buffer,\n  }).promise();\n}`,
    setupSteps: [
      "Install Node.js & PostgreSQL",
      "Run npm install inside project folder",
      "Configure AWS credentials & S3 Bucket in .env",
      "Run prisma db push or migration",
      "Start NestJS API server: npm run start:dev",
    ]
  }
};

const highlightCode = (code: string) => {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Highlight comments (Trace Blue, italic)
  html = html.replace(
    /^(\s*)(\/\/|#|--)(.*)$/gm,
    `$1<span style="color: ${COLORS.trace}; opacity: 0.7; font-style: italic;">$2$3</span>`
  );

  // Keywords list — rendered in Redline
  const keywords = [
    "const", "function", "export", "default", "import", "from", "return", "def", "async", "await", "let", "var",
    "CREATE TABLE", "INT AUTO_INCREMENT PRIMARY KEY", "VARCHAR", "DECIMAL", "FOREIGN KEY", "REFERENCES",
    "SELECT", "count", "as", "FROM", "WHERE", "GROUP BY", "NOT NULL", "INT", "PRIMARY KEY", "AUTO_INCREMENT"
  ];

  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    html = html.replace(regex, `<span style="color: ${COLORS.redline}">${kw}</span>`);
  });

  // Strings between quotes (Print White)
  html = html.replace(
    /(['"`])(.*?)\1/g,
    `<span style="color: ${COLORS.print}">$1$2$1</span>`
  );

  return html;
};

/* Blueprint subfigure heading */
function FigHeading({ fig, title }: { fig: string; title: string }) {
  return (
    <div className="mb-4">
      <span
        className="mono"
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.16em",
          color: COLORS.redline,
        }}
      >
        {fig}
      </span>
      <span
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.16em",
          color: COLORS.trace,
          marginLeft: 8,
        }}
      >
        — {title}
      </span>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 24px",
  borderRadius: 2,
  fontSize: 12,
  fontWeight: 600,
  fontFamily: FONTS.mono,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  textDecoration: "none",
  cursor: "pointer",
  transition: "transform 0.2s, border-color 0.2s, color 0.2s, background 0.2s",
};

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
        className="sheet-grid"
        style={{
          background: COLORS.ground,
          color: COLORS.print,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <h1 className="display" style={{ fontSize: 24, color: COLORS.print }}>
          Sheet Not Found
        </h1>
        <p style={{ color: COLORS.trace }}>
          The drawing you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="mono"
          style={{
            color: COLORS.redline,
            textDecoration: "none",
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          ← Back to Portfolio
        </Link>
      </div>
    );
  }

  // The project's stored color survives only as a small index swatch.
  const indexColor = project.color || COLORS.redline;

  const extra = PROJECT_EXTRAS[project.id] || {
    features: [
      "Fully responsive layout across all device screens",
      "Interactive user interface with smooth transitions",
      "Optimized page load speeds and performance",
      "Clean, scalable, and modular codebase structure",
    ],
    codeFileName: "App.tsx",
    codeSnippet: `// Main entry point for ${project.title}\nimport React from "react";\n\nexport default function Main() {\n  return (\n    <div className="container">\n      <h1>Welcome to ${project.title}!</h1>\n      <p>Custom project description and layout.</p>\n    </div>\n  );\n}`,
    setupSteps: [
      "Clone the repository from GitHub",
      "Install project dependencies using npm install",
      "Create a .env file and set up configuration keys",
      "Start the development server using npm run dev",
      "Open http://localhost:5173/ in your browser",
    ]
  };

  return (
    <div
      className="sheet-grid"
      style={{
        background: COLORS.ground,
        color: COLORS.print,
        minHeight: "100vh",
      }}
    >
      <div className="drawing-frame hidden md:block" />

      {/* Nav */}
      <header
        style={{
          height: 64,
          background: "rgba(11,30,54,0.94)",
          borderBottom: `1px solid ${COLORS.line}`,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <Link
          to="/"
          className="mono"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: COLORS.trace,
            textDecoration: "none",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <ArrowLeft size={15} /> Back to Portfolio
        </Link>
      </header>

      <main
        style={{
          paddingTop: 104,
          paddingBottom: 60,
          paddingLeft: 24,
          paddingRight: 24,
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Sheet title block */}
          <div className="title-block grid grid-cols-2 sm:grid-cols-4 mb-8">
            <div className="tb-cell">
              <span className="tb-label">Drawing</span>
              <span className="tb-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span aria-hidden="true" style={{ width: 9, height: 9, background: indexColor, display: "inline-block" }} />
                {project.id.toUpperCase()}
              </span>
            </div>
            <div className="tb-cell">
              <span className="tb-label">Year</span>
              <span className="tb-value">{project.year}</span>
            </div>
            <div className="tb-cell">
              <span className="tb-label">Rev</span>
              <span className="tb-value">A</span>
            </div>
            <div className="tb-cell">
              <span className="tb-label">Scale</span>
              <span className="tb-value">1:1</span>
            </div>
          </div>

          <p className="fig-tag mb-3">FIG. 00 — SHEET DETAIL</p>
          <h1
            className="display"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              color: COLORS.print,
              marginBottom: 8,
              lineHeight: 1.05,
            }}
          >
            {project.title}
          </h1>

          <p
            style={{
              fontSize: 16,
              color: COLORS.trace,
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            {project.tagline}
          </p>

          {/* Tech tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
            {project.tags.map((t) => (
              <span
                key={t}
                className="mono"
                style={{
                  fontSize: 11,
                  color: COLORS.trace,
                  border: `1px solid ${COLORS.lineFaint}`,
                  padding: "4px 10px",
                  letterSpacing: "0.04em",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
            {project.runUrl && (() => {
              const isInternal = project.runUrl.startsWith("/");
              const buttonEl = (
                <span
                  className="btn-primary"
                  style={{ ...actionBtn, color: COLORS.field }}
                >
                  <Play size={15} fill="currentColor" /> Live Demo
                </span>
              );
              return isInternal ? (
                <Link to={project.runUrl} style={{ textDecoration: "none" }}>
                  {buttonEl}
                </Link>
              ) : (
                <a href={project.runUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  {buttonEl}
                </a>
              );
            })()}

            {(project.videoUrl || hasDbVideo) && (
              <button
                onClick={() => setPlayingVideo({ src: dbVideoUrl || project.videoUrl!, title: project.title, color: COLORS.redline })}
                className="btn-ghost"
                style={actionBtn}
              >
                <Video size={15} /> Watch Demo
              </button>
            )}

            {project.githubUrl && (
              <>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost"
                  style={actionBtn}
                >
                  <Github size={15} /> View Source
                </a>
                <a
                  href={`${project.githubUrl}/archive/main.zip`}
                  className="btn-ghost"
                  style={actionBtn}
                >
                  <Download size={15} /> Download ZIP
                </a>
              </>
            )}
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 15,
              color: COLORS.trace,
              lineHeight: 1.75,
              marginBottom: 40,
              paddingBottom: 40,
              borderBottom: `1px solid ${COLORS.lineFaint}`,
            }}
          >
            {project.description}
          </p>

          {/* Features */}
          <FigHeading fig="FIG. 01" title="Features" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 44,
            }}
          >
            {extra.features.map((f) => (
              <div
                key={f}
                className="sheet"
                style={{
                  padding: "12px 16px",
                  fontSize: 14,
                  color: COLORS.print,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: COLORS.redline, fontSize: 12 }}>+</span>
                {f}
              </div>
            ))}
          </div>

          {/* Code preview */}
          <FigHeading fig="FIG. 02" title={`Detail — ${extra.codeFileName}`} />
          <div
            style={{
              background: COLORS.field,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 2,
              overflow: "hidden",
              marginBottom: 44,
            }}
          >
            <div
              style={{
                padding: "10px 16px",
                borderBottom: `1px solid ${COLORS.lineFaint}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ width: 8, height: 8, background: COLORS.redline, display: "inline-block" }} />
              <span className="mono" style={{ fontSize: 11, color: COLORS.trace, marginLeft: 4, letterSpacing: "0.1em" }}>
                {extra.codeFileName}
              </span>
            </div>
            <pre
              className="mono"
              style={{ padding: 20, fontSize: 13, lineHeight: 1.8, color: COLORS.trace, overflowX: "auto" }}
              dangerouslySetInnerHTML={{ __html: highlightCode(extra.codeSnippet) }}
            />
          </div>

          {/* Setup */}
          <FigHeading fig="FIG. 03" title="Assembly — Run Locally" />
          {extra.setupSteps.map((step, i) => (
            <div
              key={i}
              className="sheet"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 18px",
                marginBottom: 10,
                fontSize: 14,
                color: COLORS.print,
                lineHeight: 1.6,
              }}
            >
              <span
                className="mono"
                style={{
                  width: 26,
                  height: 26,
                  border: `1px solid ${COLORS.redline}`,
                  color: COLORS.redline,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${COLORS.lineFaint}`,
          padding: "24px 0",
          textAlign: "center",
        }}
      >
        <p className="mono" style={{ fontSize: 11, color: COLORS.trace, letterSpacing: "0.08em" }}>
          BUILT WITH REACT & TYPESCRIPT —{" "}
          <Link to="/" style={{ color: COLORS.redline, textDecoration: "none" }}>
            WASSIM JEBALI&apos;S PORTFOLIO
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
