import { useMemo, useState } from "react";
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

  authors.sort((a, b) => b.commits - a.commits);
  return {
    weeks,
    days,
    authors,
    summary: {
      commits: totalCommits,
      deploys: totalDeploys,
      successRate: totalDeploys ? Math.round(1000 * (1 - failedDeploys / totalDeploys)) / 10 : 100,
      avgBuildS: Math.round(buildMsSum / Math.max(buildCount, 1) / 1000),
      devs: AUTHORS.length,
    },
  };
}

const panel: React.CSSProperties = {
  background: "#131c2e",
  border: "1px solid #24304a",
  borderRadius: 12,
  padding: "18px 20px",
  marginBottom: 22,
};

function Stat({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div style={{ background: "#131c2e", border: "1px solid #24304a", borderTop: `3px solid ${accent}`, borderRadius: 10, padding: "18px 16px" }}>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
      <div style={{ color: "#7c8aa0", fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function DevPulseDemo() {
  const [data] = useState(generate);
  const { weeks, days, authors, summary } = data;

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

  return (
    <DemoShell
      title="DevPulse"
      tagline="Developer Analytics Dashboard"
      accent="#10b981"
      github="https://github.com/Sextty/DevPulse"
      bg="#0b1220"
    >
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 20px 60px" }}>
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
              const bw = (gw - 22) / 2;
              const hC = (w.commits / maxWeek) * 168;
              const hP = (w.prs / maxWeek) * 168;
              return (
                <g key={i}>
                  <rect x={x} y={176 - hC} width={bw} height={hC} rx={2} fill="#10b981" />
                  <rect x={x + bw + 3} y={176 - hP} width={bw} height={hP} rx={2} fill="#38bdf8" />
                  {i % 2 === 0 && (
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
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: "#c7d2e4" }}>Deploy frequency (per day, 12 weeks)</h2>
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
                  <th key={h} style={{ textAlign: "left", color: "#7c8aa0", fontWeight: 500, padding: "6px 10px" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {authors.map((a) => (
                <tr key={a.author}>
                  <td style={{ padding: "8px 10px", borderTop: "1px solid #24304a", fontFamily: "ui-monospace, monospace" }}>{a.author}</td>
                  <td style={{ padding: "8px 10px", borderTop: "1px solid #24304a" }}>{a.commits}</td>
                  <td style={{ padding: "8px 10px", borderTop: "1px solid #24304a", fontFamily: "ui-monospace, monospace" }}>
                    <span style={{ color: "#10b981" }}>+{a.additions.toLocaleString()}</span>{" "}
                    <span style={{ color: "#ef4444" }}>−{a.deletions.toLocaleString()}</span>
                  </td>
                  <td style={{ padding: "8px 10px", borderTop: "1px solid #24304a", width: "38%" }}>
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

        <p style={{ color: "#7c8aa0", fontSize: 12 }}>
          Sample data generated in-browser (seed 42) — same shape the real
          FastAPI + ClickHouse backend serves. Full app on GitHub.
        </p>
      </div>
    </DemoShell>
  );
}
