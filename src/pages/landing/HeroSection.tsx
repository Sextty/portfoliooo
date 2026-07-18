import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, ArrowRight } from "lucide-react";
import { AppMockup, BrowserFrame } from "@/components/AppMockup";
import { Magnetic } from "@/components/Magnetic";
import { tint } from "@/utils/color";
import { Project } from "@/utils/projectDb";
import { COLORS } from "@/theme/palette";

/* ─── Live product launcher ──────────────────────────────── */
function LiveLauncher({ demos }: { demos: Project[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = demos[index];

  // Auto-advance unless hovered or the visitor prefers reduced motion
  useEffect(() => {
    if (paused || demos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      setIndex((v) => (v + 1) % demos.length);
    }, 4500);
    return () => clearInterval(t);
  }, [paused, demos.length]);

  if (!current) return null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: "relative" }}
    >
      {/* Soft brand glow behind the frame */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-12% -8%",
          background: `radial-gradient(closest-side, ${tint(current.color, 0.16)}, transparent 72%)`,
          transition: "background 0.6s ease",
          pointerEvents: "none",
        }}
      />

      <BrowserFrame
        url={`portfoliowassim.vercel.app${current.runUrl}`}
        style={{ position: "relative" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <AppMockup projectId={current.id} color={current.color} />
          </motion.div>
        </AnimatePresence>
      </BrowserFrame>

      {/* Switcher + launch */}
      <div
        className="flex flex-wrap items-center gap-2 mt-5"
        style={{ position: "relative" }}
      >
        <div
          role="tablist"
          aria-label="Preview a project"
          className="flex flex-wrap gap-1.5"
          style={{
            background: COLORS.paper,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 999,
            padding: 4,
          }}
        >
          {demos.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              style={{
                border: "none",
                cursor: "pointer",
                borderRadius: 999,
                padding: "6px 13px",
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: "'Instrument Sans', sans-serif",
                background: i === index ? COLORS.ink : "transparent",
                color: i === index ? "#fff" : COLORS.slate,
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {p.title}
            </button>
          ))}
        </div>
        <Link
          to={current.runUrl!}
          className="btn-primary"
          style={{
            marginLeft: "auto",
            padding: "9px 18px",
            fontSize: 13.5,
            textDecoration: "none",
          }}
        >
          Launch demo <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
export function HeroSection({ demos }: { demos: Project[] }) {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 grid lg:grid-cols-[1fr_1.05fr] gap-14 lg:gap-16 items-center pt-36 pb-16 lg:pt-44 lg:pb-24">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="stamp" style={{ fontSize: 13 }}>
              Available for new work
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="display"
            style={{
              fontSize: "clamp(2.5rem, 5.2vw, 4rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              color: COLORS.ink,
              margin: "1.6rem 0 1.25rem",
            }}
          >
            I build products
            <br />
            you can{" "}
            <span style={{ color: COLORS.cobalt, whiteSpace: "nowrap" }}>
              actually try.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            style={{
              color: COLORS.slate,
              fontSize: 17,
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: "2.2rem",
            }}
          >
            Full-stack developer in Tunis. I design, build, and ship complete
            web products — React frontends, Node.js and PHP backends, real
            databases. Every project on this site runs live in your browser.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <a
                href="#work"
                className="btn-primary"
                style={{ padding: "13px 26px", fontSize: 15, textDecoration: "none" }}
              >
                Explore the work
              </a>
            </Magnetic>
            <a
              href="#contact"
              className="btn-ghost"
              style={{ padding: "13px 26px", fontSize: 15, textDecoration: "none" }}
            >
              Get in touch
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center gap-2 mt-9"
          >
            <MapPin size={14} style={{ color: COLORS.slate }} />
            <span style={{ fontSize: 13.5, color: COLORS.slate }}>
              Tunis, Tunisia · UTC+1 · Remote-friendly
            </span>
          </motion.div>
        </div>

        {/* Live launcher */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <LiveLauncher demos={demos} />
        </motion.div>
      </div>
    </section>
  );
}
