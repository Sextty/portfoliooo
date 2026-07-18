import { Architecture, ArchNode } from "@/data/caseStudies";
import { tint } from "@/utils/color";
import { COLORS } from "@/theme/palette";

/**
 * Three-tier system diagram (client → services → data) with request flow
 * animated along the connectors. Nodes carry the project's own color;
 * everything else stays in the neutral system palette.
 */

function NodeCard({ node, color }: { node: ArchNode; color: string }) {
  return (
    <div
      style={{
        background: COLORS.paper,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 1px 2px rgba(15,18,34,0.04)",
        minWidth: 150,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: color,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>
          {node.label}
        </span>
      </div>
      <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 3, paddingLeft: 16 }}>
        {node.sub}
      </div>
    </div>
  );
}

function Connector({ color }: { color: string }) {
  return (
    <>
      {/* Horizontal (sm and up) */}
      <div
        className="hidden sm:flex items-center self-stretch"
        aria-hidden="true"
        style={{ padding: "0 2px" }}
      >
        <svg width="44" height="12" viewBox="0 0 44 12">
          <line
            x1="0"
            y1="6"
            x2="34"
            y2="6"
            stroke={tint(color, 0.55)}
            strokeWidth="1.5"
            strokeDasharray="4 5"
            className="arch-flow"
          />
          <path d="M34 1.5 L42 6 L34 10.5 Z" fill={tint(color, 0.55)} />
        </svg>
      </div>
      {/* Vertical (mobile) */}
      <div className="flex sm:hidden justify-center" aria-hidden="true" style={{ padding: "2px 0" }}>
        <svg width="12" height="36" viewBox="0 0 12 36">
          <line
            x1="6"
            y1="0"
            x2="6"
            y2="26"
            stroke={tint(color, 0.55)}
            strokeWidth="1.5"
            strokeDasharray="4 5"
            className="arch-flow"
          />
          <path d="M1.5 26 L6 34 L10.5 26 Z" fill={tint(color, 0.55)} />
        </svg>
      </div>
    </>
  );
}

function Tier({
  title,
  nodes,
  color,
}: {
  title: string;
  nodes: ArchNode[];
  color: string;
}) {
  return (
    <div className="flex flex-col gap-2 justify-center">
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#9AA2B8",
          marginBottom: 2,
        }}
      >
        {title}
      </div>
      {nodes.map((n) => (
        <NodeCard key={n.label} node={n} color={color} />
      ))}
    </div>
  );
}

export function ArchitectureDiagram({
  architecture,
  color,
}: {
  architecture: Architecture;
  color: string;
}) {
  return (
    <div
      className="sheet"
      style={{ padding: "clamp(1.25rem, 3vw, 2rem)", overflow: "hidden" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <Tier title="Client" nodes={[architecture.client]} color={color} />
        <Connector color={color} />
        <Tier title="Services" nodes={architecture.services} color={color} />
        <Connector color={color} />
        <Tier title="Data & integrations" nodes={architecture.stores} color={color} />
      </div>
      {architecture.note && (
        <p
          style={{
            fontSize: 13.5,
            color: COLORS.slate,
            marginTop: 18,
            paddingTop: 16,
            borderTop: `1px solid ${COLORS.lineFaint}`,
            lineHeight: 1.6,
          }}
        >
          {architecture.note}
        </p>
      )}
    </div>
  );
}
