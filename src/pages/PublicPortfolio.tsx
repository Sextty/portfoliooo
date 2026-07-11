import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SectionDivider } from "@/components/SectionDivider";
import { SectionEntrance } from "@/components/SectionEntrance";
import { CodeTerminal } from "@/components/CodeTerminal";
import { useActiveSection } from "@/utils/useActiveSection";
import profilePhoto from "@/assets/profile.jpg";
import { getProjects, Project } from "@/utils/projectDb";
import { VideoModal } from "@/components/VideoModal";
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
  Play,
} from "lucide-react";

/* ─── Keyframes and animations defined in styles/theme.css ─── */

const techCategories = [
  {
    name: "Frontend",
    icon: Globe,
    color: "#6366f1",
    glow: "rgba(99,102,241,0.18)",
    items: ["HTML", "CSS", "JavaScript", "React", "Bootstrap", "Next.js"],
  },
  {
    name: "Backend",
    icon: Server,
    color: "#10b981",
    glow: "rgba(16,185,129,0.18)",
    items: ["Node.js", "PHP", "Laravel"],
  },
  {
    name: "Database",
    icon: Database,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.18)",
    items: ["MySQL", "NoSQL", "MongoDB"],
  },
  {
    name: "Tools & APIs",
    icon: Terminal,
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.18)",
    items: ["Git", "REST APIs", "Postman"],
  },
];

const stats = [
  { value: "3+", label: "Years Experience" },
  { value: "24+", label: "Projects Shipped" },
  { value: "8+", label: "Technologies" },
  { value: "100%", label: "Dedication" },
];

