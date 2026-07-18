import { motion } from "motion/react";
import { Database, Layout, Server } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { useSpotlight } from "@/utils/useSpotlight";
import { COLORS } from "@/theme/palette";

const services = [
  {
    icon: Layout,
    title: "Product frontends",
    blurb:
      "Interfaces that feel fast and finished — responsive layouts, real interaction detail, and accessibility that isn't an afterthought.",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Bootstrap"],
  },
  {
    icon: Server,
    title: "APIs & backends",
    blurb:
      "Clean, well-structured services that are easy to extend — REST APIs, auth, and business logic that stays readable a year later.",
    items: ["Node.js", "Express", "PHP", "Laravel", "REST APIs"],
  },
  {
    icon: Database,
    title: "Data & realtime",
    blurb:
      "The layer that makes products feel alive — sensible schemas, live updates over WebSockets, and caching where it counts.",
    items: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "WebSockets"],
  },
];

export function ServicesSection() {
  const spotlight = useSpotlight();

  return (
    <section id="services" className="relative py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <SectionHeader
          eyebrow="What I do"
          title="One developer, the whole stack."
          sub="From the first schema to the last hover state — no hand-offs, no gaps between design and build."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                viewport={{ once: true }}
                onMouseMove={spotlight}
                className="sheet tech-hover spotlight p-7 flex flex-col"
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: COLORS.cobaltSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <Icon size={20} style={{ color: COLORS.cobalt }} />
                </div>
                <h3
                  className="display"
                  style={{
                    fontSize: "1.25rem",
                    color: COLORS.ink,
                    letterSpacing: "-0.015em",
                    marginBottom: 10,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    color: COLORS.slate,
                    fontSize: 14.5,
                    lineHeight: 1.7,
                    marginBottom: 20,
                  }}
                >
                  {s.blurb}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {s.items.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
