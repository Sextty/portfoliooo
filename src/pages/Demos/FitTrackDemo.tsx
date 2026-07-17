import { useEffect, useMemo, useState } from "react";
import DemoShell from "./DemoShell";

interface Workout {
  id: string;
  type: string;
  durationMin: number;
  calories: number;
  date: string; // YYYY-MM-DD
}

const TYPES = ["Run", "Strength", "Cycling", "Yoga", "Swim", "HIIT"];
const EMOJI: Record<string, string> = { Run: "🏃", Strength: "🏋️", Cycling: "🚴", Yoga: "🧘", Swim: "🏊", HIIT: "⚡" };
const PIE = ["#22c55e", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#ef4444"];
const STORAGE = "demo_fittrack_workouts";

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

function seedWorkouts(): Workout[] {
  const out: Workout[] = [];
  const today = new Date();
  for (let i = 0; i < 42; i++) {
    if (i > 1 && Math.random() > 0.7) continue; // keep today+yesterday for a streak
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const durationMin = 20 + Math.floor(Math.random() * 70);
    out.push({
      id: Math.random().toString(36).slice(2, 9),
      type,
      durationMin,
      calories: Math.round(durationMin * (6 + Math.random() * 6)),
      date: isoDay(day),
    });
  }
  return out;
}

function load(): Workout[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw);
  } catch { /* reseed below */ }
  return seedWorkouts();
}

