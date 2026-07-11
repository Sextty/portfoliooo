import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";

interface CodeLine {
  text: string;
  color?: string;
  prompt?: boolean;
}

type CodeBlock = CodeLine[];

const blocks: CodeBlock[] = [
  // Block 0 — Who I am
  [
    { text: " Portfolio — Wassim Jebali", color: "#6366f1" },
    { text: "━━━━━━━━━━━━━━━━━━━━━━━━", color: "#4a5568" },
    { text: "" },
    { text: "$ whoami", prompt: true, color: "#34d399" },
    { text: "Full-Stack Developer", color: "#e8ecf4" },
    { text: "" },
    { text: "$ skills --list", prompt: true, color: "#34d399" },
    { text: "├─ Frontend : HTML, CSS, JS, React, Bootstrap, Next.js", color: "#818cf8" },
    { text: "├─ Backend  : Node.js, PHP, Laravel", color: "#818cf8" },
    { text: "└─ Database : MySQL, NoSQL, MongoDB", color: "#818cf8" },
    { text: "" },
    { text: "$ ./build --status", prompt: true, color: "#34d399" },
    { text: "✓ Available for new projects", color: "#10b981" },
  ],
  // Block 1 — Spinning up a server
  [
    { text: "$ cat server.js", prompt: true, color: "#34d399" },
    { text: "const express = require('express');", color: "#f59e0b" },
    { text: "const app = express();", color: "#f59e0b" },
    { text: "", color: "#f59e0b" },
    { text: "app.get('/', (req, res) => {", color: "#f59e0b" },
    { text: "  res.json({ message: 'Hello World' });", color: "#10b981" },
    { text: "});", color: "#f59e0b" },
    { text: "", color: "#f59e0b" },
    { text: "app.listen(3000, () => {", color: "#f59e0b" },
    { text: "  console.log('✓ Server ready on port 3000');", color: "#10b981" },
    { text: "});", color: "#f59e0b" },
    { text: "" },
    { text: "$ node server.js", prompt: true, color: "#34d399" },
    { text: "✓ Server ready on port 3000", color: "#10b981" },
  ],
  // Block 2 — Git workflow
  [
    { text: "$ git init", prompt: true, color: "#34d399" },
    { text: "Initialized empty Git repository", color: "#64748b" },
    { text: "" },
    { text: "$ git add . && git commit -m \"feat: init\"", prompt: true, color: "#34d399" },
    { text: "[main a1b2c3d] feat: init", color: "#818cf8" },
    { text: " 12 files changed, 456 insertions(+)", color: "#64748b" },
    { text: "" },
    { text: "$ git push origin main", prompt: true, color: "#34d399" },
    { text: "✓ Branch deployed successfully", color: "#10b981" },
  ],
  // Block 3 — Scaffolding a project
  [
    { text: "$ npx create-next-app my-app --ts", prompt: true, color: "#34d399" },
    { text: "✔ Select features: TypeScript, Tailwind", color: "#818cf8" },
    { text: "✔ Installing dependencies...", color: "#64748b" },
    { text: "✓ Project created in 12.4s", color: "#10b981" },
    { text: "" },
    { text: "$ cd my-app && npm run dev", prompt: true, color: "#34d399" },
    { text: "> Ready on http://localhost:3000", color: "#34d399" },
    { text: "> ✓ Hot-reload enabled", color: "#64748b" },
  ],
  // Block 4 — Docker deploy
  [
    { text: "$ docker build -t my-app .", prompt: true, color: "#34d399" },
    { text: "✓ Building image... done", color: "#10b981" },
    { text: "" },
    { text: "$ docker run -d -p 80:3000 my-app", prompt: true, color: "#34d399" },
    { text: "c9d8f7a2b1e0", color: "#64748b" },
    { text: "" },
    { text: "$ curl http://localhost/api/health", prompt: true, color: "#34d399" },
    { text: '{"status":"ok","uptime":"3m12s"}', color: "#10b981" },
  ],
];

