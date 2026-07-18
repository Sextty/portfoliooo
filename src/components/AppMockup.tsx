import { CSSProperties, ReactNode } from "react";
import { tint } from "@/utils/color";

/**
 * The signature of the redesign: every project renders as a miniature of
 * its actual product UI — drawn in CSS/SVG, tinted with the project's own
 * color — inside a browser-chrome frame. Nothing is a screenshot; the
 * "Launch" actions around these frames open the real in-browser demos.
 */

/* Neutral mini-UI tokens */
const MK = {
  canvas: "#FBFCFE",
  panel: "#FFFFFF",
  line: "#EDF0F6",
  barSoft: "#E8ECF3",
  bar: "#D6DCE8",
  barStrong: "#B9C2D4",
};

/* ─── Tiny building blocks ───────────────────────────────── */
function Bar({
  w,
  h = 6,
  color = MK.bar,
  r = 3,
  style,
}: {
  w: number | string;
  h?: number;
  color?: string;
  r?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background: color,
        borderRadius: r,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

function Dot({ size = 8, color = MK.bar, style }: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: color,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/* ─── Browser chrome frame ───────────────────────────────── */
export function BrowserFrame({
  url,
  children,
  className,
  style,
  flat = false,
}: {
  url: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** flat frames sit inside cards (no big drop shadow) */
  flat?: boolean;
}) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",
        border: "1px solid #E3E7F0",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: flat
          ? "0 1px 2px rgba(15,18,34,0.05)"
          : "0 30px 70px -24px rgba(15,18,34,0.28), 0 8px 24px -12px rgba(15,18,34,0.12)",
        ...style,
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 32,
          padding: "0 12px",
          background: "#F3F5F9",
          borderBottom: "1px solid #E8EBF2",
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          <Dot size={9} color="#E8A69E" />
          <Dot size={9} color="#EFD29A" />
          <Dot size={9} color="#A4D4AE" />
        </div>
        <div
          className="mono"
          style={{
            flex: 1,
            maxWidth: 260,
            fontSize: 9.5,
            lineHeight: "18px",
            color: "#8A93A8",
            background: "#fff",
            border: "1px solid #E8EBF2",
            borderRadius: 999,
            padding: "0 10px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {url}
        </div>
      </div>
      {/* App canvas */}
      <div style={{ aspectRatio: "16 / 10", position: "relative", overflow: "hidden", background: MK.canvas }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Variant: storefront (Girls Boutique) ───────────────── */
function StorefrontMock({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      {/* Shop nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7% 6% 0",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot size={10} color={color} />
          <Bar w="18%" h={6} color={MK.barStrong} style={{ width: 34 }} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Bar w={22} h={5} />
          <Bar w={22} h={5} />
          <Dot size={9} color={tint(color, 0.5)} />
        </div>
      </div>
      {/* Hero banner */}
      <div
        style={{
          margin: "4% 6% 0",
          borderRadius: 8,
          background: `linear-gradient(120deg, ${tint(color, 0.16)}, ${tint(color, 0.06)})`,
          border: `1px solid ${tint(color, 0.2)}`,
          padding: "4.5% 6%",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <Bar w="46%" h={8} color={MK.barStrong} />
        <Bar w="30%" h={5} />
        <div
          style={{
            marginTop: 3,
            width: 44,
            height: 12,
            borderRadius: 999,
            background: color,
          }}
        />
      </div>
      {/* Product grid */}
      <div style={{ display: "flex", gap: "4%", padding: "4.5% 6%", flex: 1 }}>
        {[0.5, 0.28, 0.4].map((a, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: MK.panel,
              border: `1px solid ${MK.line}`,
              borderRadius: 8,
              padding: "4% 5%",
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <div
              style={{
                width: "100%",
                flex: 1,
                minHeight: 18,
                borderRadius: 5,
                background: `linear-gradient(150deg, ${tint(color, a * 0.5)}, ${tint(color, a * 0.22)})`,
              }}
            />
            <Bar w="72%" h={5} color={MK.bar} />
            <Bar w="38%" h={5} color={tint(color, 0.75)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Variant: analytics dashboard (DevPulse) ────────────── */
function AnalyticsMock({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "17%",
          borderRight: `1px solid ${MK.line}`,
          background: MK.panel,
          padding: "8% 4%",
          display: "flex",
          flexDirection: "column",
          gap: 9,
          alignItems: "flex-start",
        }}
      >
        <Dot size={10} color={color} />
        <Bar w="80%" h={5} color={tint(color, 0.45)} />
        <Bar w="80%" h={5} />
        <Bar w="65%" h={5} />
        <Bar w="72%" h={5} />
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: "4% 5%", display: "flex", flexDirection: "column", gap: "4%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Bar w="26%" h={7} color={MK.barStrong} />
          <Bar w="14%" h={10} color={tint(color, 0.22)} r={999} />
        </div>
        {/* Stat tiles */}
        <div style={{ display: "flex", gap: "4%" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: MK.panel,
                border: `1px solid ${MK.line}`,
                borderRadius: 7,
                padding: "4% 5%",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <Bar w="55%" h={4} />
              <Bar w="40%" h={8} color={i === 0 ? color : MK.barStrong} />
            </div>
          ))}
        </div>
        {/* Line chart */}
        <div
          style={{
            flex: 1,
            background: MK.panel,
            border: `1px solid ${MK.line}`,
            borderRadius: 7,
            padding: "3% 4%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {[10, 20, 30].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={MK.line} strokeWidth="0.6" />
            ))}
            <path
              d="M0,34 L14,28 L28,30 L42,20 L56,23 L70,13 L84,16 L100,7 L100,40 L0,40 Z"
              fill={tint(color, 0.13)}
            />
            <path
              d="M0,34 L14,28 L28,30 L42,20 L56,23 L70,13 L84,16 L100,7"
              fill="none"
              stroke={color}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="70" cy="13" r="2.2" fill="#fff" stroke={color} strokeWidth="1.4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Variant: chat (ChatFlow AI) ────────────────────────── */
function ChatMock({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      {/* Conversations */}
      <div
        style={{
          width: "27%",
          borderRight: `1px solid ${MK.line}`,
          background: MK.panel,
          padding: "6% 3%",
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              background: i === 0 ? tint(color, 0.1) : "transparent",
              borderRadius: 6,
              padding: "6% 7%",
            }}
          >
            <Dot size={12} color={i === 0 ? tint(color, 0.7) : MK.bar} />
            <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
              <Bar w="80%" h={4} color={i === 0 ? MK.barStrong : MK.bar} />
              <Bar w="55%" h={3} color={MK.barSoft} />
            </div>
          </div>
        ))}
      </div>
      {/* Thread */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "3.5% 5%",
            borderBottom: `1px solid ${MK.line}`,
            background: MK.panel,
          }}
        >
          <Dot size={11} color={tint(color, 0.7)} />
          <Bar w="24%" h={5} color={MK.barStrong} />
          <Dot size={6} color="#34B36F" style={{ marginLeft: "auto" }} />
        </div>
        <div style={{ flex: 1, padding: "4% 5%", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ alignSelf: "flex-start", maxWidth: "62%", background: "#EEF1F7", borderRadius: "10px 10px 10px 3px", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4, width: "52%" }}>
            <Bar w="100%" h={4} color={MK.bar} />
            <Bar w="70%" h={4} color={MK.bar} />
          </div>
          <div style={{ alignSelf: "flex-end", maxWidth: "62%", background: color, borderRadius: "10px 10px 3px 10px", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4, width: "44%" }}>
            <Bar w="100%" h={4} color="rgba(255,255,255,0.85)" />
            <Bar w="58%" h={4} color="rgba(255,255,255,0.6)" />
          </div>
          {/* typing indicator */}
          <div style={{ alignSelf: "flex-start", background: "#EEF1F7", borderRadius: "10px 10px 10px 3px", padding: "8px 12px", display: "flex", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: MK.barStrong,
                  animation: `mk-typing 1.2s ease-in-out ${i * 0.18}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center", padding: "3% 5% 4.5%" }}>
          <div style={{ flex: 1, height: 16, borderRadius: 999, background: MK.panel, border: `1px solid ${MK.bar}` }} />
          <Dot size={16} color={color} />
        </div>
      </div>
    </div>
  );
}

/* ─── Variant: file storage (CloudVault) ─────────────────── */
function FilesMock({ color }: { color: string }) {
  const files = [
    { w: "34%", p: 0.85 },
    { w: "46%", p: 0.55 },
    { w: "28%", p: 0.72 },
    { w: "40%", p: 0.35 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "4.5% 6%", gap: "4%" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, maxWidth: "42%", height: 15, borderRadius: 999, background: MK.panel, border: `1px solid ${MK.bar}` }} />
        <div style={{ marginLeft: "auto", width: 58, height: 15, borderRadius: 999, background: color }} />
      </div>
      {/* Storage meter */}
      <div style={{ background: MK.panel, border: `1px solid ${MK.line}`, borderRadius: 7, padding: "3% 4%", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Bar w="26%" h={5} color={MK.barStrong} />
          <Bar w="14%" h={5} color={tint(color, 0.6)} />
        </div>
        <div style={{ height: 7, borderRadius: 999, background: MK.barSoft, overflow: "hidden" }}>
          <div
            style={{
              width: "68%",
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${color}, ${tint(color, 0.65)})`,
              transformOrigin: "left",
              animation: "mk-grow-x 1.1s cubic-bezier(0.16,1,0.3,1) both",
            }}
          />
        </div>
      </div>
      {/* File rows */}
      <div style={{ flex: 1, background: MK.panel, border: `1px solid ${MK.line}`, borderRadius: 7, padding: "2% 4%", display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
        {files.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 10, borderRadius: 2.5, background: tint(color, 0.22 + f.p * 0.4), flexShrink: 0 }} />
            <Bar w={f.w} h={5} />
            <Bar w="10%" h={4} color={MK.barSoft} style={{ marginLeft: "auto" }} />
            <Dot size={5} color={MK.bar} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Variant: kanban (TaskForge) ────────────────────────── */
function KanbanMock({ color }: { color: string }) {
  const cols: { cards: { a: number; lift?: boolean }[] }[] = [
    { cards: [{ a: 0.7 }, { a: 0.3 }, { a: 0.45 }] },
    { cards: [{ a: 0.55, lift: true }, { a: 0.25 }] },
    { cards: [{ a: 0.4 }, { a: 0.6 }] },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, padding: "4.5% 5%", display: "flex", flexDirection: "column", gap: "3.5%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Bar w="22%" h={7} color={MK.barStrong} />
        <div style={{ marginLeft: "auto", display: "flex", gap: -4 }}>
          <Dot size={11} color={tint(color, 0.7)} />
          <Dot size={11} color={MK.bar} style={{ marginLeft: -4 }} />
          <Dot size={11} color={MK.barStrong} style={{ marginLeft: -4 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "3.5%", flex: 1, minHeight: 0 }}>
        {cols.map((col, ci) => (
          <div
            key={ci}
            style={{
              flex: 1,
              background: "#F2F4F9",
              borderRadius: 8,
              padding: "3% 3.5%",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <Dot size={6} color={[color, tint(color, 0.55), "#34B36F"][ci]} />
              <Bar w="45%" h={4} color={MK.barStrong} />
            </div>
            {col.cards.map((card, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: `1px solid ${MK.line}`,
                  borderLeft: `3px solid ${tint(color, card.a)}`,
                  borderRadius: 6,
                  padding: "7% 8%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  ...(card.lift
                    ? {
                        transform: "rotate(-2.5deg) translateY(-2px)",
                        boxShadow: "0 8px 18px rgba(15,18,34,0.14)",
                      }
                    : {}),
                }}
              >
                <Bar w="85%" h={4} />
                <Bar w="55%" h={4} color={MK.barSoft} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Variant: notes (SnapNote) ──────────────────────────── */
function NotesMock({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      {/* Note list */}
      <div style={{ width: "32%", borderRight: `1px solid ${MK.line}`, background: MK.panel, padding: "5% 3.5%", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ height: 13, borderRadius: 999, background: "#F2F4F9", border: `1px solid ${MK.line}`, marginBottom: 3 }} />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              borderRadius: 6,
              background: i === 0 ? tint(color, 0.1) : "transparent",
              border: `1px solid ${i === 0 ? tint(color, 0.25) : "transparent"}`,
              padding: "6% 8%",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <Bar w="75%" h={4.5} color={i === 0 ? MK.barStrong : MK.bar} />
            <Bar w="92%" h={3.5} color={MK.barSoft} />
          </div>
        ))}
      </div>
      {/* Markdown preview */}
      <div style={{ flex: 1, padding: "4.5% 5.5%", display: "flex", flexDirection: "column", gap: 7 }}>
        <Bar w="48%" h={9} color={MK.barStrong} />
        <div style={{ display: "flex", gap: 5 }}>
          <Bar w={30} h={9} color={tint(color, 0.18)} r={999} />
          <Bar w={38} h={9} color={tint(color, 0.12)} r={999} />
        </div>
        <Bar w="94%" h={4.5} />
        <Bar w="88%" h={4.5} />
        <Bar w="60%" h={4.5} />
        {/* code block */}
        <div style={{ background: "#141830", borderRadius: 7, padding: "4% 5%", display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
          <Bar w="55%" h={4} color={tint(color, 0.85)} />
          <Bar w="40%" h={4} color="rgba(255,255,255,0.35)" />
          <Bar w="66%" h={4} color="rgba(255,255,255,0.22)" />
        </div>
        <Bar w="80%" h={4.5} />
        <Bar w="44%" h={4.5} />
      </div>
    </div>
  );
}

/* ─── Variant: fitness (FitTrack) ────────────────────────── */
function FitnessMock({ color }: { color: string }) {
  const bars = [0.45, 0.7, 0.35, 0.85, 0.55, 0.95, 0.62];
  return (
    <div style={{ position: "absolute", inset: 0, padding: "4.5% 6%", display: "flex", flexDirection: "column", gap: "4%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Bar w="30%" h={7} color={MK.barStrong} />
        <Bar w="14%" h={11} color={tint(color, 0.2)} r={999} style={{ marginLeft: "auto" }} />
      </div>
      <div style={{ display: "flex", gap: "4.5%", flex: 1, minHeight: 0 }}>
        {/* Weekly volume bars */}
        <div style={{ flex: 1.5, background: MK.panel, border: `1px solid ${MK.line}`, borderRadius: 8, padding: "4% 5%", display: "flex", flexDirection: "column" }}>
          <Bar w="38%" h={4.5} style={{ marginBottom: "auto" }} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: "5%", height: "68%" }}>
            {bars.map((b, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${b * 100}%`,
                  borderRadius: "4px 4px 2px 2px",
                  background: i === 5 ? color : tint(color, 0.3 + b * 0.25),
                  transformOrigin: "bottom",
                  animation: `mk-grow 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
                }}
              />
            ))}
          </div>
        </div>
        {/* Goal ring */}
        <div style={{ flex: 1, background: MK.panel, border: `1px solid ${MK.line}`, borderRadius: 8, padding: "5%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <svg viewBox="0 0 42 42" style={{ width: "56%", maxWidth: 84 }}>
            <circle cx="21" cy="21" r="17" fill="none" stroke={MK.barSoft} strokeWidth="5" />
            <circle
              cx="21"
              cy="21"
              r="17"
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="107"
              strokeDashoffset="30"
              transform="rotate(-90 21 21)"
            />
          </svg>
          <Bar w="55%" h={4.5} />
        </div>
      </div>
    </div>
  );
}

/* ─── Variant: live polls (PollWave) ─────────────────────── */
function PollsMock({ color }: { color: string }) {
  const options = [0.72, 0.48, 0.31, 0.15];
  return (
    <div style={{ position: "absolute", inset: 0, padding: "5% 6.5%", display: "flex", flexDirection: "column", gap: "4%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Bar w="52%" h={8} color={MK.barStrong} />
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
            border: `1px solid ${tint(color, 0.4)}`,
            borderRadius: 999,
            padding: "3px 8px",
          }}
        >
          <div style={{ width: 5, height: 5, borderRadius: 999, background: color, animation: "live-pulse 2s ease-out infinite" }} />
          <Bar w={18} h={4} color={tint(color, 0.6)} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
        {options.map((p, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Bar w={`${26 + i * 6}%`} h={4.5} />
              <Bar w="9%" h={4.5} color={i === 0 ? tint(color, 0.8) : MK.bar} />
            </div>
            <div style={{ height: 11, borderRadius: 999, background: MK.barSoft, overflow: "hidden" }}>
              <div
                style={{
                  width: `${p * 100}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: i === 0 ? color : tint(color, 0.75 - i * 0.16),
                  transformOrigin: "left",
                  animation: `mk-grow-x 1s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex" }}>
          <Dot size={10} color={tint(color, 0.7)} />
          <Dot size={10} color={MK.bar} style={{ marginLeft: -3 }} />
          <Dot size={10} color={MK.barStrong} style={{ marginLeft: -3 }} />
        </div>
        <Bar w="24%" h={4} color={MK.barSoft} />
      </div>
    </div>
  );
}

/* ─── Variant: generic app (fallback for new projects) ───── */
function GenericMock({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      <div style={{ width: "17%", borderRight: `1px solid ${MK.line}`, background: MK.panel, padding: "8% 4%", display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-start" }}>
        <Dot size={10} color={color} />
        <Bar w="80%" h={5} color={tint(color, 0.45)} />
        <Bar w="70%" h={5} />
        <Bar w="76%" h={5} />
      </div>
      <div style={{ flex: 1, padding: "4.5% 5.5%", display: "flex", flexDirection: "column", gap: "4.5%" }}>
        <Bar w="32%" h={8} color={MK.barStrong} />
        <div style={{ display: "flex", gap: "4%" }}>
          <div style={{ flex: 1.6, height: 54, background: MK.panel, border: `1px solid ${MK.line}`, borderRadius: 7, padding: "3% 4%", display: "flex", flexDirection: "column", gap: 5 }}>
            <Bar w="60%" h={5} />
            <Bar w="85%" h={5} color={MK.barSoft} />
            <Bar w="45%" h={5} color={tint(color, 0.5)} />
          </div>
          <div style={{ flex: 1, height: 54, background: tint(color, 0.1), border: `1px solid ${tint(color, 0.22)}`, borderRadius: 7 }} />
        </div>
        <div style={{ flex: 1, background: MK.panel, border: `1px solid ${MK.line}`, borderRadius: 7, padding: "3% 4%", display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
          <Bar w="90%" h={5} />
          <Bar w="76%" h={5} color={MK.barSoft} />
          <Bar w="83%" h={5} />
        </div>
      </div>
    </div>
  );
}

/* ─── Registry ───────────────────────────────────────────── */
const VARIANTS: Record<string, (props: { color: string }) => ReactNode> = {
  "girls-boutique": StorefrontMock,
  devpulse: AnalyticsMock,
  "chatflow-ai": ChatMock,
  cloudvault: FilesMock,
  taskforge: KanbanMock,
  snapnote: NotesMock,
  fittrack: FitnessMock,
  pollwave: PollsMock,
};

export function AppMockup({ projectId, color }: { projectId: string; color: string }) {
  const Variant = VARIANTS[projectId] ?? GenericMock;
  return <Variant color={color} />;
}
