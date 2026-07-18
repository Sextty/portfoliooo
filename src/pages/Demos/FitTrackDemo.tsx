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
const GOAL_STORAGE = "demo_fittrack_goal";
const QUICK_MINUTES = [15, 30, 45, 60];

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

function loadGoal(): number {
  const n = Number(localStorage.getItem(GOAL_STORAGE));
  return Number.isFinite(n) && n >= 30 ? n : 180;
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

type View = "dashboard" | "history";

export default function FitTrackDemo() {
  const [workouts, setWorkouts] = useState<Workout[]>(load);
  const [type, setType] = useState("Run");
  const [duration, setDuration] = useState(30);
  const [view, setView] = useState<View>("dashboard");
  const [goal, setGoal] = useState<number>(loadGoal);
  const [editingGoal, setEditingGoal] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(workouts));
    } catch { /* demo state just won't persist */ }
  }, [workouts]);

  useEffect(() => {
    try {
      localStorage.setItem(GOAL_STORAGE, String(goal));
    } catch { /* ignore */ }
  }, [goal]);

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

    // Personal records
    const longest = workouts.reduce<Workout | null>(
      (best, w) => (best === null || w.durationMin > best.durationMin ? w : best),
      null,
    );
    const biggestWeek = weeks.reduce((best, w) => (w.minutes > best.minutes ? w : best), weeks[0]);
    const favorite = byType.reduce<{ type: string; minutes: number } | null>(
      (best, x) => (best === null || x.minutes > best.minutes ? x : best),
      null,
    );

    return {
      totalMinutes,
      totalCalories,
      streak,
      weeks,
      byType,
      thisWeek: weeks[weeks.length - 1]?.minutes ?? 0,
      records: { longest, biggestWeek, favorite },
    };
  }, [workouts]);

  const addWorkout = (minutes?: number) => {
    const durationMin = minutes ?? duration;
    setWorkouts((prev) => [
      {
        id: Math.random().toString(36).slice(2, 9),
        type,
        durationMin,
        calories: Math.round(durationMin * 8),
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

  // --- Goal ring ---
  const goalFrac = Math.min(stats.thisWeek / goal, 1);
  const GR = 54;
  const GCIRC = 2 * Math.PI * GR;
  const goalReached = stats.thisWeek >= goal;

  // --- History: 6-week heatmap + grouped log ---
  const heatmap = useMemo(() => {
    const byDay = new Map<string, number>();
    workouts.forEach((w) => byDay.set(w.date, (byDay.get(w.date) ?? 0) + w.durationMin));
    const cells: { date: string; minutes: number }[] = [];
    const today = new Date();
    // Start from the Monday 5 weeks back so the grid is 6 columns of 7.
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 35);
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d > today) break;
      const key = isoDay(d);
      cells.push({ date: key, minutes: byDay.get(key) ?? 0 });
    }
    return cells;
  }, [workouts]);

  const grouped = useMemo(() => {
    const map = new Map<string, Workout[]>();
    [...workouts]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .forEach((w) => {
        const list = map.get(w.date) ?? [];
        list.push(w);
        map.set(w.date, list);
      });
    return [...map.entries()].slice(0, 14);
  }, [workouts]);

  const heatColor = (m: number) => {
    if (m === 0) return "#16201b";
    if (m < 30) return "#14532d";
    if (m < 60) return "#16a34a";
    return "#22c55e";
  };

  return (
    <DemoShell
      title="FitTrack"
      tagline="Fitness & Habit Tracker"
      accent="#22c55e"
      github="https://github.com/Sextty/FitTrack"
      bg="#0b0f0c"
    >
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "18px 20px 60px" }}>
        {/* View tabs */}
        <div style={{ display: "flex", gap: 4, background: "#12181a", border: "1px solid #223028", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 18 }}>
          {(["dashboard", "history"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                border: "none",
                cursor: "pointer",
                borderRadius: 7,
                padding: "7px 16px",
                fontSize: 13.5,
                fontWeight: 600,
                textTransform: "capitalize",
                background: view === v ? "#22c55e" : "transparent",
                color: view === v ? "#04200f" : "#8aa196",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {view === "dashboard" && (
          <>
            {/* stats + goal */}
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

              {/* Weekly goal ring */}
              <div style={{ ...panel, display: "flex", alignItems: "center", gap: 14, gridColumn: "span 1" }}>
                <svg viewBox="0 0 130 130" width={86} height={86} aria-hidden="true">
                  <circle cx={65} cy={65} r={GR} fill="none" stroke="#16201b" strokeWidth={12} />
                  <circle
                    cx={65}
                    cy={65}
                    r={GR}
                    fill="none"
                    stroke={goalReached ? "#22c55e" : "#16a34a"}
                    strokeWidth={12}
                    strokeLinecap="round"
                    strokeDasharray={`${goalFrac * GCIRC} ${GCIRC}`}
                    transform="rotate(-90 65 65)"
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                  <text x={65} y={70} textAnchor="middle" fontSize={24} fill="#e7f0ea" fontWeight={800}>
                    {Math.round(goalFrac * 100)}%
                  </text>
                </svg>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{goalReached ? "Goal reached 🎉" : "Weekly goal"}</div>
                  {editingGoal ? (
                    <input
                      type="number"
                      min={30}
                      step={30}
                      value={goal}
                      autoFocus
                      onChange={(e) => setGoal(Math.max(30, Number(e.target.value) || 30))}
                      onBlur={() => setEditingGoal(false)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingGoal(false)}
                      style={{ width: 76, marginTop: 4, padding: "5px 8px", borderRadius: 6, border: "1px solid #223028", background: "#0e1412", color: "#e7f0ea" }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingGoal(true)}
                      style={{ background: "transparent", border: "none", color: "#8aa196", fontSize: 13, cursor: "pointer", padding: 0, marginTop: 4, textDecoration: "underline dotted" }}
                    >
                      {stats.thisWeek} / {goal} min
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="demo-grid-ft-a">
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
                  {/* goal line */}
                  <line
                    x1={0}
                    x2={CW}
                    y1={CH - (Math.min(goal, maxWeek) / maxWeek) * (CH - 10)}
                    y2={CH - (Math.min(goal, maxWeek) / maxWeek) * (CH - 10)}
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                  />
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#0e5c2f" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ color: "#8aa196", fontSize: 11, marginTop: 4 }}>dashed line = weekly goal</div>
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

            <div className="demo-grid-ft-b">
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
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {QUICK_MINUTES.map((m) => (
                      <button
                        key={m}
                        onClick={() => addWorkout(m)}
                        title={`Log ${m} minutes of ${type}`}
                        style={{ background: "rgba(34,197,94,0.1)", color: "#86efac", border: "1px solid #22c55e44", borderRadius: 999, padding: "5px 12px", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}
                      >
                        +{m}m
                      </button>
                    ))}
                  </div>
                  <button onClick={() => addWorkout()} style={{ marginTop: 4, background: "#22c55e", color: "#04200f", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, cursor: "pointer" }}>
                    Add workout
                  </button>
                </div>

                {/* Personal records */}
                <h2 style={{ fontSize: 14, fontWeight: 600, margin: "18px 0 10px", color: "#c7d9cf" }}>Personal records</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13 }}>
                  {stats.records.longest && (
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ color: "#8aa196" }}>Longest workout</span>
                      <span style={{ color: "#e7f0ea", fontWeight: 600 }}>
                        {EMOJI[stats.records.longest.type]} {stats.records.longest.durationMin} min
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ color: "#8aa196" }}>Biggest week</span>
                    <span style={{ color: "#e7f0ea", fontWeight: 600 }}>{stats.records.biggestWeek.minutes} min</span>
                  </div>
                  {stats.records.favorite && (
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ color: "#8aa196" }}>Favorite activity</span>
                      <span style={{ color: "#e7f0ea", fontWeight: 600 }}>
                        {EMOJI[stats.records.favorite.type]} {stats.records.favorite.type}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* list */}
              <div style={panel}>
                <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", color: "#c7d9cf" }}>Recent workouts</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto" }}>
                  {[...workouts]
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .slice(0, 12)
                    .map((w) => (
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
          </>
        )}

        {view === "history" && (
          <>
            {/* Heatmap */}
            <div style={{ ...panel, marginBottom: 18 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", color: "#c7d9cf" }}>
                Last 6 weeks — training heatmap
              </h2>
              <div style={{ display: "grid", gridTemplateRows: "repeat(7, 16px)", gridAutoFlow: "column", gap: 4, width: "fit-content" }}>
                {heatmap.map((c) => (
                  <div
                    key={c.date}
                    title={`${c.date}: ${c.minutes} min`}
                    style={{ width: 16, height: 16, borderRadius: 4, background: heatColor(c.minutes) }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 11, color: "#8aa196" }}>
                Less
                {[0, 20, 40, 70].map((m) => (
                  <span key={m} style={{ width: 12, height: 12, borderRadius: 3, background: heatColor(m), display: "inline-block" }} />
                ))}
                More
              </div>
            </div>

            {/* Grouped log */}
            <div style={panel}>
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", color: "#c7d9cf" }}>Training log</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {grouped.map(([date, list]) => {
                  const dayTotal = list.reduce((s, w) => s + w.durationMin, 0);
                  return (
                    <div key={date}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8aa196", marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: "#c7d9cf" }}>
                          {new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        <span>{dayTotal} min</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {list.map((w) => (
                          <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#0e1412", border: "1px solid #223028", borderRadius: 8, padding: "8px 12px", fontSize: 13.5 }}>
                            <span style={{ fontSize: 18 }}>{EMOJI[w.type] || "💪"}</span>
                            <span style={{ fontWeight: 600 }}>{w.type}</span>
                            <span style={{ color: "#8aa196", marginLeft: "auto" }}>
                              {w.durationMin} min · {w.calories} kcal
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <p style={{ color: "#8aa196", fontSize: 12, marginTop: 24 }}>
          Data lives in your browser for this demo. The full app (Express + MongoDB
          + Recharts) is on GitHub.
        </p>
      </div>
    </DemoShell>
  );
}
