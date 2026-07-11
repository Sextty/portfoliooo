import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export function SectionDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scaleXVal = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="relative h-24 md:h-32 flex items-center justify-center overflow-hidden">
      <motion.div
        style={{ scaleX: scaleXVal, opacity }}
        className="absolute left-[15%] right-[15%] h-px"
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(16,185,129,0.4), transparent)",
          }}
        />
      </motion.div>
      <motion.div
        style={{ opacity: useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]) }}
        className="absolute flex items-center gap-3"
      >
        <motion.span
          style={{
            scale: useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0.6, 1, 0.6]),
          }}
          className="mono"
        >
          <span style={{ fontSize: 10, color: "#6366f1", letterSpacing: "0.2em" }}>
            ◈
          </span>
        </motion.span>
      </motion.div>
    </div>
  );
}
