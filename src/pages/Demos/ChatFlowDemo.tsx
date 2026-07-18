import { useEffect, useRef, useState } from "react";
import DemoShell from "./DemoShell";

interface Msg {
  id: number;
  user: string;
  text: string;
  ts: number;
  reactions: Record<string, string[]>; // emoji -> users
}

const ROOMS = ["general", "engineering", "random"];
const BOTS = ["alina", "marcus", "priya"];
const QUICK_EMOJI = ["👍", "❤️", "😂"];

const ROOM_TOPICS: Record<string, string> = {
  general: "Team-wide announcements and daily chatter.",
  engineering: "Builds, PRs, deploys — keep it technical.",
  random: "Everything that doesn't fit anywhere else.",
};

const BOT_LINES: Record<string, string[]> = {
  general: [
    "Morning all ☀️",
    "Anyone up for a sync at 3?",
    "Just shipped the new landing page 🎉",
    "Coffee machine is fixed, we're saved",
    "Quarterly notes are in the drive 📄",
  ],
  engineering: [
    "CI is green again ✅",
    "Reviewing the PR now",
    "That flaky test was a timezone bug 🙃",
    "Deploying to staging in 5",
    "Redis adapter cut fan-out latency in half ⚡",
  ],
  random: [
    "Lunch spot ideas?",
    "This meme is too accurate 😂",
    "Friday playlist drop 🎧",
    "Adopted a cat, productivity doomed 🐈",
  ],
};

// Same heuristic the real app uses when no OpenAI key is set.
function smartReplies(history: Msg[]): string[] {
  const last = history[history.length - 1];
  const text = (last?.text || "").toLowerCase();
  if (!last) return ["Hey! 👋", "What's up?", "Ready when you are."];
  if (text.includes("?")) return ["Good question — let me check.", "Yes, that works for me.", "Not sure yet, I'll follow up."];
  if (/thanks|thank you|thx/.test(text)) return ["Anytime! 🙌", "No problem at all.", "Happy to help."];
  if (/meet|call|sync|schedule|tomorrow|today/.test(text)) return ["Sounds good, works for me.", "Can we do a bit later?", "Let's lock it in."];
  return ["Got it 👍", "Makes sense to me.", "Tell me more?"];
}

let nextId = 1000;

function seedRoom(room: string): Msg[] {
  const lines = BOT_LINES[room] || [];
  return lines.slice(0, 3).map((text, i) => ({
    id: nextId++,
    user: BOTS[i % BOTS.length],
    text,
    ts: Date.now() - (3 - i) * 60000,
    reactions: i === 0 ? { "👍": [BOTS[(i + 1) % BOTS.length]] } : {},
  }));
}

