import { useEffect, useRef, useState } from "react";
import DemoShell from "./DemoShell";

interface Msg {
  user: string;
  text: string;
  ts: number;
}

const ROOMS = ["general", "engineering", "random"];
const BOTS = ["alina", "marcus", "priya"];

const BOT_LINES: Record<string, string[]> = {
  general: [
    "Morning all ☀️",
    "Anyone up for a sync at 3?",
    "Just shipped the new landing page 🎉",
    "Coffee machine is fixed, we're saved",
  ],
  engineering: [
    "CI is green again ✅",
    "Reviewing the PR now",
    "That flaky test was a timezone bug 🙃",
    "Deploying to staging in 5",
  ],
  random: ["Lunch spot ideas?", "This meme is too accurate 😂", "Friday playlist drop 🎧"],
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

function seedRoom(room: string): Msg[] {
  const lines = BOT_LINES[room] || [];
  return lines.slice(0, 3).map((text, i) => ({
    user: BOTS[i % BOTS.length],
    text,
    ts: Date.now() - (3 - i) * 60000,
  }));
}

export default function ChatFlowDemo() {
  const [user, setUser] = useState("");
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState("general");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [replies, setReplies] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (joined) setMessages(seedRoom(room));
    setReplies([]);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [joined, room]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Simulated teammate: types, then replies. (Socket.io + Redis in the real app.)
  const scheduleBotReply = () => {
    const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
    const lines = BOT_LINES[room] || BOT_LINES.general;
    timers.current.push(
      setTimeout(() => setTyping(bot), 900),
      setTimeout(() => {
        setTyping(null);
        setMessages((prev) => [
          ...prev,
          { user: bot, text: lines[Math.floor(Math.random() * lines.length)], ts: Date.now() },
        ]);
      }, 2300),
    );
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { user, text: text.trim(), ts: Date.now() }]);
    setDraft("");
    setReplies([]);
    scheduleBotReply();
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
                display: "block",
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
              }}
            >
              # {r}
            </button>
          ))}
          <div style={{ fontSize: 12, color: "#9aa0bd", marginTop: 20 }}>
            Signed in as <b>{user}</b>
          </div>
        </aside>

        <main style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header style={{ padding: "14px 20px", borderBottom: "1px solid #262a42", fontWeight: 600 }}># {room}</header>

          <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => {
              const mine = m.user === user;
              return (
                <div key={i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "68%",
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
            <input style={{ ...input, flex: 1 }} value={draft} placeholder="Type a message…" onChange={(e) => setDraft(e.target.value)} />
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
