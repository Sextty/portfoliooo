import { useEffect, useMemo, useState } from "react";
import DemoShell from "./DemoShell";

// Deterministic RNG so the dashboard shows the same data every visit —
// mirrors the seeded sample generator in the real FastAPI backend.
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AUTHORS = ["alina", "marcus", "wassim", "priya", "diego", "yuki"];
const BRANCHES = ["main", "develop", "feat/auth", "feat/billing", "fix/socket-retry", "chore/deps"];
const PIPE_STEPS = ["install", "lint", "test", "build", "publish"];

interface Week {
  label: string;
  commits: number;
  prs: number;
}
interface Day {
  deploys: number;
  failures: number;
}
interface Author {
  author: string;
  commits: number;
  additions: number;
  deletions: number;
}
interface Pipeline {
  id: number;
  branch: string;
  author: string;
  status: "success" | "failed" | "running";
  durationS: number;
  minutesAgo: number;
  failedStep?: string;
}
interface Deploy {
  id: number;
  env: "production" | "staging";
  version: string;
  author: string;
  status: "live" | "failed" | "rolled back";
  minutesAgo: number;
}

function generate() {
  const rng = mulberry32(42);
  const weeks: Week[] = [];
  const days: Day[] = [];
  const authors: Author[] = AUTHORS.map((a) => ({ author: a, commits: 0, additions: 0, deletions: 0 }));

  let totalCommits = 0;
  let totalDeploys = 0;
  let failedDeploys = 0;
  let buildMsSum = 0;
  let buildCount = 0;

  const now = new Date();
  for (let w = 11; w >= 0; w--) {
    const start = new Date(now);
    start.setDate(now.getDate() - w * 7);
    let commits = 0;
    let prs = 0;
    for (let d = 0; d < 7; d++) {
      const weekday = (start.getDay() + d) % 7;
      const factor = weekday === 0 || weekday === 6 ? 0.3 : 1;
      const dayCommits = Math.floor((4 + rng() * 18) * factor);
      commits += dayCommits;
      totalCommits += dayCommits;
      for (let c = 0; c < dayCommits; c++) {
        const a = authors[Math.floor(rng() * authors.length)];
        a.commits++;
        a.additions += Math.floor(3 + rng() * 317);
        a.deletions += Math.floor(rng() * 140);
      }
      prs += Math.floor(rng() * 4 * factor);

      const deploys = Math.floor(rng() * 3.4);
      const failures = deploys > 0 && rng() < 0.18 ? 1 : 0;
      totalDeploys += deploys;
      failedDeploys += failures;
      days.push({ deploys, failures });

      const builds = 2 + Math.floor(rng() * 8);
      for (let b = 0; b < builds; b++) {
        buildMsSum += 40_000 + rng() * 440_000;
        buildCount++;
      }
    }
    weeks.push({
      label: start.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      commits,
      prs,
    });
  }

  // Recent pipeline runs (newest first); the first one arrives "running".
  const pipelines: Pipeline[] = [];
  let clock = 2;
  for (let i = 0; i < 14; i++) {
    const failed = rng() < 0.2;
    pipelines.push({
      id: 4816 - i,
      branch: BRANCHES[Math.floor(rng() * BRANCHES.length)],
      author: AUTHORS[Math.floor(rng() * AUTHORS.length)],
      status: i === 0 ? "running" : failed ? "failed" : "success",
      durationS: Math.floor(45 + rng() * 420),
      minutesAgo: clock,
      failedStep: failed ? PIPE_STEPS[1 + Math.floor(rng() * 3)] : undefined,
    });
    clock += Math.floor(6 + rng() * 90);
  }

  // Deploy log across environments.
  const deploysLog: Deploy[] = [];
  let dClock = 14;
  for (let i = 0; i < 10; i++) {
    const env = rng() < 0.4 ? "production" : "staging";
    const roll = rng();
    deploysLog.push({
      id: i,
      env,
      version: `v2.${8 - Math.floor(i / 3)}.${Math.floor(rng() * 9)}`,
      author: AUTHORS[Math.floor(rng() * AUTHORS.length)],
      status: roll < 0.72 ? "live" : roll < 0.86 ? "failed" : "rolled back",
      minutesAgo: dClock,
    });
    dClock += Math.floor(30 + rng() * 300);
  }

  authors.sort((a, b) => b.commits - a.commits);
  return {
    weeks,
    days,
    authors,
    pipelines,
    deploysLog,
    summary: {
      commits: totalCommits,
      deploys: totalDeploys,
      successRate: totalDeploys ? Math.round(1000 * (1 - failedDeploys / totalDeploys)) / 10 : 100,
      avgBuildS: Math.round(buildMsSum / Math.max(buildCount, 1) / 1000),
      devs: AUTHORS.length,
    },
  };
}

