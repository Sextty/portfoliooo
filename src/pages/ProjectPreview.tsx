import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Github, Download, Play, Video } from "lucide-react";
import { motion } from "motion/react";
import { getProjects } from "@/utils/projectDb";
import { VideoModal } from "@/components/VideoModal";

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

const highlightCode = (code: string, color: string = "#ec4899") => {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Highlight comments
  html = html.replace(/^(\s*)(\/\/|#|--)(.*)$/gm, '$1<span style="color: #64748b; font-style: italic;">$2$3</span>');

  // Keywords list
  const keywords = [
    "const", "function", "export", "default", "import", "from", "return", "def", "async", "await", "let", "var",
    "CREATE TABLE", "INT AUTO_INCREMENT PRIMARY KEY", "VARCHAR", "DECIMAL", "FOREIGN KEY", "REFERENCES",
    "SELECT", "count", "as", "FROM", "WHERE", "GROUP BY", "NOT NULL", "INT", "PRIMARY KEY", "AUTO_INCREMENT"
  ];

  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    html = html.replace(regex, `<span style="color: ${color}">${kw}</span>`);
  });

  // Strings between quotes
  html = html.replace(/(['"`])(.*?)\1/g, '<span style="color: #10b981">$1$2$1</span>');

  return html;
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
  }, [project?.id]);

  if (!project) {
    return (
      <div
        style={{
          background: "#060912",
          color: "#e8ecf4",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800 }}>Project Not Found</h1>
        <p style={{ color: "#94a3b8" }}>The project you are looking for does not exist.</p>
        <Link to="/" style={{ color: "#ec4899", textDecoration: "none", fontSize: 14 }}>
          Back to Portfolio
        </Link>
      </div>
    );
  }

  const projectColor = project.color || "#ec4899";

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
      style={{
        background: "#060912",
        color: "#e8ecf4",
        minHeight: "100vh",
      }}
    >
      {/* Nav */}
      <header
        style={{
          height: 64,
          background: "rgba(6,9,18,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${projectColor}20`,
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#94a3b8",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to Portfolio
        </Link>
      </header>

      <main
        style={{
          paddingTop: 96,
          paddingBottom: 60,
          paddingLeft: 24,
          paddingRight: 24,
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: projectColor,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              border: `1px solid ${projectColor}40`,
              background: `${projectColor}15`,
              padding: "4px 12px",
              borderRadius: 16,
              display: "inline-block",
              marginBottom: 16,
            }}
          >
            ✦ Project Preview
          </span>

          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              color: "#f8fafc",
              marginBottom: 8,
              letterSpacing: "-0.03em",
            }}
          >
            {project.title}
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#94a3b8",
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            {project.tagline}
          </p>

          {/* Tech tags */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 32,
            }}
          >
            {project.tags.map((t) => (
              <span
                key={t}
                className="mono"
                style={{
                  fontSize: 12,
                  color: projectColor,
                  background: `${projectColor}15`,
                  border: `1px solid ${projectColor}30`,
                  padding: "4px 12px",
                  borderRadius: 6,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            {project.runUrl && (() => {
              const isInternal = project.runUrl.startsWith("/");
              const buttonEl = (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 28px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    background: `linear-gradient(135deg, ${projectColor}, ${projectColor}cc)`,
                    color: "white",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${projectColor}55`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  <Play size={16} fill="white" /> Live Demo
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
                onClick={() => setPlayingVideo({ src: dbVideoUrl || project.videoUrl!, title: project.title, color: projectColor })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 28px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  border: `1px solid ${projectColor}50`,
                  background: `${projectColor}15`,
                  color: projectColor,
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.background = `${projectColor}25`;
                  e.currentTarget.style.boxShadow = `0 8px 24px ${projectColor}35`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.background = `${projectColor}15`;
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <Video size={16} /> Watch Demo
              </button>
            )}

            {project.githubUrl && (
              <>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 28px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#94a3b8",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = projectColor;
                    (e.currentTarget as HTMLAnchorElement).style.color = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                  }}
                >
                  <Github size={16} /> View Source Code
                </a>
                <a
                  href={`${project.githubUrl}/archive/main.zip`}
                  className="btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 28px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#94a3b8",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = projectColor;
                    (e.currentTarget as HTMLAnchorElement).style.color = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                  }}
                >
                  <Download size={16} /> Download ZIP
                </a>
              </>
            )}
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 15,
              color: "#94a3b8",
              lineHeight: 1.75,
              marginBottom: 36,
            }}
          >
            {project.description}
          </p>

          {/* Features */}
          <h3
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: projectColor,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 14,
            }}
          >
            ✦ Features
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 40,
            }}
          >
            {extra.features.map((f) => (
              <div
                key={f}
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8,
                  fontSize: 14,
                  color: "#cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: projectColor, fontSize: 12 }}>✦</span>
                {f}
              </div>
            ))}
          </div>

          {/* Code preview */}
          <h3
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: projectColor,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 14,
            }}
          >
            🖥 Code Preview
          </h3>
          <div
            style={{
              background: "rgba(15,15,25,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 40,
            }}
          >
            <div
              style={{
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span className="mono" style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>{extra.codeFileName}</span>
            </div>
            <pre
              className="mono"
              style={{ padding: 20, fontSize: 13, lineHeight: 1.8, color: "#94a3b8", overflowX: "auto" }}
              dangerouslySetInnerHTML={{ __html: highlightCode(extra.codeSnippet, projectColor) }}
            />
          </div>

          {/* Setup */}
          <h3
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: projectColor,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 14,
            }}
          >
            ⚡ Run Locally
          </h3>
          {extra.setupSteps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 18px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                marginBottom: 10,
                fontSize: 14,
                color: "#cbd5e1",
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: `${projectColor}25`,
                  color: projectColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "24px 0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, color: "#4a5568" }}>
          Built with React & TypeScript —{" "}
          <Link to="/" style={{ color: projectColor, textDecoration: "none" }}>
            Wassim Jebali's Portfolio
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
