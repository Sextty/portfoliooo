import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
  });

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background:
          "linear-gradient(90deg, #6366f1, #34d399, #818cf8, #34d399, #6366f1)",
        backgroundSize: "200% auto",
        transformOrigin: "0%",
        scaleX,
        zIndex: 100,
      }}
    />
  );
}