/* ─── UI primitives (DevPulse brand) ─────────────────────── */

const panel: React.CSSProperties = {
  background: "#131c2e",
  border: "1px solid #24304a",
  borderRadius: 12,
  padding: "18px 20px",
  marginBottom: 22,
};

const th: React.CSSProperties = {
  textAlign: "left",
  color: "#7c8aa0",
  fontWeight: 500,
  padding: "6px 10px",
};
const td: React.CSSProperties = {
  padding: "9px 10px",
  borderTop: "1px solid #24304a",
};

function Stat({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div style={{ background: "#131c2e", border: "1px solid #24304a", borderTop: `3px solid ${accent}`, borderRadius: 10, padding: "18px 16px" }}>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
      <div style={{ color: "#7c8aa0", fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    success: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Success" },
    live: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Live" },
    failed: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Failed" },
    "rolled back": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Rolled back" },
    running: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", label: "Running" },
  };
  const s = map[status] ?? map.success;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.color}44`,
        borderRadius: 999,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {status === "running" && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: s.color,
            animation: "live-pulse 1.6s ease-out infinite",
          }}
        />
      )}
      {s.label}
    </span>
  );
}

function ago(minutes: number) {
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TABS = ["Overview", "Pipelines", "Deploys"] as const;
type Tab = (typeof TABS)[number];
const RANGES = [4, 8, 12] as const;

export default function DevPulseDemo() {
  const [data] = useState(generate);
  const [tab, setTab] = useState<Tab>("Overview");
  const [rangeWeeks, setRangeWeeks] = useState<(typeof RANGES)[number]>(12);
  // The "running" pipeline progresses live while the page is open.
  const [runProgress, setRunProgress] = useState(0.34);

  useEffect(() => {
    const t = setInterval(() => {
      setRunProgress((p) => (p >= 0.98 ? 0.12 : p + 0.013));
    }, 400);
    return () => clearInterval(t);
  }, []);

  const { authors, pipelines, deploysLog, summary } = data;
  const weeks = useMemo(() => data.weeks.slice(-rangeWeeks), [data.weeks, rangeWeeks]);
  const days = useMemo(() => data.days.slice(-rangeWeeks * 7), [data.days, rangeWeeks]);

  const maxWeek = Math.max(...weeks.map((w) => Math.max(w.commits, w.prs)));
  const maxCommits = Math.max(...authors.map((a) => a.commits), 1);
  const maxDeploys = Math.max(...days.map((d) => d.deploys), 1);

  // Area path for deploys/day.
  const areaPath = useMemo(() => {
    const W = 760;
    const H = 150;
    const step = W / (days.length - 1);
    const pts = days.map((d, i) => `${(i * step).toFixed(1)},${(H - (d.deploys / maxDeploys) * (H - 8)).toFixed(1)}`);
    return {
      line: `M ${pts.join(" L ")}`,
      area: `M 0,${150} L ${pts.join(" L ")} L 760,150 Z`,
    };
  }, [days, maxDeploys]);

  const runningStep = PIPE_STEPS[Math.min(Math.floor(runProgress * PIPE_STEPS.length), PIPE_STEPS.length - 1)];

  return (
    <DemoShell
      title="DevPulse"
      tagline="Developer Analytics Dashboard"
      accent="#10b981"
      github="https://github.com/Sextty/DevPulse"
      bg="#0b1220"
    >
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "18px 20px 60px" }}>
        {/* App nav: view tabs + time range */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 4, background: "#131c2e", border: "1px solid #24304a", borderRadius: 10, padding: 4 }}>
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 7,
                  padding: "7px 16px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  background: tab === t ? "#10b981" : "transparent",
                  color: tab === t ? "#062a1e" : "#7c8aa0",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Overview" && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: "#131c2e", border: "1px solid #24304a", borderRadius: 10, padding: 4 }}>
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRangeWeeks(r)}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 7,
                    padding: "6px 12px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    background: rangeWeeks === r ? "#24304a" : "transparent",
                    color: rangeWeeks === r ? "#c7d2e4" : "#7c8aa0",
                  }}
                >
                  {r}w
                </button>
              ))}
            </div>
          )}
        </div>

        {tab === "Overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
              <Stat label="Commits" value={summary.commits.toLocaleString()} accent="#10b981" />
              <Stat label="Deploys" value={summary.deploys} accent="#38bdf8" />
              <Stat label="Deploy success" value={`${summary.successRate}%`} accent="#a78bfa" />
              <Stat label="Avg build" value={`${summary.avgBuildS}s`} accent="#f59e0b" />
              <Stat label="Active devs" value={summary.devs} accent="#f472b6" />
            </div>

            {/* velocity grouped bars */}
            <div style={panel}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: "#c7d2e4" }}>
                Team velocity — commits &amp; PRs merged per week
              </h2>
              <svg viewBox="0 0 760 210" style={{ width: "100%", height: "auto" }}>
                {weeks.map((w, i) => {
                  const gw = 760 / weeks.length;
                  const x = i * gw + 8;
                  const bw = Math.min((gw - 22) / 2, 26);
                  const hC = (w.commits / maxWeek) * 168;
                  const hP = (w.prs / maxWeek) * 168;
                  return (
                    <g key={w.label}>
                      <title>{`${w.label}: ${w.commits} commits, ${w.prs} PRs`}</title>
                      <rect x={x} y={176 - hC} width={bw} height={hC} rx={2} fill="#10b981" />
                      <rect x={x + bw + 3} y={176 - hP} width={bw} height={hP} rx={2} fill="#38bdf8" />
                      {(weeks.length <= 6 || i % 2 === 0) && (
                        <text x={x + bw} y={196} textAnchor="middle" fontSize={10} fill="#7c8aa0">
                          {w.label}
                        </text>
                      )}
                    </g>
                  );
                })}
                <g fontSize={11}>
                  <rect x={600} y={0} width={10} height={10} fill="#10b981" rx={2} />
                  <text x={615} y={9} fill="#7c8aa0">commits</text>
                  <rect x={678} y={0} width={10} height={10} fill="#38bdf8" rx={2} />
                  <text x={693} y={9} fill="#7c8aa0">PRs</text>
                </g>
              </svg>
            </div>

            {/* deploy frequency area */}
            <div style={panel}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: "#c7d2e4" }}>
                Deploy frequency (per day, {rangeWeeks} weeks)
              </h2>
              <svg viewBox="0 0 760 160" style={{ width: "100%", height: "auto" }}>
                <path d={areaPath.area} fill="rgba(56,189,248,0.18)" />
                <path d={areaPath.line} fill="none" stroke="#38bdf8" strokeWidth={2} />
                {days.map((d, i) =>
                  d.failures > 0 ? (
                    <circle
                      key={i}
                      cx={(i * 760) / (days.length - 1)}
                      cy={150 - (d.deploys / maxDeploys) * 142}
                      r={3}
                      fill="#ef4444"
                      opacity={0.85}
                    />
                  ) : null,
                )}
              </svg>
              <div style={{ color: "#7c8aa0", fontSize: 11, marginTop: 6 }}>red dots = days with a failed deploy</div>
            </div>

            {/* authors table */}
            <div style={panel}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: "#c7d2e4" }}>Top contributors</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    {["Author", "Commits", "+ / −", ""].map((h) => (
                      <th key={h} style={th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {authors.map((a) => (
                    <tr key={a.author}>
                      <td style={{ ...td, fontFamily: "ui-monospace, monospace" }}>{a.author}</td>
                      <td style={td}>{a.commits}</td>
                      <td style={{ ...td, fontFamily: "ui-monospace, monospace" }}>
                        <span style={{ color: "#10b981" }}>+{a.additions.toLocaleString()}</span>{" "}
                        <span style={{ color: "#ef4444" }}>−{a.deletions.toLocaleString()}</span>
                      </td>
                      <td style={{ ...td, width: "38%" }}>
                        <span
                          style={{
                            display: "block",
                            height: 8,
                            borderRadius: 4,
                            width: `${(a.commits / maxCommits) * 100}%`,
                            background: "linear-gradient(90deg, #10b981, #38bdf8)",
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "Pipelines" && (
          <>
            {/* Live running pipeline */}
            <div style={{ ...panel, borderColor: "#38bdf866" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <StatusChip status="running" />
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13.5, color: "#c7d2e4" }}>
                  #{pipelines[0].id} · {pipelines[0].branch}
                </span>
                <span style={{ color: "#7c8aa0", fontSize: 13 }}>by {pipelines[0].author}</span>
                <span style={{ marginLeft: "auto", color: "#7c8aa0", fontSize: 12.5 }}>
                  step: <span style={{ color: "#38bdf8", fontWeight: 600 }}>{runningStep}</span>
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "#24304a", overflow: "hidden", marginBottom: 12 }}>
                <div
                  style={{
                    width: `${Math.round(runProgress * 100)}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #38bdf8, #10b981)",
                    transition: "width 0.4s linear",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PIPE_STEPS.map((s, i) => {
                  const done = i < runProgress * PIPE_STEPS.length - 0.5;
                  const active = s === runningStep;
                  return (
                    <span
                      key={s}
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: 12,
                        padding: "3px 10px",
                        borderRadius: 999,
                        border: `1px solid ${active ? "#38bdf8" : done ? "#10b98166" : "#24304a"}`,
                        color: active ? "#38bdf8" : done ? "#10b981" : "#7c8aa0",
                      }}
                    >
                      {done && !active ? "✓ " : ""}
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Run history */}
            <div style={panel}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: "#c7d2e4" }}>Recent runs</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 560 }}>
                  <thead>
                    <tr>
                      {["Run", "Branch", "Author", "Status", "Duration", "When"].map((h) => (
                        <th key={h} style={th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pipelines.slice(1).map((p) => (
                      <tr key={p.id}>
                        <td style={{ ...td, fontFamily: "ui-monospace, monospace", color: "#c7d2e4" }}>#{p.id}</td>
                        <td style={{ ...td, fontFamily: "ui-monospace, monospace" }}>{p.branch}</td>
                        <td style={td}>{p.author}</td>
                        <td style={td}>
                          <StatusChip status={p.status} />
                          {p.failedStep && (
                            <span style={{ color: "#7c8aa0", fontSize: 12, marginLeft: 8 }}>at {p.failedStep}</span>
                          )}
                        </td>
                        <td style={{ ...td, fontFamily: "ui-monospace, monospace" }}>
                          {Math.floor(p.durationS / 60)}m {p.durationS % 60}s
                        </td>
                        <td style={{ ...td, color: "#7c8aa0" }}>{ago(p.minutesAgo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "Deploys" && (
          <div style={panel}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: "#c7d2e4" }}>Deploy log</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 560 }}>
                <thead>
                  <tr>
                    {["Environment", "Version", "Author", "Status", "When"].map((h) => (
                      <th key={h} style={th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deploysLog.map((d) => (
                    <tr key={d.id}>
                      <td style={td}>
                        <span
                          style={{
                            fontFamily: "ui-monospace, monospace",
                            fontSize: 13,
                            color: d.env === "production" ? "#f472b6" : "#a78bfa",
                          }}
                        >
                          {d.env}
                        </span>
                      </td>
                      <td style={{ ...td, fontFamily: "ui-monospace, monospace", color: "#c7d2e4" }}>{d.version}</td>
                      <td style={td}>{d.author}</td>
                      <td style={td}>
                        <StatusChip status={d.status} />
                      </td>
                      <td style={{ ...td, color: "#7c8aa0" }}>{ago(d.minutesAgo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p style={{ color: "#7c8aa0", fontSize: 12 }}>
          Sample data generated in-browser (seed 42) — same shape the real
          FastAPI + ClickHouse backend serves. Full app on GitHub.
        </p>
      </div>
    </DemoShell>
  );
}
