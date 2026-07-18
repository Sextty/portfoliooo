import { motion } from "motion/react";
import { SectionHeader } from "./SectionHeader";
import { COLORS } from "@/theme/palette";

/**
 * How the work gets made: a real four-step workflow (numbered because it is
 * a sequence) next to the engineering values behind every build.
 */

const workflow = [
  {
    title: "Schema first",
    body: "The data model comes before the pixels — entities, relations, and constraints designed up front so features are queries, not rewrites.",
  },
  {
    title: "API as the contract",
    body: "Endpoints are defined and seeded early, so the frontend builds against real responses from day one.",
  },
  {
    title: "Interface on real data",
    body: "UI is built against the live API — with loading, empty, and error states treated as features, not leftovers.",
  },
  {
    title: "Ship runnable",
    body: "docker-compose plus seed data. If a stranger can't run it with one command, it isn't finished.",
  },
];

const values = [
  {
    title: "Boring technology where it counts",
    body: "Proven foundations; novelty only where it earns its place.",
  },
  {
    title: "Optimistic UI, honest fallbacks",
    body: "Interfaces respond instantly and degrade gracefully when a dependency is missing.",
  },
  {
    title: "Real data or nothing",
    body: "Demos run on real schemas and seeded databases — never mocked arrays.",
  },
  {
    title: "Performance is a feature",
    body: "Code-split routes, lazy assets, and first paints that carry content.",
  },
];

export function PrinciplesSection() {
  return (
    <section id="principles" className="relative py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <SectionHeader
          eyebrow="How I ship"
          title="A process you can audit."
          sub="Every project on this site went through the same four steps — and holds to the same engineering values."
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Workflow timeline */}
          <motion.ol
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}
          >
            {/* Connecting line */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 17,
                top: 18,
                bottom: 18,
                width: 2,
                background: COLORS.line,
              }}
            />
            {workflow.map((step, i) => (
              <li
                key={step.title}
                style={{
                  position: "relative",
                  paddingLeft: 56,
                  paddingBottom: i === workflow.length - 1 ? 0 : 28,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: COLORS.paper,
                    border: `1px solid ${COLORS.line}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.cobalt,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="display"
                  style={{
                    fontSize: "1.05rem",
                    color: COLORS.ink,
                    letterSpacing: "-0.01em",
                    marginBottom: 6,
                    paddingTop: 5,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 14.5, color: COLORS.slate, lineHeight: 1.7, maxWidth: 440 }}>
                  {step.body}
                </p>
              </li>
            ))}
          </motion.ol>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-4 content-start"
          >
            {values.map((v) => (
              <div key={v.title} className="sheet" style={{ padding: "20px 22px" }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 26,
                    height: 3,
                    borderRadius: 2,
                    background: COLORS.cobalt,
                    marginBottom: 14,
                  }}
                />
                <h3
                  className="display"
                  style={{
                    fontSize: "1rem",
                    color: COLORS.ink,
                    letterSpacing: "-0.01em",
                    marginBottom: 7,
                    lineHeight: 1.3,
                  }}
                >
                  {v.title}
                </h3>
                <p style={{ fontSize: 13.5, color: COLORS.slate, lineHeight: 1.65 }}>
                  {v.body}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
