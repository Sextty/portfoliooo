import { Fragment, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Github,
  Plus,
  Search,
  Send,
  Square,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Sparkles,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   CHATFLOW AI — real, streaming AI chat
   Powered by Groq (Llama · GPT-OSS · Qwen) through a serverless
   proxy that keeps the API key server-side. Falls back to a
   local simulation when the proxy isn't reachable, so the demo
   works everywhere — with an honest "Live" vs "Simulated" badge.
   ═══════════════════════════════════════════════════════════ */

const C = {
  bg: "#0b0c16",
  panel: "#12131f",
  panelSoft: "#181a2a",
  raised: "#1c1f31",
  border: "#262a42",
  borderSoft: "#1e2137",
  text: "#e9eaf4",
  muted: "#9aa0bd",
  faint: "#636a8c",
  accent: "#8b5cf6",
  accent2: "#06b6d4",
  green: "#34d399",
  danger: "#f87171",
};

interface Model {
  id: string;
  label: string;
  provider: string;
  blurb: string;
}
// Keep in sync with ALLOWED_MODELS in api/chat.js
const MODELS: Model[] = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", provider: "Meta", blurb: "Most capable · balanced" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B", provider: "Meta", blurb: "Fastest · lightweight" },
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", provider: "OpenAI", blurb: "Open-weight · large" },
  { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B", provider: "OpenAI", blurb: "Open-weight · quick" },
  { id: "qwen/qwen3.6-27b", label: "Qwen 3.6 27B", provider: "Alibaba", blurb: "Strong at reasoning" },
];

const SYSTEM_PROMPT =
  "You are ChatFlow AI, a helpful, concise assistant. Use markdown, including fenced code blocks with a language tag when you show code. Keep answers focused.";

const SUGGESTIONS = [
  { title: "Explain a concept", prompt: "Explain how JWT authentication works, with a short diagram in words." },
  { title: "Write code", prompt: "Write a debounce function in TypeScript and show how to use it in React." },
  { title: "Plan something", prompt: "Give me a 5-step plan to learn PostgreSQL well in 30 days." },
  { title: "Compare options", prompt: "Compare REST and GraphQL in a short markdown table." },
];

/* ─── Persistence ────────────────────────────────────────── */
interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
}
interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Msg[];
  updatedAt: number;
}

const STORAGE = "demo_chatflow_conversations_v2";

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fresh start */
  }
  return [];
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function titleFrom(text: string) {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 42 ? `${t.slice(0, 42)}…` : t || "New chat";
}

/* ─── AI transport ───────────────────────────────────────── */
type ApiMode = "unknown" | "live" | "demo";

/**
 * Streams a reply from the serverless Groq proxy. Calls onToken for each
 * delta. Throws "UNAVAILABLE" if the proxy isn't a real streaming endpoint
 * (e.g. static preview, fork with no key) so the caller can simulate.
 */
async function streamGroq(
  messages: { role: string; content: string }[],
  model: string,
  onToken: (t: string) => void,
  signal: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages }),
      signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new Error("UNAVAILABLE");
  }

  const ctype = res.headers.get("content-type") || "";
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok || !res.body || !ctype.includes("text/event-stream")) {
    throw new Error("UNAVAILABLE");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
        if (delta) onToken(delta);
      } catch {
        /* partial JSON split across chunks — ignored, next read completes it */
      }
    }
  }
}

