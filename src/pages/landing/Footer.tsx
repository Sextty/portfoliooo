import { Link } from "react-router-dom";
import { LogoMark } from "./LogoMark";
import { SITE } from "@/data/site";
import { COLORS } from "@/theme/palette";

const columnHeader: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: "#9AA2B8",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 14,
};

const columnLink: React.CSSProperties = {
  fontSize: 14,
  color: COLORS.slate,
  textDecoration: "none",
};

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{ borderTop: `1px solid ${COLORS.line}`, background: COLORS.paper }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Identity */}
          <div style={{ maxWidth: 320 }}>
            <div className="flex items-center gap-3 mb-4">
              <LogoMark size={30} />
              <span
                className="display"
                style={{ fontSize: 15, color: COLORS.ink }}
              >
                Wassim Jebali
              </span>
            </div>
            <p style={{ fontSize: 14, color: COLORS.slate, lineHeight: 1.7 }}>
              Full-stack developer building complete web products — every one
              of them live on this site.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <div>
              <div style={columnHeader}>Site</div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Work", href: "#work" },
                  { label: "What I do", href: "#services" },
                  { label: "About", href: "#about" },
                  { label: "Contact", href: "#contact" },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    style={columnLink}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLAnchorElement).style.color = COLORS.ink)
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLAnchorElement).style.color =
                        COLORS.slate)
                    }
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={columnHeader}>Projects</div>
              <div className="flex flex-col gap-3">
                <Link to="/projects" style={columnLink}>
                  All projects
                </Link>
                <Link to="/girls-boutique" style={columnLink}>
                  Girls Boutique demo
                </Link>
                <Link to="/demo/taskforge" style={columnLink}>
                  TaskForge demo
                </Link>
              </div>
            </div>

            <div>
              <div style={columnHeader}>Connect</div>
              <div className="flex flex-col gap-3">
                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noreferrer"
                  style={columnLink}
                >
                  GitHub
                </a>
                <a
                  href={SITE.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  style={columnLink}
                >
                  LinkedIn
                </a>
                <a href={`mailto:${SITE.email}`} style={columnLink}>
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-7"
          style={{ borderTop: `1px solid ${COLORS.lineFaint}` }}
        >
          <span style={{ fontSize: 13, color: "#9AA2B8" }}>
            © {year} Wassim Jebali. Designed & built by me — like everything
            else here.
          </span>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span style={{ fontSize: 13, color: COLORS.slate }}>
                Available for new work
              </span>
            </div>
            <Link
              to="/admin"
              style={{
                fontSize: 13,
                color: "#9AA2B8",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = COLORS.cobalt)
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color = "#9AA2B8")
              }
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
