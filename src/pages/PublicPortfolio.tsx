import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SectionDivider } from "@/components/SectionDivider";
import { SectionEntrance } from "@/components/SectionEntrance";
import { BlueprintSchematic } from "@/components/BlueprintSchematic";
import { ProjectCard } from "@/components/ProjectCard";
import { useActiveSection } from "@/utils/useActiveSection";
import profilePhoto from "@/assets/profile.jpg";
import { getProjects, Project } from "@/utils/projectDb";
import { VideoModal } from "@/components/VideoModal";
import { COLORS, FONTS } from "@/theme/palette";
import {
  Github,
  ExternalLink,
  Mail,
  MapPin,
  ChevronDown,
  Database,
  Globe,
  Server,
  Terminal,
  Send,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

/* ─── Blueprint tokens live in styles/theme.css + globals.css ─── */

const techCategories = [
  {
    name: "Frontend",
    ref: "BOM-01",
    icon: Globe,
    items: ["HTML", "CSS", "JavaScript", "React", "Bootstrap", "Next.js"],
  },
  {
    name: "Backend",
    ref: "BOM-02",
    icon: Server,
    items: ["Node.js", "PHP", "Laravel"],
  },
  {
    name: "Database",
    ref: "BOM-03",
    icon: Database,
    items: ["MySQL", "NoSQL", "MongoDB"],
  },
  {
    name: "Tools & APIs",
    ref: "BOM-04",
    icon: Terminal,
    items: ["Git", "REST APIs", "Postman"],
  },
];

const specs = [
  { label: "Location", value: "Tunis, TN" },
  { label: "Timezone", value: "UTC+1" },
  { label: "Experience", value: "3+ years" },
  { label: "Core stack", value: "React · PHP · MySQL" },
];

/* ─── Navbar (drawing header strip) ──────────────────────── */
function Navbar({
  scrolled,
  activeSection,
}: {
  scrolled: boolean;
  activeSection: string;
}) {
  const links = ["About", "Projects", "Contact"];
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

  const linkStyle = (isActive: boolean) => ({
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: isActive ? COLORS.redline : COLORS.trace,
    textDecoration: "none",
    transition: "color 0.2s ease",
    position: "relative" as const,
  });

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16"
      style={{
        height: 72,
        background: scrolled || menuOpen ? "rgba(11,30,54,0.94)" : "transparent",
        borderBottom:
          scrolled || menuOpen
            ? `1px solid ${COLORS.line}`
            : "1px solid transparent",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Nameplate */}
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 36,
            height: 36,
            border: `1.5px solid ${COLORS.print}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 13,
              color: COLORS.print,
            }}
          >
            WJ
          </span>
        </div>
        <div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: COLORS.print,
              lineHeight: 1.2,
            }}
          >
            Wassim Jebali
          </div>
          <div
            className="mono"
            style={{
              fontSize: 9,
              letterSpacing: "0.14em",
              color: COLORS.trace,
              marginTop: 2,
            }}
          >
            DWG NO. WJ-2026 · REV C
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((l) => {
          const isActive = activeSection === l.toLowerCase();
          return (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              style={linkStyle(isActive)}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = COLORS.print)
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color = isActive
                  ? COLORS.redline
                  : COLORS.trace)
              }
            >
              {l}
              {isActive && scrolled && (
                <motion.div
                  layoutId="nav-indicator"
                  style={{
                    position: "absolute",
                    bottom: -6,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: COLORS.redline,
                  }}
                />
              )}
            </a>
          );
        })}
        <Link
          to="/projects"
          style={linkStyle(false)}
          onMouseEnter={(e) =>
            ((e.target as HTMLAnchorElement).style.color = COLORS.print)
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLAnchorElement).style.color = COLORS.trace)
          }
        >
          All Projects
        </Link>
        <a
          href="#contact"
          className="btn-primary px-5 py-2 text-xs"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          Hire Me
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
          background: "transparent",
          border: `1px solid ${COLORS.line}`,
          borderRadius: 2,
          color: COLORS.print,
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
            className="md:hidden absolute left-0 right-0 flex flex-col px-8 py-6 gap-1"
            style={{
              top: 72,
              background: "rgba(7,21,39,0.98)",
              borderBottom: `1px solid ${COLORS.line}`,
            }}
          >
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="mono"
                style={{
                  fontSize: 14,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color:
                    activeSection === l.toLowerCase()
                      ? COLORS.redline
                      : COLORS.trace,
                  textDecoration: "none",
                  padding: "12px 0",
                  borderBottom: `1px solid ${COLORS.lineFaint}`,
                }}
              >
                {l}
              </a>
            ))}
            <Link
              to="/projects"
              onClick={() => setMenuOpen(false)}
              className="mono"
              style={{
                fontSize: 14,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: COLORS.trace,
                textDecoration: "none",
                padding: "12px 0",
                borderBottom: `1px solid ${COLORS.lineFaint}`,
              }}
            >
              All Projects
            </Link>
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="btn-primary text-sm"
              style={{
                textDecoration: "none",
                textAlign: "center",
                padding: "12px 0",
                marginTop: 16,
              }}
            >
              Hire Me
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 grid md:grid-cols-2 gap-16 items-center pt-24 pb-20">
        {/* Text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="mono mb-6"
              style={{
                fontSize: 12,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: COLORS.trace,
              }}
            >
              Wassim Jebali · Full-Stack Developer
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="display"
            style={{
              fontSize: "clamp(2.4rem, 5.2vw, 4.4rem)",
              lineHeight: 1.04,
              color: COLORS.print,
              marginBottom: "1.5rem",
            }}
          >
            I build web
            <br />
            apps{" "}
            <span style={{ color: COLORS.redline }}>
              end to end.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              color: COLORS.trace,
              fontSize: 16,
              lineHeight: 1.75,
              maxWidth: 460,
              marginBottom: "2.5rem",
            }}
          >
            From responsive React interfaces to PHP and Node.js backends with
            MySQL behind them — I design, build, and ship the whole system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#projects"
              className="btn-primary px-7 py-3.5 text-[13px] flex items-center gap-2"
              style={{ textDecoration: "none" }}
            >
              View Work <ArrowUpRight size={15} />
            </a>
            <a
              href="#contact"
              className="btn-ghost px-7 py-3.5 text-[13px]"
              style={{ textDecoration: "none" }}
            >
              Let&apos;s Talk
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex items-center gap-2 mt-8"
          >
            <MapPin size={13} style={{ color: COLORS.redline }} />
            <span
              className="mono"
              style={{
                fontSize: 11,
                color: COLORS.trace,
                letterSpacing: "0.12em",
              }}
            >
              TUNIS, TN · UTC+1 · OPEN TO WORK
            </span>
          </motion.div>
        </div>

        {/* FIG. 01 — system schematic */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center items-center"
        >
          <BlueprintSchematic />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 10 }}
      >
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: COLORS.trace,
            letterSpacing: "0.2em",
            opacity: 0.7,
          }}
        >
          SCROLL
        </span>
        <div className="bounce-anim">
          <ChevronDown size={18} style={{ color: COLORS.redline }} />
        </div>
      </div>
    </section>
  );
}

/* ─── Section Header (figure label + plate title) ────────── */
function SectionHeader({
  fig,
  title,
}: {
  fig: string;
  title: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="mb-20"
    >
      <p className="fig-tag mb-4">{fig}</p>
      <h2
        className="display"
        style={{
          fontSize: "clamp(1.8rem, 3.6vw, 2.8rem)",
          color: COLORS.print,
          lineHeight: 1.1,
        }}
      >
        {title}
      </h2>
      <div className="dimension-line mt-5 max-w-xs" />
    </motion.div>
  );
}

/* ─── About ──────────────────────────────────────────────── */
function AboutSection() {
  return (
    <section id="about" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <SectionHeader fig="FIG. 02 — ENGINEER PROFILE" title="About Me" />

        <div className="grid md:grid-cols-5 gap-16 items-start">
          {/* Photo + bio */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Photo in a registration-mark frame */}
              <div
                className="relative mb-10 corner-ticks"
                style={{ maxWidth: 340 }}
              >
                <ImageWithFallback
                  src={profilePhoto}
                  alt="Wassim Jebali — Full-Stack Developer"
                  style={{
                    width: "100%",
                    height: 400,
                    objectFit: "cover",
                    objectPosition: "center center",
                    border: `1px solid ${COLORS.line}`,
                    display: "block",
                    filter: "saturate(0.9)",
                  }}
                />
                <div
                  className="stamp"
                  style={{ position: "absolute", bottom: -16, right: -8 }}
                >
                  Open to Work
                </div>
              </div>

              {/* Bio */}
              <p
                style={{
                  color: COLORS.trace,
                  fontSize: 15,
                  lineHeight: 1.85,
                  marginBottom: "1.5rem",
                }}
              >
                I&apos;m a full-stack developer from Tunisia with 3+ years of
                experience building web and mobile applications. I care about
                the whole drawing — clean architecture on the back, precise
                interfaces on the front.
              </p>
              <p
                style={{
                  color: COLORS.trace,
                  opacity: 0.8,
                  fontSize: 14,
                  lineHeight: 1.85,
                }}
              >
                When I&apos;m not coding, you&apos;ll find me exploring new
                technologies, contributing to open source, or sharing knowledge
                with the developer community.
              </p>
            </motion.div>

            {/* Spec sheet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="title-block grid grid-cols-2 mt-10"
            >
              {specs.map((s) => (
                <div key={s.label} className="tb-cell">
                  <span className="tb-label">{s.label}</span>
                  <span className="tb-value">{s.value}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Tech stack — bill of materials */}
          <div className="md:col-span-3">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="fig-tag mb-6"
            >
              Tech Stack — Bill of Materials
            </motion.p>
            <div className="grid sm:grid-cols-2 gap-4">
              {techCategories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.07 }}
                    viewport={{ once: true }}
                    className="sheet tech-hover p-5 cursor-default"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            border: `1px solid ${COLORS.line}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={16} style={{ color: COLORS.trace }} />
                        </div>
                        <span
                          className="display"
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: "0.06em",
                            color: COLORS.print,
                          }}
                        >
                          {cat.name}
                        </span>
                      </div>
                      <span
                        className="mono"
                        style={{
                          fontSize: 9,
                          letterSpacing: "0.14em",
                          color: COLORS.redline,
                        }}
                      >
                        {cat.ref}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item) => (
                        <span
                          key={item}
                          className="mono"
                          style={{
                            fontSize: 11,
                            color: COLORS.trace,
                            border: `1px solid ${COLORS.lineFaint}`,
                            padding: "3px 8px",
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Projects ───────────────────────────────────────────── */
function ProjectsSection({
  onWatchDemo,
}: {
  onWatchDemo: (src: string, title: string, color?: string) => void;
}) {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load projects and filter by featured
    const all = getProjects();
    setFeaturedProjects(all.filter((p) => p.featured));
  }, []);

  return (
    <section id="projects" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="fig-tag mb-4">FIG. 03 — SELECTED WORK</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2
                className="display"
                style={{
                  fontSize: "clamp(1.8rem, 3.6vw, 2.8rem)",
                  color: COLORS.print,
                  lineHeight: 1.1,
                }}
              >
                Projects
              </h2>
              <div className="dimension-line mt-5 max-w-xs" />
            </div>
            <p
              style={{
                color: COLORS.trace,
                fontSize: 14,
                maxWidth: 280,
                lineHeight: 1.7,
              }}
            >
              Products and experiments, drawn front to back with modern web
              technologies.
            </p>
          </div>
        </motion.div>

        {featuredProjects.length === 0 ? (
          <div
            className="sheet p-12 text-center"
            style={{ color: COLORS.trace }}
          >
            No featured projects yet. Check out the project index or add some
            in the admin panel!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {featuredProjects.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                onWatchDemo={onWatchDemo}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/projects"
            className="btn-ghost px-8 py-3 text-[13px] inline-flex items-center gap-2"
            style={{ textDecoration: "none" }}
          >
            Open Project Index <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Contact ────────────────────────────────────────────── */
const CONTACT_EMAIL = "wassimjebali583@gmail.com";

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // No backend: compose the message in the visitor's email app instead.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Portfolio contact from ${form.name}`;
    const body = `Hi Wassim,\n\n${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setStatus("sent");
    setTimeout(() => setStatus("idle"), 4000);
  };

  const fieldLabel = (text: string) => (
    <label
      className="mono"
      style={{
        fontSize: 10,
        color: COLORS.trace,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </label>
  );

  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <SectionHeader
          fig="FIG. 04 — CHANGE REQUEST"
          title="Let's Build Something."
        />

        <div className="grid md:grid-cols-5 gap-16">
          {/* Left info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:col-span-2 flex flex-col gap-8"
          >
            <p
              style={{
                color: COLORS.trace,
                fontSize: 16,
                lineHeight: 1.8,
              }}
            >
              Have a project in mind, a collaboration opportunity, or just want
              to say hello? I&apos;d love to hear from you.
            </p>

            <div className="flex flex-col gap-5">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: CONTACT_EMAIL,
                  href: `mailto:${CONTACT_EMAIL}`,
                },
                {
                  icon: Github,
                  label: "GitHub",
                  value: "github.com/Sextty",
                  href: "https://github.com/Sextty",
                },
                {
                  icon: ExternalLink,
                  label: "LinkedIn",
                  value: "linkedin.com/in/wassim-wess-b3a544380",
                  href: "https://linkedin.com/in/wassim-wess-b3a544380",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Tunis, Tunisia",
                  href: undefined,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        border: `1px solid ${COLORS.line}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} style={{ color: COLORS.trace }} />
                    </div>
                    <div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.16em",
                          color: COLORS.trace,
                          opacity: 0.75,
                          marginBottom: 2,
                        }}
                      >
                        {item.label.toUpperCase()}
                      </div>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={
                            item.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel="noreferrer"
                          style={{
                            fontSize: 14,
                            color: COLORS.print,
                            textDecoration: "none",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            ((e.target as HTMLAnchorElement).style.color =
                              COLORS.redline)
                          }
                          onMouseLeave={(e) =>
                            ((e.target as HTMLAnchorElement).style.color =
                              COLORS.print)
                          }
                        >
                          {item.value}
                        </a>
                      ) : (
                        <div style={{ fontSize: 14, color: COLORS.print }}>
                          {item.value}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Availability */}
            <div className="sheet p-5 mt-2">
              <div className="flex items-center gap-3 mb-2">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    background: COLORS.redline,
                  }}
                />
                <span
                  className="mono"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: COLORS.print,
                  }}
                >
                  Status: Accepting Work
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: COLORS.trace,
                  lineHeight: 1.7,
                }}
              >
                Open to full-time roles and freelance projects. Response time
                typically within 24 hours.
              </p>
            </div>
          </motion.div>

          {/* Change request form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:col-span-3"
          >
            <div className="sheet corner-ticks p-6 md:p-8">
              <div
                className="mono flex items-center justify-between pb-4 mb-6"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: COLORS.trace,
                  borderBottom: `1px solid ${COLORS.lineFaint}`,
                }}
              >
                <span>CHANGE REQUEST — FORM CR-01</span>
                <span style={{ color: COLORS.redline }}>PRIORITY: HIGH</span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    {fieldLabel("Field 01 — Name")}
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="glow-input"
                      style={{
                        padding: "14px 18px",
                        fontSize: 15,
                        width: "100%",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {fieldLabel("Field 02 — Email")}
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="hello@example.com"
                      required
                      className="glow-input"
                      style={{
                        padding: "14px 18px",
                        fontSize: 15,
                        width: "100%",
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {fieldLabel("Field 03 — Message")}
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project, idea, or just say hi..."
                    required
                    rows={6}
                    className="glow-input"
                    style={{
                      padding: "14px 18px",
                      fontSize: 15,
                      width: "100%",
                      resize: "vertical",
                      fontFamily: FONTS.body,
                      lineHeight: 1.7,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className="btn-primary flex items-center justify-center gap-3 py-4 text-[13px]"
                  style={{
                    opacity: status !== "idle" ? 0.75 : 1,
                    cursor: status !== "idle" ? "not-allowed" : "pointer",
                  }}
                >
                  {status === "idle" && (
                    <>
                      Send Message <Send size={15} />
                    </>
                  )}
                  {status === "sent" && (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8 L6.5 11.5 L13 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Opening Your Email App…
                    </>
                  )}
                </button>
                <p
                  style={{
                    fontSize: 12,
                    color: COLORS.trace,
                    opacity: 0.8,
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  This opens your email app with the message pre-filled — just
                  hit send.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer (drawing title block) ───────────────────────── */
function Footer() {
  return (
    <footer style={{ padding: "48px 0 40px" }}>
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        {/* Title block */}
        <div className="title-block grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          {[
            { label: "Drawn by", value: "W. JEBALI" },
            { label: "Project", value: "PORTFOLIO" },
            { label: "Sheet", value: "1 OF 1" },
            { label: "Rev", value: "C" },
            { label: "Scale", value: "1:1" },
            { label: "Date", value: "2026" },
          ].map((cell) => (
            <div key={cell.label} className="tb-cell">
              <span className="tb-label">{cell.label}</span>
              <span className="tb-value">{cell.value}</span>
            </div>
          ))}
        </div>

        {/* Links row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
          <span
            className="mono"
            style={{ fontSize: 11, color: COLORS.trace, letterSpacing: "0.08em" }}
          >
            © 2026 WASSIM JEBALI. ALL RIGHTS RESERVED.
          </span>

          <div className="flex items-center gap-6">
            {["About", "Projects", "Contact"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: COLORS.trace,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = COLORS.print)
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLAnchorElement).style.color = COLORS.trace)
                }
              >
                {l}
              </a>
            ))}
            <Link
              to="/admin"
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: COLORS.trace,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = COLORS.redline)
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color = COLORS.trace)
              }
            >
              Admin Portal
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div
              style={{
                width: 6,
                height: 6,
                background: COLORS.redline,
              }}
            />
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: COLORS.trace,
                letterSpacing: "0.12em",
              }}
            >
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── App Page ───────────────────────────────────────────── */
export default function PublicPortfolio() {
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection(["about", "projects", "contact"]);
  const [playingVideo, setPlayingVideo] = useState<{
    src: string;
    title: string;
    color?: string;
  } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="sheet-grid"
      style={{
        background: COLORS.ground,
        color: COLORS.print,
        overflowX: "hidden",
      }}
    >
      <div className="drawing-frame hidden md:block" />
      <ScrollProgress />
      <Navbar scrolled={scrolled} activeSection={activeSection} />
      <main>
        <HeroSection />
        <SectionDivider />
        <SectionEntrance>
          <AboutSection />
        </SectionEntrance>
        <SectionDivider />
        <SectionEntrance delay={0.1}>
          <ProjectsSection
            onWatchDemo={(src, title, color) =>
              setPlayingVideo({ src, title, color })
            }
          />
        </SectionEntrance>
        <SectionDivider />
        <SectionEntrance delay={0.2}>
          <ContactSection />
        </SectionEntrance>
      </main>
      <Footer />

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