/** Local fallback so the demo still responds when the proxy is unreachable. */
async function simulateReply(
  messages: { role: string; content: string }[],
  onToken: (t: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const last = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const lc = last.toLowerCase();
  let reply: string;
  if (/code|function|react|typescript|debounce/.test(lc)) {
    reply =
      "Here's a small example:\n\n```ts\nfunction debounce<T extends (...a: any[]) => void>(fn: T, ms = 300) {\n  let t: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), ms);\n  };\n}\n```\n\n*(Simulated reply — deploy with a `GROQ_API_KEY` for real, live answers.)*";
  } else if (/plan|learn|steps?/.test(lc)) {
    reply =
      "A focused approach:\n\n1. **Fundamentals** — core syntax and one small project\n2. **Practice daily** — short, consistent reps\n3. **Build** — ship something real end to end\n4. **Read others' code** — learn idioms\n5. **Teach it back** — the fastest way to find gaps\n\n*(Simulated reply — this deployment isn't connected to a live model.)*";
  } else {
    reply = `You said: "${last.slice(0, 120)}".\n\nThis is a **simulated** response so the demo works without a backend. Connected to Groq, this replies with a real streaming model.`;
  }
  // Stream it word-by-word for the same feel.
  const words = reply.split(/(\s+)/);
  for (const w of words) {
    if (signal.aborted) return;
    onToken(w);
    await new Promise((r) => setTimeout(r, 14));
  }
}

/* ─── Markdown rendering (safe, element-based) ───────────── */
function InlineMd({ text }: { text: string }): ReactNode {
  // **bold**, *italic*, `code`, [label](url)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code key={i} style={{ background: "#0c1020", border: `1px solid ${C.border}`, padding: "1px 6px", borderRadius: 5, fontSize: "0.9em", fontFamily: "ui-monospace, monospace" }}>
          {p.slice(1, -1)}
        </code>
      );
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link)
      return (
        <a key={i} href={link[2]} target="_blank" rel="noreferrer" style={{ color: C.accent2, textDecoration: "underline" }}>
          {link[1]}
        </a>
      );
    return <Fragment key={i}>{p}</Fragment>;
  });
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background: "#0a0d1a", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", margin: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", borderBottom: `1px solid ${C.borderSoft}`, background: "#0c1020" }}>
        <span className="mono" style={{ fontSize: 11, color: C.faint, letterSpacing: "0.04em" }}>{lang || "code"}</span>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(code).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: copied ? C.green : C.muted, cursor: "pointer", fontSize: 11.5 }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "12px 14px", overflowX: "auto", fontSize: 12.5, lineHeight: 1.7, color: "#c7d0f0", fontFamily: "ui-monospace, monospace" }}>
        {code}
      </pre>
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let i = 0;
  let key = 0;
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!list) return;
    const L = list;
    blocks.push(
      L.ordered ? (
        <ol key={key++} style={{ margin: "6px 0", paddingLeft: 22, lineHeight: 1.7 }}>
          {L.items.map((it, n) => <li key={n}><InlineMd text={it} /></li>)}
        </ol>
      ) : (
        <ul key={key++} style={{ margin: "6px 0", paddingLeft: 22, lineHeight: 1.7 }}>
          {L.items.map((it, n) => <li key={n}><InlineMd text={it} /></li>)}
        </ul>
      ),
    );
    list = null;
  };

  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      flushList();
      const lang = fence[1];
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      i++; // skip closing fence
      blocks.push(<CodeBlock key={key++} code={body.join("\n")} lang={lang} />);
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      flushList();
      const sz = [19, 16.5, 15][h[1].length - 1];
      blocks.push(<div key={key++} style={{ fontSize: sz, fontWeight: 700, margin: "12px 0 4px" }}><InlineMd text={h[2]} /></div>);
      i++;
      continue;
    }
    const ol = line.match(/^\s*\d+\.\s+(.*)/);
    const ul = line.match(/^\s*[-*]\s+(.*)/);
    if (ol || ul) {
      const ordered = Boolean(ol);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((ol ? ol[1] : ul![1]));
      i++;
      continue;
    }
    if (line.startsWith("> ")) {
      flushList();
      blocks.push(
        <blockquote key={key++} style={{ borderLeft: `3px solid ${C.accent}`, margin: "8px 0", paddingLeft: 12, color: C.muted }}>
          <InlineMd text={line.slice(2)} />
        </blockquote>,
      );
      i++;
      continue;
    }
    if (line.trim() === "") {
      flushList();
      i++;
      continue;
    }
    // paragraph: gather consecutive plain lines
    flushList();
    const para: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(```|#{1,3}\s|\s*[-*]\s|\s*\d+\.\s|>\s)/.test(lines[i])) {
      para.push(lines[i++]);
    }
    blocks.push(<p key={key++} style={{ margin: "6px 0", lineHeight: 1.75 }}><InlineMd text={para.join(" ")} /></p>);
  }
  flushList();
  return <div style={{ fontSize: 14.5 }}>{blocks}</div>;
}

/* ─── Avatars ────────────────────────────────────────────── */
function AiAvatar({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 9, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, display: "grid", placeItems: "center", flexShrink: 0 }}>
      <Sparkles size={size * 0.5} color="white" />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function ChatFlowDemo() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [streaming, setStreaming] = useState(false);
  const [apiMode, setApiMode] = useState<ApiMode>("unknown");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [modelMenu, setModelMenu] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) || null;
  const activeModel = MODELS.find((m) => m.id === model) || MODELS[0];

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(conversations.slice(0, 40)));
    } catch {
      /* quota — session-only is fine */
    }
  }, [conversations]);

  // Autoscroll while streaming / on new messages
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages, streaming]);

  const patchActive = useCallback((updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === activeId ? updater(c) : c)));
  }, [activeId]);

  const newChat = () => {
    setActiveId(null);
    setDraft("");
  };

  const runAssistant = useCallback(
    async (convId: string, history: Msg[], useModel: string) => {
      const assistantId = uid();
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, { id: assistantId, role: "assistant", content: "" }] } : c)),
      );
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const payload = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ];

      const append = (t: string) =>
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: c.messages.map((m) => (m.id === assistantId ? { ...m, content: m.content + t } : m)), updatedAt: Date.now() }
              : c,
          ),
        );

      try {
        await streamGroq(payload, useModel, append, controller.signal);
        setApiMode("live");
      } catch (e) {
        const msg = (e as Error).message;
        if (msg === "AbortError" || (e as Error).name === "AbortError") {
          // stopped by user — keep whatever streamed so far
        } else if (msg === "RATE_LIMIT") {
          setNotice("Rate limit reached — wait a minute and try again.");
          append("\n\n_(Rate limit reached on the shared demo key.)_");
        } else {
          // Proxy unavailable → simulate locally
          setApiMode("demo");
          try {
            await simulateReply(payload, append, controller.signal);
          } catch {
            /* aborted */
          }
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [],
  );

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;
    setDraft("");

    let convId = activeId;
    const userMsg: Msg = { id: uid(), role: "user", content };

    if (!convId) {
      convId = uid();
      const conv: Conversation = { id: convId, title: titleFrom(content), model, messages: [userMsg], updatedAt: Date.now() };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(convId);
      await runAssistant(convId, [userMsg], model);
    } else {
      const base = conversations.find((c) => c.id === convId);
      const history = [...(base?.messages || []), userMsg];
      setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, messages: history, updatedAt: Date.now() } : c)));
      await runAssistant(convId, history, base?.model || model);
    }
  };

  const stop = () => abortRef.current?.abort();

  const regenerate = async () => {
    if (!active || streaming) return;
    // Drop the last assistant message, re-run from the last user turn.
    const msgs = [...active.messages];
    while (msgs.length && msgs[msgs.length - 1].role === "assistant") msgs.pop();
    if (msgs.length === 0) return;
    patchActive((c) => ({ ...c, messages: msgs }));
    await runAssistant(active.id, msgs, active.model);
  };

  const deleteConv = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? conversations.filter((c) => c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q)))
      : conversations;
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [conversations, search]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, color: C.text, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      {/* Top bar */}
      <header style={{ height: 48, flexShrink: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 14px", borderBottom: `1px solid ${C.border}`, background: "rgba(10,12,22,0.8)", backdropFilter: "blur(8px)" }}>
        <Link to="/projects" style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted, textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft size={15} /> Portfolio
        </Link>
        <span style={{ color: C.borderSoft }}>|</span>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 700, fontSize: 14 }}>
          <AiAvatar size={20} /> ChatFlow AI
        </span>
        {/* Live / Simulated badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.04em",
            padding: "3px 9px",
            borderRadius: 999,
            color: apiMode === "demo" ? "#fbbf24" : C.green,
            border: `1px solid ${apiMode === "demo" ? "#fbbf2455" : `${C.green}55`}`,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 999, background: apiMode === "demo" ? "#fbbf24" : C.green }} />
          {apiMode === "demo" ? "SIMULATED" : apiMode === "live" ? "LIVE · GROQ" : "GROQ"}
        </span>
        <a href="https://github.com/Sextty/ChatFlow-AI" target="_blank" rel="noreferrer" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: C.muted, textDecoration: "none", fontSize: 13 }}>
          <Github size={15} /> Source
        </a>
      </header>

      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 264, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flexShrink: 0, borderRight: `1px solid ${C.border}`, background: C.panel, display: "flex", flexDirection: "column", overflow: "hidden" }}
              className="cf-sidebar"
            >
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minWidth: 264 }}>
                <button onClick={newChat} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`, color: "white", fontWeight: 700, fontSize: 13.5 }}>
                  <Plus size={15} /> New chat
                </button>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats…" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px 8px 32px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.panelSoft, color: C.text, fontSize: 12.5 }} />
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px", minWidth: 264 }}>
                {filtered.length === 0 && <div style={{ color: C.faint, fontSize: 12.5, padding: "10px 8px" }}>No conversations yet.</div>}
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className="cf-conv"
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 9, cursor: "pointer", background: c.id === activeId ? C.raised : "transparent", marginBottom: 2 }}
                  >
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: c.id === activeId ? C.text : C.muted }}>{c.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConv(c.id);
                      }}
                      className="cf-del"
                      aria-label="Delete conversation"
                      style={{ background: "transparent", border: "none", color: C.faint, cursor: "pointer", padding: 2, display: "flex" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Sub-header: collapse + model picker */}
          <div style={{ height: 48, flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderBottom: `1px solid ${C.borderSoft}` }}>
            <button onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle sidebar" style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", display: "flex" }}>
              {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setModelMenu((o) => !o)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.panelSoft, color: C.text, cursor: "pointer", fontSize: 13 }}
              >
                <Zap size={13} color={C.accent} />
                <span style={{ fontWeight: 600 }}>{activeModel.label}</span>
                <span style={{ color: C.faint, fontSize: 11.5 }}>{activeModel.provider}</span>
                <ChevronDown size={13} color={C.faint} />
              </button>
              <AnimatePresence>
                {modelMenu && (
                  <>
                    <div onClick={() => setModelMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      style={{ position: "absolute", top: 40, left: 0, zIndex: 50, width: 260, background: C.raised, border: `1px solid ${C.border}`, borderRadius: 12, padding: 6, boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}
                    >
                      {MODELS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setModel(m.id);
                            setModelMenu(false);
                            if (active) patchActive((c) => ({ ...c, model: m.id }));
                          }}
                          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, width: "100%", textAlign: "left", padding: "9px 11px", borderRadius: 8, border: "none", cursor: "pointer", background: m.id === model ? C.panelSoft : "transparent", color: C.text }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                            {m.label}
                            <span style={{ fontSize: 10.5, color: C.faint, fontWeight: 500 }}>{m.provider}</span>
                            {m.id === model && <Check size={12} color={C.green} style={{ marginLeft: "auto" }} />}
                          </span>
                          <span style={{ fontSize: 11.5, color: C.faint }}>{m.blurb}</span>
                        </button>
                      ))}
                      <div style={{ padding: "7px 11px 3px", fontSize: 10.5, color: C.faint, borderTop: `1px solid ${C.borderSoft}`, marginTop: 4 }}>
                        Served on Groq for low-latency inference.
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {active && active.messages.length > 0 && (
              <button onClick={regenerate} disabled={streaming} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: streaming ? C.faint : C.muted, cursor: streaming ? "default" : "pointer", fontSize: 12.5 }}>
                <RotateCcw size={13} /> Regenerate
              </button>
            )}
          </div>

          {/* Thread */}
          <div ref={threadRef} style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
            {!active || active.messages.length === 0 ? (
              <EmptyState onPick={(p) => send(p)} />
            ) : (
              <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: 20 }}>
                {active.messages.map((m) => (
                  <MessageRow key={m.id} msg={m} streaming={streaming} />
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <div style={{ flexShrink: 0, padding: "12px 20px 18px", borderTop: `1px solid ${C.borderSoft}` }}>
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(draft);
                }}
                style={{ display: "flex", alignItems: "flex-end", gap: 8, background: C.panelSoft, border: `1px solid ${C.border}`, borderRadius: 16, padding: 8 }}
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(draft);
                    }
                  }}
                  placeholder={`Message ${activeModel.label}…`}
                  rows={1}
                  style={{ flex: 1, resize: "none", maxHeight: 160, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 14.5, lineHeight: 1.5, padding: "8px 10px", fontFamily: "inherit" }}
                />
                {streaming ? (
                  <button type="button" onClick={stop} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, border: "none", background: C.raised, color: C.text, cursor: "pointer", flexShrink: 0 }} aria-label="Stop">
                    <Square size={15} fill="currentColor" />
                  </button>
                ) : (
                  <button type="submit" disabled={!draft.trim()} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, border: "none", background: draft.trim() ? `linear-gradient(135deg, ${C.accent}, ${C.accent2})` : C.raised, color: "white", cursor: draft.trim() ? "pointer" : "default", flexShrink: 0 }} aria-label="Send">
                    <Send size={16} />
                  </button>
                )}
              </form>
              <div style={{ textAlign: "center", fontSize: 11, color: C.faint, marginTop: 8 }}>
                ChatFlow AI can make mistakes. Responses stream live from Groq · Enter to send, Shift+Enter for newline.
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: C.raised, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 18px", fontSize: 13, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.6)" }}
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .cf-conv .cf-del { opacity: 0; transition: opacity 0.15s; }
        .cf-conv:hover .cf-del { opacity: 1; }
        @media (max-width: 720px) { .cf-sidebar { position: absolute; z-index: 30; height: 100%; } }
      `}</style>
    </div>
  );
}

/* ─── Message row ────────────────────────────────────────── */
function MessageRow({ msg, streaming }: { msg: Msg; streaming: boolean }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const isEmptyStreaming = !isUser && msg.content === "" && streaming;

  return (
    <div style={{ display: "flex", gap: 12, flexDirection: isUser ? "row-reverse" : "row" }}>
      {isUser ? (
        <div style={{ width: 28, height: 28, borderRadius: 9, background: C.raised, border: `1px solid ${C.border}`, display: "grid", placeItems: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: C.muted }}>You</div>
      ) : (
        <AiAvatar />
      )}
      <div style={{ maxWidth: "82%", minWidth: 0 }}>
        <div
          style={{
            background: isUser ? `linear-gradient(135deg, ${C.accent}, #6d5ce7)` : C.panelSoft,
            border: isUser ? "none" : `1px solid ${C.border}`,
            color: isUser ? "white" : C.text,
            borderRadius: 14,
            padding: isUser ? "10px 14px" : "12px 16px",
            wordBreak: "break-word",
          }}
        >
          {isEmptyStreaming ? (
            <span style={{ display: "inline-flex", gap: 4, padding: "2px 0" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: C.muted, animation: `mk-typing 1.2s ease-in-out ${i * 0.16}s infinite` }} />
              ))}
            </span>
          ) : isUser ? (
            <span style={{ fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.content}</span>
          ) : (
            <Markdown text={msg.content} />
          )}
        </div>
        {!isUser && !isEmptyStreaming && (
          <button
            onClick={() => {
              navigator.clipboard?.writeText(msg.content).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, background: "transparent", border: "none", color: copied ? C.green : C.faint, cursor: "pointer", fontSize: 11.5 }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────── */
function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: "inline-flex", marginBottom: 18 }}>
          <AiAvatar size={54} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>How can I help?</h1>
        <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.6, margin: "0 0 28px" }}>
          Real streaming answers from open models on Groq. Pick a starting point or just type below.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="cf-suggest">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.title}
              onClick={() => onPick(s.prompt)}
              style={{ textAlign: "left", background: C.panelSoft, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", color: C.text, transition: "border-color 0.15s, transform 0.15s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.accent;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{s.prompt}</div>
            </button>
          ))}
        </div>
      </motion.div>
      <style>{`@media (max-width: 560px) { .cf-suggest { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
