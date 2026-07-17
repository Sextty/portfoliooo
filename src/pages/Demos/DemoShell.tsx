import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Github } from "lucide-react";
import "./demos.css";

interface DemoShellProps {
  title: string;
  tagline: string;
  accent: string;
  github: string;
  bg: string;
  children: ReactNode;
}

// Shared chrome for every in-browser project demo: a slim top bar with a back
// link, the project identity, a "simulated" badge, and the GitHub link. Each
// demo keeps its own product look below (like Girls Boutique keeps its brand).
export default function DemoShell({
  title,
  tagline,
  accent,
  github,
  bg,
  children,
}: DemoShellProps) {
  return (
    <div style={{ minHeight: "100vh", background: bg, color: "#e6e9f0" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.25)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(6px)",
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/projects"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#9aa3b5",
            textDecoration: "none",
            fontSize: 13,
          }}
        >
          <ArrowLeft size={15} /> Portfolio
        </Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          <span style={{ color: accent, marginRight: 6 }}>●</span>
          {title}
        </span>
        <span className="demo-head-tagline" style={{ color: "#9aa3b5", fontSize: 12 }}>{tagline}</span>
        <span
          className="demo-badge"
          style={{
            marginLeft: "auto",
            fontSize: 10,
            letterSpacing: "0.12em",
            color: accent,
            border: `1px solid ${accent}`,
            borderRadius: 999,
            padding: "3px 10px",
            whiteSpace: "nowrap",
          }}
        >
          LIVE DEMO — RUNS IN YOUR BROWSER
        </span>
        <a
          href={github}
          target="_blank"
          rel="noreferrer"
          title="Full source on GitHub (real backend: docker compose up)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#e6e9f0",
            textDecoration: "none",
            fontSize: 13,
          }}
        >
          <Github size={16} /> Source
        </a>
      </header>
      {children}
    </div>
  );
}