export default function ChatFlowDemo() {
  const [user, setUser] = useState("");
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState("general");
  const [byRoom, setByRoom] = useState<Record<string, Msg[]>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [typing, setTyping] = useState<string | null>(null);
  const [replies, setReplies] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const roomRef = useRef(room);
  roomRef.current = room;

  // Seed every room once on join.
  useEffect(() => {
    if (!joined) return;
    setByRoom(Object.fromEntries(ROOMS.map((r) => [r, seedRoom(r)])));
  }, [joined]);

  // Entering a room clears its unread badge and stale suggestions.
  useEffect(() => {
    setUnread((u) => ({ ...u, [room]: 0 }));
    setReplies([]);
    setQuery("");
    setTyping(null);
  }, [room]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  // Ambient team activity: every so often a teammate posts somewhere.
  // (Socket.io broadcast + Redis pub/sub in the real app.)
  useEffect(() => {
    if (!joined) return;
    const tick = setInterval(() => {
      const target = ROOMS[Math.floor(Math.random() * ROOMS.length)];
      const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
      const lines = BOT_LINES[target];
      const msg: Msg = {
        id: nextId++,
        user: bot,
        text: lines[Math.floor(Math.random() * lines.length)],
        ts: Date.now(),
        reactions: {},
      };
      if (target === roomRef.current) {
        setTyping(bot);
        timers.current.push(
          setTimeout(() => {
            setTyping(null);
            setByRoom((prev) => ({ ...prev, [target]: [...(prev[target] ?? []), msg] }));
          }, 1400),
        );
      } else {
        setByRoom((prev) => ({ ...prev, [target]: [...(prev[target] ?? []), msg] }));
        setUnread((u) => ({ ...u, [target]: (u[target] ?? 0) + 1 }));
      }
    }, 11000);
    return () => clearInterval(tick);
  }, [joined]);

  const messages = byRoom[room] ?? [];
  const visible = query.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(query.trim().toLowerCase()))
    : messages;

  useEffect(() => {
    if (!query) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typing, query]);

  // Simulated teammate: types, then replies; sometimes reacts to you.
  const scheduleBotReply = (myMsgId: number) => {
    const target = roomRef.current;
    const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
    const lines = BOT_LINES[target] || BOT_LINES.general;
    timers.current.push(
      setTimeout(() => setTyping(bot), 900),
      setTimeout(() => {
        setTyping(null);
        setByRoom((prev) => ({
          ...prev,
          [target]: [
            ...(prev[target] ?? []),
            { id: nextId++, user: bot, text: lines[Math.floor(Math.random() * lines.length)], ts: Date.now(), reactions: {} },
          ],
        }));
      }, 2300),
    );
    if (Math.random() < 0.45) {
      const reactor = BOTS[Math.floor(Math.random() * BOTS.length)];
      const emoji = QUICK_EMOJI[Math.floor(Math.random() * QUICK_EMOJI.length)];
      timers.current.push(
        setTimeout(() => {
          setByRoom((prev) => ({
            ...prev,
            [target]: (prev[target] ?? []).map((m) =>
              m.id === myMsgId
                ? { ...m, reactions: { ...m.reactions, [emoji]: [...(m.reactions[emoji] ?? []), reactor] } }
                : m,
            ),
          }));
        }, 3400),
      );
    }
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    const id = nextId++;
    setByRoom((prev) => ({
      ...prev,
      [room]: [...(prev[room] ?? []), { id, user, text: text.trim(), ts: Date.now(), reactions: {} }],
    }));
    setDraft("");
    setReplies([]);
    scheduleBotReply(id);
  };

  const toggleReaction = (msgId: number, emoji: string) => {
    setByRoom((prev) => ({
      ...prev,
      [room]: (prev[room] ?? []).map((m) => {
        if (m.id !== msgId) return m;
        const users = m.reactions[emoji] ?? [];
        const mine = users.includes(user);
        const next = { ...m.reactions, [emoji]: mine ? users.filter((u) => u !== user) : [...users, user] };
        if (next[emoji].length === 0) delete next[emoji];
        return { ...m, reactions: next };
      }),
    }));
  };

  const input: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #262a42",
    background: "#10111d",
    color: "#e8e9f3",
    fontSize: 15,
  };

  if (!joined) {
    return (
      <DemoShell title="ChatFlow AI" tagline="Real-Time Messaging" accent="#8b5cf6" github="https://github.com/Sextty/ChatFlow-AI" bg="#0e0f1a">
        <div style={{ display: "grid", placeItems: "center", minHeight: "calc(100vh - 49px)" }}>
          <div style={{ background: "#181a2a", border: "1px solid #262a42", borderRadius: 16, padding: 32, width: "min(380px, 92vw)", textAlign: "center" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: 26 }}>
              <span style={{ color: "#8b5cf6" }}>◆</span> ChatFlow AI
            </h1>
            <p style={{ color: "#9aa0bd", margin: "0 0 20px" }}>
              Real-time messaging with AI smart replies. Teammates are simulated
              in-browser for this demo.
            </p>
            <input
              style={{ ...input, width: "100%", boxSizing: "border-box", marginBottom: 12 }}
              placeholder="Pick a username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && user.trim() && setJoined(true)}
              autoFocus
            />
            <button
              disabled={!user.trim()}
              onClick={() => setJoined(true)}
              style={{
                width: "100%",
                padding: 12,
                border: "none",
                borderRadius: 10,
                cursor: user.trim() ? "pointer" : "not-allowed",
                background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
                color: "white",
                fontWeight: 600,
                opacity: user.trim() ? 1 : 0.5,
                fontSize: 15,
              }}
            >
              Join chat
            </button>
          </div>
        </div>
      </DemoShell>
    );
  }

  return (
    <DemoShell title="ChatFlow AI" tagline="Real-Time Messaging" accent="#8b5cf6" github="https://github.com/Sextty/ChatFlow-AI" bg="#0e0f1a">
      <div className="demo-split-chat">
        <aside style={{ background: "#181a2a", borderRight: "1px solid #262a42", padding: 16 }}>
          <div style={{ textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em", color: "#9aa0bd", marginBottom: 10 }}>Rooms</div>
          {ROOMS.map((r) => (
            <button
              key={r}
              onClick={() => setRoom(r)}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                textAlign: "left",
                background: r === room ? "rgba(139,92,246,0.18)" : "transparent",
                color: r === room ? "#c4b5fd" : "#e8e9f3",
                border: "none",
                padding: "9px 10px",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 4,
                fontSize: 14,
                gap: 8,
              }}
            >
              <span># {r}</span>
              {(unread[r] ?? 0) > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    minWidth: 18,
                    height: 18,
                    borderRadius: 999,
                    background: "#8b5cf6",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 5px",
                  }}
                >
                  {unread[r]}
                </span>
              )}
            </button>
          ))}
          <div style={{ textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em", color: "#9aa0bd", margin: "18px 0 8px" }}>
            Online — {BOTS.length + 1}
          </div>
          {[user, ...BOTS].map((u) => (
            <div key={u} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, padding: "3px 2px" }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                  color: "white",
                }}
              >
                {u.slice(0, 2).toUpperCase()}
              </span>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
              {u}
              {u === user && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#9aa0bd", border: "1px solid #262a42", borderRadius: 999, padding: "1px 7px" }}>
                  you
                </span>
              )}
            </div>
          ))}
          <div style={{ fontSize: 12, color: "#9aa0bd", marginTop: 14 }}>
            Signed in as <b>{user}</b>
          </div>
        </aside>

        <main style={{ display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
          <header
            style={{
              padding: "10px 20px",
              borderBottom: "1px solid #262a42",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 600 }}># {room}</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this room…"
              aria-label="Search messages in this room"
              style={{
                ...input,
                padding: "7px 12px",
                fontSize: 13,
                borderRadius: 999,
                width: "min(220px, 40vw)",
                marginLeft: "auto",
              }}
            />
            <button
              onClick={() => setShowInfo((s) => !s)}
              aria-expanded={showInfo}
              aria-label="Toggle room details"
              style={{
                background: showInfo ? "rgba(139,92,246,0.18)" : "transparent",
                color: showInfo ? "#c4b5fd" : "#9aa0bd",
                border: "1px solid #262a42",
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ⓘ
            </button>
          </header>

          {/* Room info drawer */}
          {showInfo && (
            <div
              style={{
                position: "absolute",
                top: 53,
                right: 0,
                bottom: 0,
                width: "min(280px, 85vw)",
                background: "#141628",
                borderLeft: "1px solid #262a42",
                padding: 18,
                zIndex: 5,
                overflowY: "auto",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}># {room}</div>
              <p style={{ color: "#9aa0bd", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>{ROOM_TOPICS[room]}</p>

              <div style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", color: "#9aa0bd", marginBottom: 8 }}>
                Members
              </div>
              {[{ name: user, role: "you" }, ...BOTS.map((b, i) => ({ name: b, role: i === 0 ? "admin" : "member" }))].map((m) => (
                <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "5px 0" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
                  {m.name}
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#9aa0bd", border: "1px solid #262a42", borderRadius: 999, padding: "1px 7px" }}>
                    {m.role}
                  </span>
                </div>
              ))}

              <div style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", color: "#9aa0bd", margin: "16px 0 8px" }}>
                AI assistant
              </div>
              <p style={{ color: "#9aa0bd", fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
                Smart replies use OpenAI when a key is configured — this demo
                runs the same local heuristic the real app falls back to.
              </p>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            {query.trim() && (
              <div style={{ color: "#9aa0bd", fontSize: 12.5 }}>
                {visible.length} result{visible.length === 1 ? "" : "s"} for “{query.trim()}”
              </div>
            )}
            {visible.map((m) => {
              const mine = m.user === user;
              return (
                <div key={m.id} className="cf-msg" style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "68%", position: "relative" }}>
                    <div
                      style={{
                        background: mine ? "linear-gradient(90deg, #8b5cf6, #6d5ce7)" : "#20233a",
                        padding: "8px 12px",
                        borderRadius: 12,
                      }}
                    >
                      {!mine && <div style={{ fontSize: 12, color: "#06b6d4", marginBottom: 2 }}>{m.user}</div>}
                      <div style={{ fontSize: 15, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                      <div style={{ fontSize: 10, color: mine ? "rgba(255,255,255,0.7)" : "#9aa0bd", textAlign: "right", marginTop: 2 }}>
                        {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    {/* Reactions */}
                    <div style={{ display: "flex", gap: 4, marginTop: 3, justifyContent: mine ? "flex-end" : "flex-start", flexWrap: "wrap" }}>
                        {Object.entries(m.reactions).map(([emoji, users]) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(m.id, emoji)}
                            title={users.join(", ")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              background: users.includes(user) ? "rgba(139,92,246,0.22)" : "#181a2a",
                              border: `1px solid ${users.includes(user) ? "#8b5cf6" : "#262a42"}`,
                              borderRadius: 999,
                              padding: "1px 8px",
                              cursor: "pointer",
                              fontSize: 12,
                              color: "#e8e9f3",
                            }}
                          >
                            {emoji} {users.length}
                          </button>
                        ))}
                        <span className="cf-react-bar" style={{ display: "inline-flex", gap: 2 }}>
                          {QUICK_EMOJI.map((e) => (
                            <button
                              key={e}
                              onClick={() => toggleReaction(m.id, e)}
                              aria-label={`React with ${e}`}
                              style={{
                                background: "#181a2a",
                                border: "1px solid #262a42",
                                borderRadius: 999,
                                padding: "1px 6px",
                                cursor: "pointer",
                                fontSize: 12,
                              }}
                            >
                              {e}
                            </button>
                          ))}
                        </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div style={{ height: 18, padding: "0 20px", color: "#9aa0bd", fontSize: 12, fontStyle: "italic" }}>
            {typing ? `${typing} is typing…` : ""}
          </div>

          <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setReplies(smartReplies(messages))}
              style={{ background: "rgba(139,92,246,0.12)", color: "#c4b5fd", border: "1px solid #262a42", borderRadius: 999, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}
            >
              ✨ Smart replies
            </button>
            {replies.map((r, i) => (
              <button
                key={i}
                onClick={() => send(r)}
                style={{ background: "#1c1f33", border: "1px solid #262a42", color: "#e8e9f3", borderRadius: 999, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}
              >
                {r}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            style={{ display: "flex", gap: 10, padding: "14px 20px", borderTop: "1px solid #262a42" }}
          >
            <input style={{ ...input, flex: 1 }} value={draft} placeholder={`Message # ${room}…`} onChange={(e) => setDraft(e.target.value)} />
            <button
              type="submit"
              style={{ padding: "12px 20px", border: "none", borderRadius: 10, background: "linear-gradient(90deg, #8b5cf6, #06b6d4)", color: "white", fontWeight: 600, cursor: "pointer" }}
            >
              Send
            </button>
          </form>
        </main>
      </div>
    </DemoShell>
  );
}