/* ─── Orb replaced by CodeTerminal component ─────────────── */

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar({
  scrolled,
  activeSection,
}: {
  scrolled: boolean;
  activeSection: string;
}) {
  const links = ["About", "Projects", "Contact"];

  const getLinkStyle = (link: string) => {
    const isActive = activeSection === link.toLowerCase();
    return {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 14,
      fontWeight: isActive ? 600 : 500,
      color: isActive ? "#e8ecf4" : "#94a3b8",
      textDecoration: "none",
      transition: "color 0.25s ease, font-weight 0.25s ease",
      position: "relative" as const,
    };
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16"
      style={{
        height: 72,
        background: scrolled
          ? "rgba(6,9,18,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(99,102,241,0.12)"
          : "none",
        transition: "all 0.4s ease",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #10b981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: 15,
              color: "white",
            }}
          >
            WJ
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#e8ecf4",
            letterSpacing: "-0.02em",
          }}
        >
          Wassim Jebali
        </span>
      </div>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((l) => {
          const isActive = activeSection === l.toLowerCase();
          return (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              style={getLinkStyle(l)}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = "#e8ecf4")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color = isActive ? "#e8ecf4" : "#94a3b8")
              }
            >
              {l}
              {isActive && scrolled && (
                <motion.div
                  layoutId="nav-indicator"
                  style={{
                    position: "absolute",
                    bottom: -4,
                    left: "20%",
                    right: "20%",
                    height: 2,
                    borderRadius: 1,
                    background: "#6366f1",
                  }}
                />
              )}
            </a>
          );
        })}
        <Link
          to="/projects"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: "#94a3b8",
            textDecoration: "none",
            transition: "color 0.25s ease",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLAnchorElement).style.color = "#e8ecf4")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLAnchorElement).style.color = "#94a3b8")
          }
        >
          Project Zone
        </Link>
        <a
          href="#contact"
          className="btn-primary px-5 py-2 rounded-xl text-sm"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          Hire Me
        </a>
      </div>
    </motion.nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden dot-grid"
    >
      {/* Background gradients */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 grid md:grid-cols-2 gap-16 items-center pt-24 pb-20">
        {/* Text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-tag mb-6">
              ◈ &nbsp;Available for work
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#e8ecf4",
              marginBottom: "1rem",
            }}
          >
            Wassim
            <br />
            <span className="shimmer-text">Jebali.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
              fontWeight: 300,
              color: "#64748b",
              marginBottom: "1.5rem",
              letterSpacing: "-0.01em",
            }}
          >
            Full-Stack Developer
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            style={{
              color: "#94a3b8",
              fontSize: 16,
              lineHeight: 1.75,
              maxWidth: 440,
              marginBottom: "2.5rem",
            }}
          >
            I design and build high-performance web applications — from
            beautiful, responsive interfaces to robust scalable backends.
            Turning ideas into digital realities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#projects"
              className="btn-primary px-7 py-3.5 rounded-xl text-[15px] flex items-center gap-2"
              style={{ textDecoration: "none" }}
            >
              View Work <ArrowUpRight size={16} />
            </a>
            <a
              href="#contact"
              className="btn-ghost px-7 py-3.5 rounded-xl text-[15px]"
              style={{ textDecoration: "none" }}
            >
              Let&apos;s Talk
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex items-center gap-2 mt-8"
          >
            <MapPin size={14} style={{ color: "#6366f1" }} />
            <span
              className="mono"
              style={{ fontSize: 12, color: "#4a5568", letterSpacing: "0.05em" }}
            >
              Tunisia, Africa — UTC+1
            </span>
          </motion.div>
        </div>

        {/* Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center items-center"
        >
          <CodeTerminal />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 10 }}
      >
        <span
          className="mono"
          style={{ fontSize: 10, color: "#334155", letterSpacing: "0.15em" }}
        >
          SCROLL
        </span>
        <div className="bounce-anim">
          <ChevronDown size={18} style={{ color: "#6366f1" }} />
        </div>
      </div>
    </section>
  );
}

/* ─── About ──────────────────────────────────────────────── */
function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-32 overflow-hidden"
    >
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-7xl mx-auto px-8 md:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="section-tag mb-4">◈ &nbsp;Who I am</p>
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              color: "#e8ecf4",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            About Me
          </h2>
          <div className="gradient-line mt-5 max-w-xs" />
        </motion.div>

        <div className="grid md:grid-cols-5 gap-16 items-start">
          {/* Photo + bio */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Photo */}
              <div
                className="relative mb-8"
                style={{ maxWidth: 340 }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -2,
                    borderRadius: 24,
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.6), rgba(16,185,129,0.4))",
                    zIndex: -1,
                    filter: "blur(1px)",
                  }}
                />
                <ImageWithFallback
                  src={profilePhoto}
                  alt="Wassim Jebali — Full-Stack Developer"
                  style={{
                    width: "100%",
                    height: 400,
                    objectFit: "cover",
                    objectPosition: "center center",
                    borderRadius: 22,
                    display: "block",
                  }}
                />
                {/* Badge */}
                <div
                  className="glass absolute -bottom-4 -right-4 px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#10b981",
                      boxShadow: "0 0 8px #10b981",
                    }}
                  />
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    Open to opportunities
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: 15,
                  lineHeight: 1.85,
                  marginBottom: "1.5rem",
                }}
              >
                I&apos;m a passionate full-stack developer from Tunisia with 3+
                years of experience building web and mobile applications. I
                thrive on creating seamless digital experiences that blend
                clean architecture with beautiful design.
              </p>
              <p
                style={{
                  color: "#64748b",
                  fontSize: 14,
                  lineHeight: 1.85,
                }}
              >
                When I&apos;m not coding, you&apos;ll find me exploring new
                technologies, contributing to open source, or sharing
                knowledge with the developer community.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-4"
                >
                  <div
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 800,
                      fontSize: "1.8rem",
                      background: "linear-gradient(135deg, #6366f1, #34d399)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1.1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}
                  >
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className="md:col-span-3">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="section-tag mb-6"
            >
              ◈ &nbsp;Tech Stack
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
                    className="glass tech-hover rounded-2xl p-5 cursor-default"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: `${cat.color}18`,
                          border: `1px solid ${cat.color}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} style={{ color: cat.color }} />
                      </div>
                      <span
                        style={{
                          fontFamily: "'Sora', sans-serif",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#e8ecf4",
                        }}
                      >
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item) => (
                        <span
                          key={item}
                          className="mono"
                          style={{
                            fontSize: 11,
                            color: cat.color,
                            background: `${cat.color}12`,
                            border: `1px solid ${cat.color}20`,
                            borderRadius: 6,
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

/* ─── Project Card ───────────────────────────────────────── */
function ProjectCard({
  project,
  index,
  onWatchDemo,
}: {
  project: Project;
  index: number;
  onWatchDemo: (src: string, title: string, color?: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasDbVideo, setHasDbVideo] = useState(false);
  const [dbVideoUrl, setDbVideoUrl] = useState<string | null>(null);

  useEffect(() => {
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
  }, [project.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -9;
    const rotY = ((x - cx) / cx) * 9;
    el.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
    el.style.setProperty("--my", `${(y / rect.height) * 100}%`);
    el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.12 }}
      viewport={{ once: true }}
    >
      <div
        ref={cardRef}
        className="tilt-card glass rounded-2xl overflow-hidden cursor-pointer relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="card-shine" />

        {/* Top color bar */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${project.color}, ${project.color}44)`,
          }}
        />

        {project.image && (
          <div className="w-full h-48 overflow-hidden relative border-b border-border">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}

        <div className="p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: project.color,
                    letterSpacing: "0.12em",
                  }}
                >
                  {project.year}
                </span>
              </div>
              <Link to={`/project/${project.id}`} style={{ textDecoration: "none" }}>
                <h3
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "#e8ecf4",
                    letterSpacing: "-0.02em",
                    cursor: "pointer",
                    transition: "color 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = project.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#e8ecf4";
                  }}
                >
                  {project.title}
                </h3>
              </Link>
              <p
                style={{
                  fontSize: 12,
                  color: project.color,
                  marginTop: 2,
                }}
              >
                {project.tagline}
              </p>
            </div>

            <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748b",
                    transition: "color 0.25s, background 0.25s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#e8ecf4";
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#64748b";
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.04)";
                  }}
                  title="View Source Code"
                >
                  <Github size={15} />
                </a>
              )}

              {(project.videoUrl || hasDbVideo) && (
                <button
                  onClick={() => onWatchDemo(dbVideoUrl || project.videoUrl!, project.title, project.color)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `${project.color}15`,
                    border: `1px solid ${project.color}30`,
                    color: project.color,
                    cursor: "pointer",
                    transition: "background 0.25s, box-shadow 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${project.color}28`;
                    e.currentTarget.style.boxShadow = `0 0 16px ${project.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${project.color}15`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  title="Watch Demo Video"
                >
                  <Play size={15} fill="currentColor" />
                </button>
              )}

              {project.runUrl && (() => {
                const isInternal = project.runUrl.startsWith("/");
                const btnStyle = {
                  display: "flex" as const,
                  alignItems: "center" as const,
                  justifyContent: "center" as const,
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#64748b",
                  transition: "color 0.25s, background 0.25s",
                  textDecoration: "none" as const,
                };
                const hoverEnter = (e: any) => {
                  e.currentTarget.style.color = "#e8ecf4";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                };
                const hoverLeave = (e: any) => {
                  e.currentTarget.style.color = "#64748b";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                };
                return isInternal ? (
                  <Link to={project.runUrl} style={btnStyle} onMouseEnter={hoverEnter} onMouseLeave={hoverLeave} title="Live Demo">
                    <ExternalLink size={15} />
                  </Link>
                ) : (
                  <a href={project.runUrl} target="_blank" rel="noreferrer" style={btnStyle} onMouseEnter={hoverEnter} onMouseLeave={hoverLeave} title="Live Demo">
                    <ExternalLink size={15} />
                  </a>
                );
              })()}
            </div>
          </div>

          {/* Description */}
          <p
            style={{
              color: "#64748b",
              fontSize: 14,
              lineHeight: 1.75,
              marginBottom: "1.5rem",
            }}
          >
            {project.description}
          </p>

          {/* Stack */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span
                key={t}
                className="mono"
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  letterSpacing: "0.03em",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
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
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="section-tag mb-4">◈ &nbsp;Selected work</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  color: "#e8ecf4",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
              >
                Projects
              </h2>
              <div className="gradient-line mt-5 max-w-xs" />
            </div>
            <p
              style={{ color: "#64748b", fontSize: 14, maxWidth: 280, lineHeight: 1.7 }}
            >
              A collection of products and experiments built with modern
              web technologies.
            </p>
          </div>
        </motion.div>

        {featuredProjects.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            No featured projects yet. Check out the project zone or add some in the admin panel!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {featuredProjects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} onWatchDemo={onWatchDemo} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/projects"
            className="btn-ghost px-8 py-3 rounded-xl text-[15px] inline-flex items-center gap-2"
            style={{ textDecoration: "none" }}
          >
            Explore Project Zone <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Contact ────────────────────────────────────────────── */
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => {
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 3500);
    }, 1800);
  };

  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          left: "20%",
          width: 600,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="section-tag mb-4">◈ &nbsp;Get in touch</p>
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              color: "#e8ecf4",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Let&apos;s Build
            <br />
            <span className="shimmer-text">Something Together.</span>
          </h2>
          <div className="gradient-line mt-5 max-w-xs" />
        </motion.div>

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
                color: "#94a3b8",
                fontSize: 16,
                lineHeight: 1.8,
              }}
            >
              Have a project in mind, a collaboration opportunity, or just
              want to say hello? I&apos;d love to hear from you.
            </p>

            <div className="flex flex-col gap-5">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "wassimjebali583@gmail.com",
                  color: "#6366f1",
                },
                {
                  icon: Github,
                  label: "GitHub",
                  value: "github.com/Sextty",
                  color: "#8b5cf6",
                },
                {
                  icon: ExternalLink,
                  label: "LinkedIn",
                  value: "linkedin.com/in/wassim-wess-b3a544380",
                  color: "#0a66c2",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Tunisia, Africa",
                  color: "#10b981",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: `${item.color}12`,
                        border: `1px solid ${item.color}25`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} style={{ color: item.color }} />
                    </div>
                    <div>
                      <div
                        style={{ fontSize: 11, color: "#4a5568", marginBottom: 2 }}
                        className="mono"
                      >
                        {item.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 14, color: "#94a3b8" }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Availability badge */}
            <div
              className="glass-em rounded-2xl p-5 mt-2"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 10px #10b981",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#e8ecf4",
                  }}
                >
                  Currently Available
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
                Open to full-time roles and freelance projects. Response time
                typically within 24 hours.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:col-span-3"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label
                    className="mono"
                    style={{ fontSize: 11, color: "#6366f1", letterSpacing: "0.12em" }}
                  >
                    YOUR NAME
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="glow-input"
                    style={{
                      borderRadius: 12,
                      padding: "14px 18px",
                      fontSize: 15,
                      width: "100%",
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    className="mono"
                    style={{ fontSize: 11, color: "#6366f1", letterSpacing: "0.12em" }}
                  >
                    EMAIL ADDRESS
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="hello@example.com"
                    required
                    className="glow-input glow-input-em"
                    style={{
                      borderRadius: 12,
                      padding: "14px 18px",
                      fontSize: 15,
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="mono"
                  style={{ fontSize: 11, color: "#6366f1", letterSpacing: "0.12em" }}
                >
                  MESSAGE
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project, idea, or just say hi..."
                  required
                  rows={6}
                  className="glow-input"
                  style={{
                    borderRadius: 12,
                    padding: "14px 18px",
                    fontSize: 15,
                    width: "100%",
                    resize: "vertical",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.7,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={status !== "idle"}
                className="btn-primary flex items-center justify-center gap-3 py-4 rounded-xl text-[15px]"
                style={{
                  opacity: status !== "idle" ? 0.75 : 1,
                  cursor: status !== "idle" ? "not-allowed" : "pointer",
                }}
              >
                {status === "idle" && (
                  <>
                    Send Message <Send size={16} />
                  </>
                )}
                {status === "sending" && (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ animation: "ring-a 0.8s linear infinite" }}
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 2 A6 6 0 0 1 14 8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Sending...
                  </>
                )}
                {status === "sent" && (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M3 8 L6.5 11.5 L13 5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Message Sent!
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(99,102,241,0.1)",
        padding: "40px 0",
      }}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                color: "white",
              }}
            >
              WJ
            </span>
          </div>
          <span style={{ fontSize: 13, color: "#4a5568" }}>
            © 2026 Wassim Jebali. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-6">
          {["About", "Projects", "Contact"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              style={{
                fontSize: 13,
                color: "#4a5568",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = "#94a3b8")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color = "#4a5568")
              }
            >
              {l}
            </a>
          ))}
          <Link
            to="/admin"
            style={{
              fontSize: 13,
              color: "#4a5568",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#6366f1")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#4a5568")
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
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px #10b981",
            }}
          />
          <span
            className="mono"
            style={{ fontSize: 11, color: "#4a5568", letterSpacing: "0.1em" }}
          >
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ─── App Page ───────────────────────────────────────────── */
export default function PublicPortfolio() {
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection(["about", "projects", "contact"]);
  const [playingVideo, setPlayingVideo] = useState<{ src: string; title: string; color?: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{ background: "#060912", color: "#e8ecf4", overflowX: "hidden" }}
    >
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
          <ProjectsSection onWatchDemo={(src, title, color) => setPlayingVideo({ src, title, color })} />
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
