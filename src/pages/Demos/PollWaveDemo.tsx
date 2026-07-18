import { useEffect, useState } from "react";
import DemoShell from "./DemoShell";

interface Option {
  id: number;
  text: string;
  votes: number;
}
interface Poll {
  id: number;
  question: string;
  options: Option[];
  closed?: boolean;
  history: number[]; // total-votes snapshots for the momentum sparkline
}

const COLORS = ["#6366f1", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#ef4444"];

const seed: Poll[] = [
  {
    id: 1,
    question: "What should we build next?",
    options: [
      { id: 1, text: "Mobile app", votes: 14 },
      { id: 2, text: "Public API", votes: 9 },
      { id: 3, text: "Dark mode", votes: 21 },
      { id: 4, text: "Integrations", votes: 6 },
    ],
    history: [38, 40, 41, 44, 46, 50],
  },
  {
    id: 2,
    question: "Best language for backends?",
    options: [
      { id: 5, text: "TypeScript", votes: 18 },
      { id: 6, text: "Go", votes: 12 },
      { id: 7, text: "Python", votes: 15 },
      { id: 8, text: "Rust", votes: 8 },
    ],
    history: [40, 42, 45, 47, 50, 53],
  },
];

function totalVotes(p: Poll) {
  return p.options.reduce((s, o) => s + o.votes, 0);
}

export default function PollWaveDemo() {
  const [polls, setPolls] = useState<Poll[]>(seed);
  const [voted, setVoted] = useState<Record<number, number>>({});
  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState("");
  const [opts, setOpts] = useState(["", ""]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [watching, setWatching] = useState(42);

  // Simulated remote voters — in the real app this arrives over a WebSocket
  // fed by Redis pub/sub; here an interval plays that role.
  useEffect(() => {
    const t = setInterval(() => {
      setPolls((prev) =>
        prev.map((p) => {
          if (p.closed) return p;
          let next = p;
          if (Math.random() <= 0.55) {
            const i = Math.floor(Math.random() * p.options.length);
            next = {
              ...p,
              options: p.options.map((o, j) => (j === i ? { ...o, votes: o.votes + 1 } : o)),
            };
          }
          // Snapshot total votes for the momentum sparkline.
          return { ...next, history: [...next.history, totalVotes(next)].slice(-40) };
        }),
      );
      // Audience count drifts like a real live page.
      setWatching((w) => Math.max(18, Math.min(120, w + Math.floor(Math.random() * 7) - 3)));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  const vote = (pollId: number, optionId: number) => {
    const poll = polls.find((p) => p.id === pollId);
    if (!poll || poll.closed) return;
    if (voted[pollId] != null) return; // one vote per poll — same rule as the real app
    setVoted((s) => ({ ...s, [pollId]: optionId }));
    setPolls((prev) =>
      prev.map((p) =>
        p.id === pollId
          ? { ...p, options: p.options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)) }
          : p,
      ),
    );
  };

  const closePoll = (pollId: number) =>
    setPolls((prev) => prev.map((p) => (p.id === pollId ? { ...p, closed: true } : p)));

  const sharePoll = (pollId: number) => {
    navigator.clipboard?.writeText(`https://pollwave.example/p/${pollId}`).catch(() => {});
    setCopiedId(pollId);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const createPoll = () => {
    const clean = opts.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || clean.length < 2) return;
    const base = Date.now();
    setPolls((prev) => [
      {
        id: base,
        question: question.trim(),
        options: clean.map((text, i) => ({ id: base + i + 1, text, votes: 0 })),
        history: [0],
      },
      ...prev,
    ]);
    setQuestion("");
    setOpts(["", ""]);
    setCreating(false);
  };

  const input: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #262c44",
    background: "#10131f",
    color: "#e7e9f5",
  };

  const ghostBtn: React.CSSProperties = {
    background: "transparent",
    border: "1px solid #262c44",
    color: "#9298bd",
    borderRadius: 999,
    padding: "5px 13px",
    cursor: "pointer",
    fontSize: 12.5,
    fontWeight: 600,
  };

  return (
    <DemoShell
      title="PollWave"
      tagline="Live Polls"
      accent="#0ea5e9"
      github="https://github.com/Sextty/PollWave"
      bg="#0d0f1a"
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "26px 20px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#86efac", fontSize: 13, marginBottom: 14, flexWrap: "wrap" }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
              animation: "pulse 1.6s infinite",
            }}
          />
          Live — other voters are simulated in-browser (Redis pub/sub + WebSockets in the real app)
          <span style={{ marginLeft: "auto", color: "#9298bd", fontVariantNumeric: "tabular-nums" }}>
            👁 {watching} watching now
          </span>
        </div>

        {creating ? (
          <div style={{ background: "#161a2b", border: "1px solid #262c44", borderRadius: 12, padding: 16, marginBottom: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            <input style={{ ...input, fontWeight: 600 }} placeholder="Ask a question…" value={question} onChange={(e) => setQuestion(e.target.value)} autoFocus />
            {opts.map((o, i) => (
              <input
                key={i}
                style={input}
                placeholder={`Option ${i + 1}`}
                value={o}
                onChange={(e) => setOpts(opts.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={() => setOpts([...opts, ""])} style={{ ...input, cursor: "pointer" }}>+ Option</button>
              <button onClick={createPoll} style={{ background: "#0ea5e9", border: "none", color: "white", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}>Create</button>
              <button onClick={() => setCreating(false)} style={{ ...input, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            style={{ margin: "0 0 18px", background: "#161a2b", border: "1px dashed #262c44", color: "#9298bd", borderRadius: 10, padding: "12px 16px", cursor: "pointer", width: "100%" }}
          >
            + Create a poll
          </button>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {polls.map((p) => {
            const total = totalVotes(p);
            const chosenId = voted[p.id];
            const isOpen = !p.closed;
            const winner = p.closed
              ? p.options.reduce((best, o) => (o.votes > best.votes ? o : best), p.options[0])
              : null;
            const isExpanded = expanded === p.id;

            // Momentum sparkline path
            const hist = p.history;
            const maxH = Math.max(...hist, 1);
            const minH = Math.min(...hist);
            const range = Math.max(maxH - minH, 1);
            const sparkPts = hist
              .map((v, i) => `${((i / Math.max(hist.length - 1, 1)) * 200).toFixed(1)},${(34 - ((v - minH) / range) * 30).toFixed(1)}`)
              .join(" L ");

            return (
              <div key={p.id} style={{ background: "#161a2b", border: `1px solid ${p.closed ? "#262c44" : "#262c44"}`, borderRadius: 14, padding: "18px 20px", opacity: p.closed && !isExpanded ? 0.92 : 1 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, flex: 1 }}>{p.question}</div>
                  {p.closed ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#9298bd", border: "1px solid #262c44", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" }}>
                      CLOSED
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#38bdf8", border: "1px solid #0ea5e955", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }} />
                      LIVE
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.options.map((o, i) => {
                    const pct = total ? Math.round((o.votes / total) * 100) : 0;
                    const chosen = chosenId === o.id;
                    const isWinner = winner?.id === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => vote(p.id, o.id)}
                        disabled={chosenId != null || p.closed}
                        title={p.closed ? "This poll is closed" : chosenId != null ? "You already voted on this poll" : "Click to vote"}
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          textAlign: "left",
                          background: "#10131f",
                          border: `1px solid ${isWinner ? "#f59e0b" : chosen ? "#0ea5e9" : "#262c44"}`,
                          borderRadius: 10,
                          padding: "12px 14px",
                          cursor: chosenId != null || p.closed ? "default" : "pointer",
                          color: "#e7e9f5",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${pct}%`,
                            opacity: 0.28,
                            background: COLORS[i % COLORS.length],
                            transition: "width 0.5s ease",
                          }}
                        />
                        <span style={{ position: "relative", fontWeight: 500 }}>
                          {isWinner && <span style={{ marginRight: 4 }}>🏆</span>}
                          {chosen && <span style={{ color: "#86efac", fontWeight: 700 }}>✓ </span>}
                          {o.text}
                        </span>
                        <span style={{ position: "relative", color: "#9298bd", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                          {pct}% · {o.votes}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ color: "#9298bd", fontSize: 13 }}>
                    {total} vote{total === 1 ? "" : "s"}
                    {chosenId != null && isOpen && <span style={{ color: "#86efac" }}> · thanks for voting!</span>}
                    {winner && <span style={{ color: "#f59e0b" }}> · “{winner.text}” wins</span>}
                  </span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={() => setExpanded(isExpanded ? null : p.id)} style={ghostBtn} aria-expanded={isExpanded}>
                      {isExpanded ? "Hide details" : "Details"}
                    </button>
                    <button onClick={() => sharePoll(p.id)} style={{ ...ghostBtn, color: copiedId === p.id ? "#86efac" : "#9298bd" }}>
                      {copiedId === p.id ? "✓ Copied" : "Share"}
                    </button>
                    {isOpen && (
                      <button onClick={() => closePoll(p.id)} style={{ ...ghostBtn, color: "#fca5a5", borderColor: "#ef444455" }}>
                        Close poll
                      </button>
                    )}
                  </div>
                </div>

                {/* Details: vote momentum + breakdown */}
                {isExpanded && (
                  <div style={{ marginTop: 14, borderTop: "1px solid #262c44", paddingTop: 14 }}>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9298bd", marginBottom: 8 }}>
                      Vote momentum
                    </div>
                    <svg viewBox="0 0 200 36" style={{ width: "100%", maxWidth: 340, height: 44 }}>
                      <path d={`M ${sparkPts}`} fill="none" stroke="#0ea5e9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div style={{ fontSize: 12, color: "#9298bd", marginBottom: 12 }}>
                      total votes over the last {hist.length} live updates
                    </div>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9298bd", marginBottom: 8 }}>
                      Breakdown
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {[...p.options]
                        .sort((a, b) => b.votes - a.votes)
                        .map((o, i) => {
                          const pct = total ? Math.round((o.votes / total) * 100) : 0;
                          return (
                            <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                              <span style={{ width: 9, height: 9, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                              <span style={{ width: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.text}</span>
                              <div style={{ flex: 1, height: 7, borderRadius: 999, background: "#10131f", overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: COLORS[i % COLORS.length], borderRadius: 999, transition: "width 0.5s ease" }} />
                              </div>
                              <span style={{ color: "#9298bd", fontVariantNumeric: "tabular-nums", width: 64, textAlign: "right" }}>
                                {o.votes} · {pct}%
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes pulse { 70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }`}</style>
    </DemoShell>
  );
}
