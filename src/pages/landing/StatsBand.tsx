import { useMemo } from "react";
import { Counter } from "@/components/Counter";
import { Project } from "@/utils/projectDb";
import { COLORS } from "@/theme/palette";

export function StatsBand({ projects }: { projects: Project[] }) {
  const stats = useMemo(() => {
    const demoCount = projects.filter((p) => p.runUrl).length;
    const techCount = new Set(projects.flatMap((p) => p.tags)).size;
    return [
      { value: projects.length, suffix: "", label: "Products built end to end" },
      { value: demoCount, suffix: "", label: "Live demos on this site" },
      { value: 3, suffix: "+", label: "Years shipping for the web" },
      { value: techCount, suffix: "+", label: "Technologies in production" },
    ];
  }, [projects]);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pb-8">
      <div
        className="sheet grid grid-cols-2 lg:grid-cols-4"
        style={{ overflow: "hidden" }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: "26px 28px",
              borderLeft: i % 2 === 1 ? `1px solid ${COLORS.lineFaint}` : "none",
              borderTop: i >= 2 ? `1px solid ${COLORS.lineFaint}` : "none",
            }}
            className={i >= 2 ? "lg:!border-t-0 lg:!border-l" : ""}
          >
            <div
              className="display"
              style={{ fontSize: "2rem", color: COLORS.ink, lineHeight: 1.1 }}
            >
              <Counter value={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontSize: 13.5, color: COLORS.slate, marginTop: 6 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
