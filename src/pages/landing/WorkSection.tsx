import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeader } from "./SectionHeader";
import { useSpotlight } from "@/utils/useSpotlight";
import { Project } from "@/utils/projectDb";
import { COLORS } from "@/theme/palette";

export function WorkSection({
  projects,
  onWatchDemo,
}: {
  projects: Project[];
  onWatchDemo: (src: string, title: string, color?: string) => void;
}) {
  const featured = projects.filter((p) => p.featured);
  const spotlight = useSpotlight();

  return (
    <section id="work" className="relative py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <SectionHeader
          eyebrow="The work"
          title="Products, not prototypes."
          sub="Each of these is a complete build — frontend, API, and database. Open the live demo and click around the real thing."
        />

        {featured.length === 0 ? (
          <div
            className="sheet p-12 text-center"
            style={{ color: COLORS.slate }}
          >
            No featured projects yet. Browse the full index or add some in the
            admin panel.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                onWatchDemo={onWatchDemo}
              />
            ))}

            {/* Index tile keeps the grid rhythm and routes to everything else */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.16 }}
            >
              <Link
                to="/projects"
                onMouseMove={spotlight}
                className="sheet tech-hover spotlight h-full flex flex-col items-start justify-between p-8"
                style={{
                  textDecoration: "none",
                  minHeight: 280,
                  background: `linear-gradient(160deg, ${COLORS.cobaltSoft}, #ffffff 55%)`,
                }}
              >
                <div>
                  <p className="eyebrow mb-3">Full index</p>
                  <h3
                    className="display"
                    style={{
                      fontSize: "1.6rem",
                      color: COLORS.ink,
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    See all {projects.length} projects
                  </h3>
                  <p
                    style={{
                      color: COLORS.slate,
                      fontSize: 14.5,
                      lineHeight: 1.65,
                      marginTop: 10,
                      maxWidth: 300,
                    }}
                  >
                    The complete catalog — filterable by category, technology,
                    or what it does.
                  </p>
                </div>
                <span
                  className="btn-ghost"
                  style={{ padding: "10px 20px", fontSize: 14, marginTop: 24 }}
                >
                  Browse everything <ArrowUpRight size={15} />
                </span>
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
