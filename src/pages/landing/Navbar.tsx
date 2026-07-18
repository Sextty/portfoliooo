import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { LogoMark } from "./LogoMark";
import { COLORS } from "@/theme/palette";

export function Navbar({
  scrolled,
  activeSection,
}: {
  scrolled: boolean;
  activeSection: string;
}) {
  const links = [
    { label: "Work", href: "#work", id: "work" },
    { label: "What I do", href: "#services", id: "services" },
    { label: "About", href: "#about", id: "about" },
  ];
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu automatically if the viewport grows past md
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-16"
      style={{
        height: 72,
        background:
          scrolled || menuOpen ? "rgba(255,255,255,0.85)" : "transparent",
        backdropFilter: scrolled || menuOpen ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled || menuOpen ? "blur(12px)" : "none",
        borderBottom:
          scrolled || menuOpen
            ? `1px solid ${COLORS.line}`
            : "1px solid transparent",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Wordmark */}
      <a
        href="#hero"
        className="flex items-center gap-3"
        style={{ textDecoration: "none" }}
      >
        <LogoMark />
        <span
          className="display"
          style={{ fontSize: 16, color: COLORS.ink, letterSpacing: "-0.01em" }}
        >
          Wassim Jebali
        </span>
      </a>

      {/* Links */}
      <div className="hidden md:flex items-center gap-7">
        {links.map((l) => {
          const isActive = activeSection === l.id;
          return (
            <a
              key={l.id}
              href={l.href}
              style={{
                position: "relative",
                fontSize: 14.5,
                fontWeight: 500,
                color: isActive ? COLORS.ink : COLORS.slate,
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = COLORS.ink)
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color = isActive
                  ? COLORS.ink
                  : COLORS.slate)
              }
            >
              {l.label}
              {isActive && scrolled && (
                <motion.div
                  layoutId="nav-indicator"
                  style={{
                    position: "absolute",
                    bottom: -8,
                    left: "50%",
                    marginLeft: -2,
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: COLORS.cobalt,
                  }}
                />
              )}
            </a>
          );
        })}
        <Link
          to="/projects"
          style={{
            fontSize: 14.5,
            fontWeight: 500,
            color: COLORS.slate,
            textDecoration: "none",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLAnchorElement).style.color = COLORS.ink)
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLAnchorElement).style.color = COLORS.slate)
          }
        >
          All projects
        </Link>
        <a
          href="#contact"
          className="btn-primary"
          style={{
            padding: "10px 20px",
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Start a project
        </a>
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden flex items-center justify-center"
        onClick={() => setMenuOpen((o) => !o)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        style={{
          width: 40,
          height: 40,
          background: COLORS.paper,
          border: `1px solid ${COLORS.line}`,
          borderRadius: 12,
          color: COLORS.ink,
          cursor: "pointer",
        }}
      >
        {menuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden absolute left-0 right-0 flex flex-col px-6 py-4 gap-1"
            style={{
              top: 72,
              background: "rgba(255,255,255,0.97)",
              borderBottom: `1px solid ${COLORS.line}`,
              boxShadow: "0 24px 48px rgba(15,18,34,0.08)",
            }}
          >
            {[...links, { label: "All projects", href: "/projects", id: "index" }].map(
              (l) =>
                l.href.startsWith("#") ? (
                  <a
                    key={l.id}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color:
                        activeSection === l.id ? COLORS.cobalt : COLORS.ink,
                      textDecoration: "none",
                      padding: "13px 4px",
                      borderBottom: `1px solid ${COLORS.lineFaint}`,
                    }}
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.id}
                    to={l.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: COLORS.ink,
                      textDecoration: "none",
                      padding: "13px 4px",
                      borderBottom: `1px solid ${COLORS.lineFaint}`,
                    }}
                  >
                    {l.label}
                  </Link>
                )
            )}
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="btn-primary"
              style={{
                textDecoration: "none",
                textAlign: "center",
                padding: "13px 0",
                fontSize: 15,
                marginTop: 14,
                marginBottom: 6,
              }}
            >
              Start a project
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
