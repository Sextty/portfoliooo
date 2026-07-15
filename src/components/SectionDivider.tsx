import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { COLORS, FONTS } from "@/theme/palette";

/**
 * Dimension line between sections: a hairline that draws out from the
 * center as it scrolls into view, with end ticks and a mono label —
 * the way distances are annotated on an engineering drawing.
 */
export function SectionDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scaleXVal = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const labelOpacity = useTransform(
    scrollYProgress,
    [0.3, 0.5, 0.7],
    [0, 1, 0]
  );

  return (
    <div
      ref={ref}
      className="relative h-24 md:h-32 flex items-center justify-center overflow-hidden"
    >
      {/* The dimension line */}
      <motion.div
        style={{ scaleX: scaleXVal, opacity }}
        className="absolute left-[15%] right-[15%] h-px"
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            background: COLORS.line,
          }}
        >
          {/* End ticks */}
          <span
            style={{
              position: "absolute",
              left: 0,
              top: -4,
              width: 1,
              height: 9,
              background: COLORS.trace,
            }}
          />
          <span
            style={{
              position: "absolute",
              right: 0,
              top: -4,
              width: 1,
              height: 9,
              background: COLORS.trace,
            }}
          />
        </div>
      </motion.div>

      {/* Center annotation */}
      <motion.span
        style={{
          opacity: labelOpacity,
          fontFamily: FONTS.mono,
          fontSize: 9,
          letterSpacing: "0.2em",
          color: COLORS.trace,
          background: COLORS.ground,
          padding: "0 12px",
          zIndex: 1,
        }}
      >
        ├────┤
      </motion.span>
    </div>
  );
}
