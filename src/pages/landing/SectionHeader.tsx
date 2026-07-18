import { motion } from "motion/react";
import { COLORS } from "@/theme/palette";

export function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="mb-14"
    >
      <p className="eyebrow mb-3">{eyebrow}</p>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <h2
          className="display"
          style={{
            fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)",
            letterSpacing: "-0.025em",
            color: COLORS.ink,
            lineHeight: 1.08,
          }}
        >
          {title}
        </h2>
        {sub && (
          <p
            style={{
              color: COLORS.slate,
              fontSize: 15,
              maxWidth: 380,
              lineHeight: 1.65,
            }}
          >
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}
