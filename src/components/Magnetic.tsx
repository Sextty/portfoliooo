import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Gentle magnetic pull toward the cursor for a primary CTA.
 * Only active for fine pointers; inert under prefers-reduced-motion.
 */
export function Magnetic({
  children,
  strength = 0.18,
  max = 6,
}: {
  children: ReactNode;
  strength?: number;
  max?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 320, damping: 22 });
  const sy = useSpring(y, { stiffness: 320, damping: 22 });
  const enabled = useRef<boolean | null>(null);

  const isEnabled = () => {
    if (enabled.current === null) {
      enabled.current =
        window.matchMedia("(pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return enabled.current;
  };

  const clamp = (v: number) => Math.max(-max, Math.min(max, v));

  return (
    <motion.div
      style={{ x: sx, y: sy, display: "inline-block" }}
      onMouseMove={(e) => {
        if (!isEnabled()) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set(clamp((e.clientX - r.left - r.width / 2) * strength));
        y.set(clamp((e.clientY - r.top - r.height / 2) * strength));
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