function currentStreak(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  const d = new Date();
  if (!set.has(isoDay(d))) {
    d.setDate(d.getDate() - 1);
    if (!set.has(isoDay(d))) return 0;
  }
  while (set.has(isoDay(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

const panel: React.CSSProperties = {
  background: "#12181a",
  border: "1px solid #223028",
  borderRadius: 12,
  padding: "16px 18px",
};

export default function FitTrackDemo() {
  const [workouts, setWorkouts] = useState<Workout[]>(load);
  const [type, setType] = useState("Run");
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(workouts));
    } catch { /* demo state just won't persist */ }
  }, [workouts]);

  const stats = useMemo(() => {
    const totalMinutes = workouts.reduce((s, w) => s + w.durationMin, 0);
    const totalCalories = workouts.reduce((s, w) => s + w.calories, 0);
    const streak = currentStreak(workouts.map((w) => w.date));

    // last 8 Monday-based weeks
    const weeks: { label: string; minutes: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const minutes = workouts
        .filter((w) => {
          const d = new Date(w.date);
          return d >= start && d < end;
        })
        .reduce((s, w) => s + w.durationMin, 0);
      weeks.push({
        label: start.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        minutes,
      });
    }

    const byType = TYPES.map((t) => ({
      type: t,
      minutes: workouts.filter((w) => w.type === t).reduce((s, w) => s + w.durationMin, 0),
    })).filter((x) => x.minutes > 0);

    return { totalMinutes, totalCalories, streak, weeks, byType };
  }, [workouts]);

  const addWorkout = () => {
    setWorkouts((prev) => [
      {
        id: Math.random().toString(36).slice(2, 9),
        type,
        durationMin: duration,
        calories: Math.round(duration * 8),
        date: isoDay(new Date()),
      },
      ...prev,
    ]);
  };

  // --- SVG bar chart (weekly volume) ---
  const maxWeek = Math.max(1, ...stats.weeks.map((w) => w.minutes));
  const CW = 560;
  const CH = 180;
  const barW = CW / stats.weeks.length - 14;

  // --- SVG donut (by type) ---
  const totalByType = stats.byType.reduce((s, x) => s + x.minutes, 0) || 1;
  let angleAcc = 0;
  const R = 62;
  const CIRC = 2 * Math.PI * R;

  const sortedRecent = [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12);

  return (
    <DemoShell
      title="FitTrack"
      tagline="Fitness & Habit Tracker"
      accent="#22c55e"
      github="https://github.com/Sextty/FitTrack"
      bg="#0b0f0c"
    >
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "24px 20px 60px" }}>
        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
          <div style={{ ...panel, borderColor: "#22c55e", background: "rgba(34,197,94,0.08)" }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.streak} 🔥</div>
            <div style={{ color: "#8aa196", fontSize: 13, marginTop: 4 }}>Day streak</div>
          </div>
          <div style={panel}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{workouts.length}</div>
            <div style={{ color: "#8aa196", fontSize: 13, marginTop: 4 }}>Workouts</div>
          </div>
          <div style={panel}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{Math.round(stats.totalMinutes / 60)}h</div>
            <div style={{ color: "#8aa196", fontSize: 13, marginTop: 4 }}>Total time</div>
          </div>
          <div style={panel}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.totalCalories.toLocaleString()}</div>
            <div style={{ color: "#8aa196", fontSize: 13, marginTop: 4 }}>Calories</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginBottom: 18 }}>
          {/* weekly volume bars */}
          <div style={panel}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", color: "#c7d9cf" }}>
              Weekly training volume (minutes)
            </h2>
            <svg viewBox={`0 0 ${CW} ${CH + 26}`} style={{ width: "100%", height: "auto" }}>
              {stats.weeks.map((w, i) => {
                const h = Math.round((w.minutes / maxWeek) * (CH - 10));
                const x = i * (CW / stats.weeks.length) + 7;
                return (
                  <g key={i}>
                    <rect x={x} y={CH - h} width={barW} height={h} rx={4} fill="url(#volGrad)" />
                    <text x={x + barW / 2} y={CH + 16} textAnchor="middle" fontSize={11} fill="#8aa196">
                      {w.label}
                    </text>
                    <text x={x + barW / 2} y={CH - h - 6} textAnchor="middle" fontSize={10} fill="#c7d9cf">
                      {w.minutes || ""}
                    </text>
                  </g>
                );
              })}
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#0e5c2f" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* donut by activity */}
          <div style={panel}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", color: "#c7d9cf" }}>By activity</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <svg viewBox="0 0 160 160" width={150} height={150}>
                {stats.byType.map((x, i) => {
                  const frac = x.minutes / totalByType;
                  const dash = frac * CIRC;
                  const el = (
                    <circle
                      key={x.type}
                      cx={80}
                      cy={80}
                      r={R}
                      fill="none"
                      stroke={PIE[i % PIE.length]}
                      strokeWidth={22}
                      strokeDasharray={`${dash} ${CIRC - dash}`}
                      strokeDashoffset={-angleAcc}
                      transform="rotate(-90 80 80)"
                    />
                  );
                  angleAcc += dash;
                  return el;
                })}
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {stats.byType.map((x, i) => (
                  <div key={x.type} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: PIE[i % PIE.length], display: "inline-block" }} />
                    <span style={{ color: "#c7d9cf" }}>{x.type}</span>
                    <span style={{ color: "#8aa196" }}>{Math.round((x.minutes / totalByType) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 18 }}>
          {/* log form */}
          <div style={panel}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", color: "#c7d9cf" }}>Log a workout</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#8aa196" }}>
                Activity
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: "9px 10px", borderRadius: 8, border: "1px solid #223028", background: "#0e1412", color: "#e7f0ea" }}>
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#8aa196" }}>
                Duration (min)
                <input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 1)} style={{ padding: "9px 10px", borderRadius: 8, border: "1px solid #223028", background: "#0e1412", color: "#e7f0ea" }} />
              </label>
              <button onClick={addWorkout} style={{ marginTop: 4, background: "#22c55e", color: "#04200f", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, cursor: "pointer" }}>
                Add workout
              </button>
            </div>
          </div>

          {/* list */}
          <div style={panel}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", color: "#c7d9cf" }}>Recent workouts</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
              {sortedRecent.map((w) => (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#0e1412", border: "1px solid #223028", borderRadius: 10, padding: "10px 12px" }}>
                  <span style={{ fontSize: 22 }}>{EMOJI[w.type] || "💪"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{w.type}</div>
                    <div style={{ color: "#8aa196", fontSize: 12 }}>
                      {w.date} · {w.durationMin} min · {w.calories} kcal
                    </div>
                  </div>
                  <button
                    onClick={() => setWorkouts((prev) => prev.filter((x) => x.id !== w.id))}
                    title="Delete"
                    style={{ background: "transparent", border: "none", color: "#8aa196", fontSize: 20, cursor: "pointer" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ color: "#8aa196", fontSize: 12, marginTop: 24 }}>
          Data lives in your browser for this demo. The full app (Express + MongoDB
          + Recharts) is on GitHub.
        </p>
      </div>
    </DemoShell>
  );
}
