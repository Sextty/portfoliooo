import { motion, useReducedMotion } from "motion/react";
import { COLORS, FONTS } from "@/theme/palette";

/**
 * FIG. 01 — SYSTEM OVERVIEW
 * The hero signature: an engineering-drawing schematic of a full-stack
 * request (CLIENT → API → DATABASE). Strokes draw themselves on load,
 * then a redline pulse travels the request path on loop.
 */

const MONO = FONTS.mono;

interface NodeSpec {
  x: number;
  title: string;
  sub: string;
}

const NODES: NodeSpec[] = [
  { x: 24, title: "CLIENT", sub: "REACT / TS" },
  { x: 185, title: "API", sub: "NODE · PHP" },
  { x: 346, title: "DATABASE", sub: "MYSQL" },
];

const NODE_W = 110;
const NODE_Y = 150;
const NODE_H = 84;
const MID_Y = NODE_Y + NODE_H / 2;

export function BlueprintSchematic() {
  const reduced = useReducedMotion();

  // With reduced motion everything renders fully drawn, no pulse.
  const draw = (delay: number, duration = 0.5) =>
    reduced
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { delay, duration, ease: "easeInOut" as const },
        };

  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay, duration: 0.4 },
        };

  return (
    <div style={{ width: "100%", maxWidth: 520 }} aria-hidden="true">
      <svg
        viewBox="0 0 480 380"
        fill="none"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* Sheet frame */}
        <motion.rect
          x="1"
          y="1"
          width="478"
          height="378"
          stroke={COLORS.line}
          strokeWidth="1"
          {...draw(0, 0.7)}
        />
        {/* Corner ticks */}
        {(
          [
            [1, 1, 12, 0], [1, 1, 0, 12],
            [479, 1, -12, 0], [479, 1, 0, 12],
            [1, 379, 12, 0], [1, 379, 0, -12],
            [479, 379, -12, 0], [479, 379, 0, -12],
          ] as const
        ).map(([x, y, dx, dy], i) => (
          <motion.line
            key={i}
            x1={x}
            y1={y}
            x2={x + dx}
            y2={y + dy}
            stroke={COLORS.trace}
            strokeWidth="1.5"
            {...fade(0.5)}
          />
        ))}

        {/* Header */}
        <motion.text
          x="20"
          y="32"
          fontFamily={MONO}
          fontSize="12"
          fontWeight="600"
          letterSpacing="0.18em"
          fill={COLORS.redline}
          {...fade(0.3)}
        >
          FIG. 01
        </motion.text>
        <motion.text
          x="92"
          y="32"
          fontFamily={MONO}
          fontSize="12"
          letterSpacing="0.18em"
          fill={COLORS.trace}
          {...fade(0.4)}
        >
          — SYSTEM OVERVIEW
        </motion.text>
        <motion.text
          x="460"
          y="32"
          textAnchor="end"
          fontFamily={MONO}
          fontSize="10"
          letterSpacing="0.14em"
          fill={COLORS.trace}
          {...fade(0.4)}
        >
          SCALE 1:1
        </motion.text>
        <motion.line
          x1="20"
          y1="48"
          x2="460"
          y2="48"
          stroke={COLORS.lineFaint}
          strokeWidth="1"
          {...draw(0.35, 0.5)}
        />

        {/* Nodes */}
        {NODES.map((n, i) => (
          <g key={n.title}>
            <motion.rect
              x={n.x}
              y={NODE_Y}
              width={NODE_W}
              height={NODE_H}
              stroke={COLORS.print}
              strokeWidth="1.5"
              {...draw(0.5 + i * 0.2, 0.5)}
            />
            {/* Plate line under node title */}
            <motion.line
              x1={n.x + 12}
              y1={NODE_Y + 44}
              x2={n.x + NODE_W - 12}
              y2={NODE_Y + 44}
              stroke={COLORS.lineFaint}
              strokeWidth="1"
              {...draw(0.7 + i * 0.2, 0.3)}
            />
            <motion.text
              x={n.x + NODE_W / 2}
              y={NODE_Y + 32}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize="13"
              fontWeight="600"
              letterSpacing="0.14em"
              fill={COLORS.print}
              {...fade(0.75 + i * 0.2)}
            >
              {n.title}
            </motion.text>
            <motion.text
              x={n.x + NODE_W / 2}
              y={NODE_Y + 64}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize="10"
              letterSpacing="0.12em"
              fill={COLORS.trace}
              {...fade(0.85 + i * 0.2)}
            >
              {n.sub}
            </motion.text>
          </g>
        ))}

        {/* Connectors with arrowheads */}
        {(
          [
            [NODES[0].x + NODE_W, NODES[1].x, "HTTPS"],
            [NODES[1].x + NODE_W, NODES[2].x, "SQL"],
          ] as const
        ).map(([from, to, label], i) => (
          <g key={label}>
            <motion.line
              x1={from}
              y1={MID_Y}
              x2={to}
              y2={MID_Y}
              stroke={COLORS.trace}
              strokeWidth="1.5"
              {...draw(1.1 + i * 0.15, 0.35)}
            />
            <motion.path
              d={`M ${to - 7} ${MID_Y - 4} L ${to} ${MID_Y} L ${to - 7} ${MID_Y + 4}`}
              stroke={COLORS.trace}
              strokeWidth="1.5"
              {...draw(1.25 + i * 0.15, 0.2)}
            />
            <motion.text
              x={(from + to) / 2}
              y={MID_Y - 12}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize="9"
              letterSpacing="0.12em"
              fill={COLORS.trace}
              {...fade(1.3 + i * 0.15)}
            >
              {label}
            </motion.text>
          </g>
        ))}

        {/* Dimension line */}
        <motion.line
          x1="24"
          y1="300"
          x2="456"
          y2="300"
          stroke={COLORS.line}
          strokeWidth="1"
          {...draw(1.5, 0.5)}
        />
        <motion.line x1="24" y1="294" x2="24" y2="306" stroke={COLORS.trace} strokeWidth="1" {...fade(1.6)} />
        <motion.line x1="456" y1="294" x2="456" y2="306" stroke={COLORS.trace} strokeWidth="1" {...fade(1.6)} />
        <motion.text
          x="240"
          y="322"
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="9"
          letterSpacing="0.16em"
          fill={COLORS.trace}
          {...fade(1.7)}
        >
          REQUEST → RESPONSE · DESIGNED END TO END
        </motion.text>

        {/* Sheet ref bottom-left */}
        <motion.text
          x="20"
          y="366"
          fontFamily={MONO}
          fontSize="8"
          letterSpacing="0.14em"
          fill={COLORS.trace}
          opacity="0.7"
          {...fade(1.8)}
        >
          DWG WJ-2026 · SHT 1
        </motion.text>

        {/* Redline pulse traveling the request path */}
        {!reduced && (
          <motion.circle
            r="3.5"
            cy={MID_Y}
            fill={COLORS.redline}
            initial={{ cx: 79, opacity: 0 }}
            animate={{ cx: [79, 240, 401, 240, 79], opacity: [0, 1, 1, 1, 0] }}
            transition={{
              delay: 2.2,
              duration: 4.5,
              times: [0, 0.3, 0.5, 0.8, 1],
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0.8,
            }}
          />
        )}
      </svg>
    </div>
  );
}