/* ─── Typewriter line with per-character animation ──────── */
function TypewriterLine({ line, startDelay }: { line: CodeLine; startDelay: number }) {
  const [displayed, setDisplayed] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!show || !line.text) return;
    let i = 0;
    const chars = line.text;
    const timer = setInterval(() => {
      i++;
      setDisplayed(chars.slice(0, i));
      if (i >= chars.length) clearInterval(timer);
    }, 10);
    return () => clearInterval(timer);
  }, [show, line.text]);

  if (!show) return null;

  const isCursor = line.text.endsWith("█");
  const promptChar = line.prompt ? "$ " : "";

  return (
    <div
      className="mono"
      style={{
        fontSize: 13,
        lineHeight: 1.65,
        color: line.color ?? "#94a3b8",
        whiteSpace: "pre",
        minHeight: 22,
      }}
    >
      <motion.span
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.1 }}
      >
        {isCursor ? (
          <>
            <span style={{ color: "#34d399" }}>$ </span>
            <span className="inline-block w-2 h-4 bg-[#e8ecf4] align-middle mx-0.5 animate-pulse" />
          </>
        ) : (
          promptChar + displayed
        )}
      </motion.span>
    </div>
  );
}

/* ─── Terminal body that cycles through code blocks ─────── */
function TerminalBody() {
  const [blockIdx, setBlockIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [finished, setFinished] = useState(false);

  const block = blocks[blockIdx];
  const currentLines = block.slice(0, lineIdx + 1);
  const maxLen = block.length;

  // Advance through lines in current block
  useEffect(() => {
    if (finished) return;
    if (lineIdx >= maxLen - 1) {
      const pause = setTimeout(() => setFinished(true), 2000);
      return () => clearTimeout(pause);
    }
    const current = block[lineIdx];
    const lineDelay = current.text
      ? current.text.length * 10 + 100
      : 150;
    const next = setTimeout(() => setLineIdx((i) => i + 1), lineDelay);
    return () => clearTimeout(next);
  }, [lineIdx, block, maxLen, finished]);

  // Move to next block after a pause
  const startNext = useCallback(() => {
    setBlockIdx((i) => (i + 1) % blocks.length);
    setLineIdx(0);
    setFinished(false);
  }, []);

  useEffect(() => {
    if (!finished) return;
    const t = setTimeout(startNext, 1800);
    return () => clearTimeout(t);
  }, [finished, startNext]);

  return (
    <>
      {currentLines.map((line, i) => (
        <TypewriterLine
          key={`${blockIdx}-${i}`}
          line={line}
          startDelay={i * 8}
        />
      ))}
    </>
  );
}

/* ─── Terminal Card ─────────────────────────────────────── */
export function CodeTerminal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
      style={{ animation: "terminal-float 6s ease-in-out infinite" }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 65%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="glass"
        style={{
          width: 440,
          maxWidth: "90vw",
          borderRadius: 14,
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(99,102,241,0.2)",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.08)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 38,
            background: "rgba(15,20,30,0.9)",
            borderBottom: "1px solid rgba(99,102,241,0.1)",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <div
              style={{
                width: 10, height: 10, borderRadius: "50%",
                background: "#ef4444", opacity: 0.8,
              }}
            />
            <div
              style={{
                width: 10, height: 10, borderRadius: "50%",
                background: "#f59e0b", opacity: 0.8,
              }}
            />
            <div
              style={{
                width: 10, height: 10, borderRadius: "50%",
                background: "#10b981", opacity: 0.8,
              }}
            />
          </div>
          <span
            className="mono"
            style={{
              fontSize: 11, color: "#4a5568",
              marginLeft: 8, letterSpacing: "0.05em",
            }}
          >
            terminal — portfolio
          </span>
        </div>

        {/* Terminal content */}
        <div
          style={{
            padding: "18px 22px",
            background: "rgba(6,9,18,0.85)",
            minHeight: 340,
            maxHeight: 420,
            overflow: "hidden",
          }}
        >
          <TerminalBody />
        </div>
      </div>
    </motion.div>
  );
}
