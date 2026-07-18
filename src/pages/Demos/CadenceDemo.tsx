import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  CalendarDays,
  Sparkles,
  Users,
  Settings,
  Search,
  Bell,
  Command,
  Sun,
  Moon,
  Plus,
  X,
  ArrowLeft,
  Github,
  ChevronRight,
  Send,
  CheckCircle2,
  Keyboard,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   CADENCE — AI workspace for focused teams
   Indigo/violet glassmorphism. Own full app chrome (sidebar +
   topbar), not the thin generic DemoShell — this is meant to
   feel like a complete distinct product being logged into.
   ═══════════════════════════════════════════════════════════ */

const DARK = {
  bg: "#0b0b1d",
  bgGrad: "radial-gradient(circle at 15% 0%, #1e1b4b 0%, #0b0b1d 45%), radial-gradient(circle at 90% 20%, #2e1065 0%, transparent 40%)",
  panel: "rgba(255,255,255,0.045)",
  panelStrong: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#f2f1fb",
  muted: "#9791b8",
  mutedFaint: "#615c82",
  primary: "#7c6cf0",
  primaryBright: "#9d8cff",
  accent: "#c084fc",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
};
const LIGHT = {
  bg: "#f4f3fb",
  bgGrad: "radial-gradient(circle at 15% 0%, #ede9fe 0%, #f4f3fb 45%), radial-gradient(circle at 90% 10%, #ede4ff 0%, transparent 45%)",
  panel: "rgba(255,255,255,0.65)",
  panelStrong: "rgba(255,255,255,0.9)",
  border: "rgba(76,29,149,0.10)",
  borderStrong: "rgba(76,29,149,0.18)",
  text: "#211d3d",
  muted: "#6b6592",
  mutedFaint: "#a29cc4",
  primary: "#6d5bd0",
  primaryBright: "#5b48c4",
  accent: "#a855f7",
  success: "#059669",
  warning: "#d97706",
  danger: "#dc2626",
};

type Palette = typeof DARK;

const TEAM = [
  { initials: "WJ", name: "Wassim Jebali", color: "#7c6cf0" },
  { initials: "AL", name: "Alina Cho", color: "#f472b6" },
  { initials: "MK", name: "Marcus Kim", color: "#38bdf8" },
  { initials: "PR", name: "Priya Rao", color: "#34d399" },
];

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "backlog" | "todo" | "inprogress" | "done";
interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  assignee: string;
  dueInDays: number | null;
  tags: string[];
}
interface CalEvent {
  id: string;
  title: string;
  day: number; // 0 = Mon
  startHour: number;
  hours: number;
  color: string;
}
interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  minutesAgo: number;
}
interface Notif {
  id: string;
  kind: "mention" | "assigned" | "comment" | "ai";
  text: string;
  minutesAgo: number;
  read: boolean;
}
interface ChatMsg {
  id: string;
  role: "user" | "ai";
  text: string;
}

const PRIORITY_WEIGHT: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
const PRIORITY_COLOR: Record<Priority, string> = { urgent: "#f87171", high: "#fbbf24", medium: "#7c6cf0", low: "#6b7280" };

const seedTasks = (): Task[] => [
  { id: "t1", title: "Define Q3 workspace roadmap", status: "backlog", priority: "medium", assignee: "WJ", dueInDays: 9, tags: ["planning"] },
  { id: "t2", title: "Interview 3 candidates for design role", status: "backlog", priority: "low", assignee: "AL", dueInDays: 14, tags: ["hiring"] },
  { id: "t3", title: "Migrate auth to passkeys", status: "todo", priority: "high", assignee: "MK", dueInDays: 4, tags: ["engineering"] },
  { id: "t4", title: "Write launch announcement", status: "todo", priority: "medium", assignee: "PR", dueInDays: 6, tags: ["marketing"] },
  { id: "t5", title: "Fix command palette on Firefox", status: "inprogress", priority: "urgent", assignee: "WJ", dueInDays: 1, tags: ["bug"] },
  { id: "t6", title: "Design empty states for Calendar", status: "inprogress", priority: "medium", assignee: "AL", dueInDays: 3, tags: ["design"] },
  { id: "t7", title: "Ship AI daily summary card", status: "done", priority: "high", assignee: "MK", dueInDays: null, tags: ["ai"] },
  { id: "t8", title: "Onboarding checklist v2", status: "done", priority: "low", assignee: "PR", dueInDays: null, tags: ["growth"] },
];

const seedEvents = (): CalEvent[] => [
  { id: "e1", title: "Standup", day: 0, startHour: 9, hours: 0.5, color: "#7c6cf0" },
  { id: "e2", title: "Design review", day: 0, startHour: 14, hours: 1, color: "#f472b6" },
  { id: "e3", title: "1:1 with Marcus", day: 1, startHour: 11, hours: 0.5, color: "#38bdf8" },
  { id: "e4", title: "Roadmap planning", day: 1, startHour: 15, hours: 1.5, color: "#c084fc" },
  { id: "e5", title: "Standup", day: 2, startHour: 9, hours: 0.5, color: "#7c6cf0" },
  { id: "e6", title: "Customer call — Acme", day: 2, startHour: 13, hours: 1, color: "#34d399" },
  { id: "e7", title: "Standup", day: 3, startHour: 9, hours: 0.5, color: "#7c6cf0" },
  { id: "e8", title: "Engineering sync", day: 3, startHour: 10, hours: 1, color: "#38bdf8" },
  { id: "e9", title: "Demo Friday prep", day: 4, startHour: 12, hours: 1, color: "#fbbf24" },
  { id: "e10", title: "Standup", day: 4, startHour: 9, hours: 0.5, color: "#7c6cf0" },
];

const seedActivity = (): ActivityItem[] => [
  { id: "a1", actor: "Marcus Kim", action: "completed", target: "Ship AI daily summary card", minutesAgo: 22 },
  { id: "a2", actor: "Alina Cho", action: "commented on", target: "Design empty states for Calendar", minutesAgo: 48 },
  { id: "a3", actor: "Priya Rao", action: "created", target: "Write launch announcement", minutesAgo: 95 },
  { id: "a4", actor: "Wassim Jebali", action: "moved", target: "Fix command palette on Firefox → In Progress", minutesAgo: 130 },
  { id: "a5", actor: "Cadence AI", action: "suggested a priority reorder for", target: "In Progress", minutesAgo: 180 },
  { id: "a6", actor: "Marcus Kim", action: "attached a file to", target: "Migrate auth to passkeys", minutesAgo: 260 },
];

const seedNotifs = (): Notif[] => [
  { id: "n1", kind: "assigned", text: "Marcus Kim assigned you “Fix command palette on Firefox”", minutesAgo: 12, read: false },
  { id: "n2", kind: "mention", text: "Alina Cho mentioned you in a comment", minutesAgo: 40, read: false },
  { id: "n3", kind: "ai", text: "Cadence AI drafted your weekly summary", minutesAgo: 70, read: false },
  { id: "n4", kind: "comment", text: "Priya Rao replied to your comment", minutesAgo: 150, read: true },
  { id: "n5", kind: "assigned", text: "You were added to Roadmap planning", minutesAgo: 300, read: true },
];

const NOTIF_ICON: Record<Notif["kind"], string> = { mention: "@", assigned: "→", comment: "💬", ai: "✨" };

function aiReply(prompt: string, taskCount: number, doneCount: number): string {
  const p = prompt.toLowerCase();
  if (/^create task[:\s]/.test(p) || /^add task[:\s]/.test(p)) {
    return "__CREATE_TASK__";
  }
  if (/summary|today|standup/.test(p)) {
    return `Here's where things stand: ${taskCount} tasks in flight, ${doneCount} shipped this week. The team's biggest blocker is the Firefox command-palette bug — Wassim's on it, marked urgent. Design review at 2pm today.`;
  }
  if (/schedule|calendar|meeting/.test(p)) {
    return "You've got Standup at 9am, then a Design review at 2pm. Tomorrow's lighter — just a 1:1 with Marcus and Roadmap planning in the afternoon.";
  }
  if (/priorit/.test(p)) {
    return "I'd focus on the Firefox command-palette bug first — it's urgent and due tomorrow. Everything else in progress has more runway.";
  }
  if (/thanks|thank you/.test(p)) {
    return "Anytime — that's what I'm here for. 🙌";
  }
  if (/hello|hi|hey/.test(p)) {
    return "Hey! I can summarize your day, draft tasks, or check your schedule — just ask.";
  }
  return "Got it — I've logged that. Try asking me to \"summarize today\", \"create task: ...\", or \"what's my schedule\".";
}

/* ─── shared atoms ────────────────────────────────────────── */

function useToasts() {
  const [toasts, setToasts] = useState<{ id: string; text: string }[]>([]);
  const push = (text: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  };
  return { toasts, push };
}

function Avatar({ member, size = 26 }: { member: { initials: string; color: string }; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        color: "white",
        background: member.color,
        flexShrink: 0,
      }}
    >
      {member.initials}
    </span>
  );
}

export default function CadenceDemo() {
  const [dark, setDark] = useState(true);
  const C: Palette = dark ? DARK : LIGHT;
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState<"dashboard" | "tasks" | "calendar" | "assistant" | "team" | "settings">("dashboard");
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [events] = useState<CalEvent[]>(seedEvents);
  const [activity] = useState<ActivityItem[]>(seedActivity);
  const [notifs, setNotifs] = useState<Notif[]>(seedNotifs);
  const [notifOpen, setNotifOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [chat, setChat] = useState<ChatMsg[]>([
    { id: "m0", role: "ai", text: "Hey Wassim 👋 I'm your Cadence assistant. Ask me to summarize your day, check your schedule, or create a task." },
  ]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatTyping, setChatTyping] = useState(false);
  const { toasts, push } = useToasts();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("demo_cadence_theme");
      if (saved) setDark(saved === "dark");
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("demo_cadence_theme", dark ? "dark" : "light");
    } catch { /* ignore */ }
  }, [dark]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, chatTyping]);

  // Global keyboard shortcuts: Cmd/Ctrl+K (palette), ? (shortcuts help), Esc (close overlays)
  useEffect(() => {
    if (!authed) return;
    const onKey = (e: KeyboardEvent) => {
      const inField = (e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setShortcutsOpen(false);
        setNotifOpen(false);
        return;
      }
      if (e.key === "?" && !inField) {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authed]);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const inProgressCount = tasks.filter((t) => t.status === "inprogress").length;
  const dueTodayCount = tasks.filter((t) => t.dueInDays !== null && t.dueInDays <= 1).length;

  const addTask = (title: string) => {
    const id = Math.random().toString(36).slice(2, 8);
    setTasks((prev) => [
      { id, title, status: "todo", priority: "medium", assignee: "WJ", dueInDays: 5, tags: [] },
      ...prev,
    ]);
    push(`Task created: "${title}"`);
  };

  const suggestPriority = () => {
    // "AI" reorder: within each status, sort by priority weight then due date.
    setTasks((prev) =>
      [...prev].sort((a, b) => {
        if (a.status !== b.status) return 0;
        const w = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (w !== 0) return w;
        return (a.dueInDays ?? 99) - (b.dueInDays ?? 99);
      }),
    );
    push("Cadence AI reordered tasks by urgency");
  };

  const sendChat = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const userMsg: ChatMsg = { id: Math.random().toString(36).slice(2), role: "user", text };
    setChat((c) => [...c, userMsg]);
    setChatDraft("");
    setChatTyping(true);
    setTimeout(() => {
      let reply = aiReply(text, tasks.length, doneCount);
      if (reply === "__CREATE_TASK__") {
        const title = text.replace(/^(create|add) task[:\s]*/i, "").trim() || "New task";
        addTask(title);
        reply = `Done — I created "${title}" in your To-do column.`;
      }
      setChat((c) => [...c, { id: Math.random().toString(36).slice(2), role: "ai", text: reply }]);
      setChatTyping(false);
    }, 900 + Math.random() * 500);
  };

  /* ─── Auth gate ─────────────────────────────────────────── */
  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: DARK.bgGrad,
          backgroundColor: DARK.bg,
          color: DARK.text,
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "18px 24px" }}>
          <Link to="/projects" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: DARK.muted, textDecoration: "none", fontSize: 13.5 }}>
            <ArrowLeft size={15} /> Portfolio
          </Link>
        </div>
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 20 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              width: "min(400px, 92vw)",
              background: DARK.panel,
              border: `1px solid ${DARK.border}`,
              borderRadius: 24,
              padding: 34,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 30px 90px -30px rgba(124,108,240,0.35)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${DARK.primary}, ${DARK.accent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <Sparkles size={24} color="white" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Cadence</h1>
            <p style={{ color: DARK.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 26px" }}>
              The AI workspace built for how your team actually thinks. Tasks,
              calendar, and an assistant that knows your day — in one place.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAuthed(true)}
              style={{
                width: "100%",
                padding: "13px 0",
                border: "none",
                borderRadius: 12,
                background: `linear-gradient(90deg, ${DARK.primary}, ${DARK.accent})`,
                color: "white",
                fontWeight: 700,
                fontSize: 14.5,
                cursor: "pointer",
              }}
            >
              Continue as demo user
            </motion.button>
            <p style={{ color: DARK.mutedFaint, fontSize: 12, marginTop: 16 }}>
              No sign-up — this is a fully interactive local demo.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const navItems: { id: typeof view; label: string; icon: typeof LayoutGrid }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "tasks", label: "Tasks", icon: CheckCircle2 },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "assistant", label: "AI Assistant", icon: Sparkles },
    { id: "team", label: "Team", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const paletteResults = (q: string) => {
    const items: { id: string; label: string; hint: string; action: () => void }[] = [];
    navItems.forEach((n) =>
      items.push({ id: `nav-${n.id}`, label: n.label, hint: "Go to", action: () => setView(n.id) }),
    );
    items.push({ id: "toggle-theme", label: dark ? "Switch to light mode" : "Switch to dark mode", hint: "Action", action: () => setDark((d) => !d) });
    items.push({ id: "new-task", label: "Create a new task", hint: "Action", action: () => { setView("tasks"); } });
    if (!q.trim()) return items.slice(0, 8);
    const lc = q.toLowerCase();
    const taskMatches = tasks
      .filter((t) => t.title.toLowerCase().includes(lc))
      .map((t) => ({ id: `task-${t.id}`, label: t.title, hint: "Task", action: () => setView("tasks") }));
    return [...items.filter((i) => i.label.toLowerCase().includes(lc)), ...taskMatches].slice(0, 8);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgGrad,
        backgroundColor: C.bg,
        color: C.text,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        display: "flex",
        transition: "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          borderRight: `1px solid ${C.border}`,
          padding: "20px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
        className="cadence-sidebar"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 8px 20px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15.5, letterSpacing: "-0.01em" }}>Cadence</span>
        </div>

        {navItems.map((n) => {
          const Icon = n.icon;
          const active = view === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                textAlign: "left",
                padding: "9px 12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: active ? C.panelStrong : "transparent",
                color: active ? C.text : C.muted,
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
              }}
            >
              <Icon size={16} />
              {n.label}
            </button>
          );
        })}

        <button
          onClick={() => setPaletteOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 14,
            padding: "9px 12px",
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.panel,
            color: C.muted,
            cursor: "pointer",
            fontSize: 12.5,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={14} /> Search
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, opacity: 0.8 }}>
            <Command size={11} />K
          </span>
        </button>

        <div style={{ marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <Link to="/projects" style={{ display: "flex", alignItems: "center", gap: 8, color: C.mutedFaint, textDecoration: "none", fontSize: 12.5, padding: "6px 8px" }}>
            <ArrowLeft size={13} /> Back to portfolio
          </Link>
          <a href="https://github.com/Sextty/Cadence" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: C.mutedFaint, textDecoration: "none", fontSize: 12.5, padding: "6px 8px" }}>
            <Github size={13} /> Source
          </a>
        </div>
      </aside>

      {/* Main column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header
          style={{
            height: 56,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 20px",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14.5, textTransform: "capitalize" }}>
            {view === "assistant" ? "AI Assistant" : view}
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: C.primaryBright,
              border: `1px solid ${C.primaryBright}55`,
              borderRadius: 999,
              padding: "2px 9px",
            }}
          >
            LIVE DEMO
          </span>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 9, width: 34, height: 34, display: "grid", placeItems: "center", cursor: "pointer", color: C.muted }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                style={{ position: "relative", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 9, width: 34, height: 34, display: "grid", placeItems: "center", cursor: "pointer", color: C.muted }}
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: -3, right: -3, width: 15, height: 15, borderRadius: "50%", background: C.danger, color: "white", fontSize: 9, fontWeight: 700, display: "grid", placeItems: "center" }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      top: 42,
                      right: 0,
                      width: 320,
                      background: C.panelStrong,
                      border: `1px solid ${C.borderStrong}`,
                      borderRadius: 14,
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)",
                      zIndex: 60,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>Notifications</span>
                      <button
                        onClick={() => setNotifs((n) => n.map((x) => ({ ...x, read: true })))}
                        style={{ background: "none", border: "none", color: C.primaryBright, fontSize: 11.5, cursor: "pointer" }}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      {notifs.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                          style={{
                            display: "flex",
                            gap: 10,
                            width: "100%",
                            textAlign: "left",
                            padding: "11px 14px",
                            background: n.read ? "transparent" : `${C.primary}14`,
                            border: "none",
                            borderBottom: `1px solid ${C.border}`,
                            cursor: "pointer",
                            color: C.text,
                          }}
                        >
                          <span style={{ fontSize: 14 }}>{NOTIF_ICON[n.kind]}</span>
                          <span style={{ flex: 1 }}>
                            <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{n.text}</div>
                            <div style={{ fontSize: 11, color: C.mutedFaint, marginTop: 2 }}>{n.minutesAgo}m ago</div>
                          </span>
                          {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.primaryBright, flexShrink: 0, marginTop: 4 }} />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setView("settings")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="Profile menu">
              <Avatar member={TEAM[0]} size={30} />
            </button>
          </div>
        </header>

        {/* View body */}
        <main style={{ flex: 1, overflowY: "auto", padding: "26px 28px 60px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {view === "dashboard" && (
                <DashboardView C={C} dueTodayCount={dueTodayCount} inProgressCount={inProgressCount} doneCount={doneCount} events={events} activity={activity} onOpenAssistant={() => setView("assistant")} />
              )}
              {view === "tasks" && <TasksView C={C} tasks={tasks} setTasks={setTasks} onAdd={addTask} onSuggest={suggestPriority} />}
              {view === "calendar" && <CalendarView C={C} events={events} />}
              {view === "assistant" && (
                <AssistantView C={C} chat={chat} draft={chatDraft} setDraft={setChatDraft} onSend={sendChat} typing={chatTyping} endRef={chatEndRef} />
              )}
              {view === "team" && <TeamView C={C} tasks={tasks} />}
              {view === "settings" && <SettingsView C={C} dark={dark} setDark={setDark} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command palette */}
      <AnimatePresence>
        {paletteOpen && <CommandPalette C={C} onClose={() => setPaletteOpen(false)} results={paletteResults} />}
      </AnimatePresence>

      {/* Shortcuts dialog */}
      <AnimatePresence>{shortcutsOpen && <ShortcutsDialog C={C} onClose={() => setShortcutsOpen(false)} />}</AnimatePresence>

      {/* Toasts */}
      <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 100 }}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              style={{
                background: C.panelStrong,
                border: `1px solid ${C.borderStrong}`,
                borderRadius: 12,
                padding: "10px 16px",
                fontSize: 13,
                backdropFilter: "blur(16px)",
                boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle2 size={14} color={C.success} /> {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        .cadence-sidebar { display: flex; }
        @media (max-width: 820px) {
          .cadence-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────── */
function StatCard({ C, label, value, accent }: { C: Palette; label: string; value: string | number; accent: string }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px", backdropFilter: "blur(14px)" }}>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{label}</div>
      <div style={{ height: 3, borderRadius: 2, background: accent, width: 30, marginTop: 10 }} />
    </div>
  );
}

function DashboardView({
  C,
  dueTodayCount,
  inProgressCount,
  doneCount,
  events,
  activity,
  onOpenAssistant,
}: {
  C: Palette;
  dueTodayCount: number;
  inProgressCount: number;
  doneCount: number;
  events: CalEvent[];
  activity: ActivityItem[];
  onOpenAssistant: () => void;
}) {
  const todayEvents = events.filter((e) => e.day === new Date().getDay() - 1 || e.day === 0).slice(0, 4);
  return (
    <div style={{ maxWidth: 1080 }}>
      {/* AI summary */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.primary}22, ${C.accent}14)`,
          border: `1px solid ${C.primary}44`,
          borderRadius: 20,
          padding: "22px 24px",
          marginBottom: 22,
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          backdropFilter: "blur(14px)",
        }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Sparkles size={18} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>Good to see you, Wassim</div>
          <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.65, margin: "0 0 12px" }}>
            You have {dueTodayCount} task{dueTodayCount === 1 ? "" : "s"} due today and {inProgressCount} in progress. The Firefox
            command-palette bug is your top priority — it's marked urgent.
          </p>
          <button onClick={onOpenAssistant} style={{ background: "none", border: "none", color: C.primaryBright, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, padding: 0 }}>
            Ask the assistant <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard C={C} label="Due today" value={dueTodayCount} accent={C.danger} />
        <StatCard C={C} label="In progress" value={inProgressCount} accent={C.primary} />
        <StatCard C={C} label="Shipped this week" value={doneCount} accent={C.success} />
        <StatCard C={C} label="Focus score" value="87%" accent={C.accent} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }} className="cadence-grid">
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, backdropFilter: "blur(14px)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Today's schedule</h2>
          {todayEvents.length === 0 ? (
            <div style={{ color: C.mutedFaint, fontSize: 13 }}>Nothing scheduled — enjoy the quiet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {todayEvents.map((e) => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: `${e.color}14`, border: `1px solid ${e.color}33` }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.color }} />
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{e.title}</span>
                  <span style={{ fontSize: 12, color: C.muted, fontVariantNumeric: "tabular-nums" }}>
                    {String(Math.floor(e.startHour)).padStart(2, "0")}:{e.startHour % 1 === 0 ? "00" : "30"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, backdropFilter: "blur(14px)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Activity feed</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activity.map((a) => (
              <div key={a.id} style={{ fontSize: 12.5, lineHeight: 1.6, color: C.muted }}>
                <span style={{ color: C.text, fontWeight: 600 }}>{a.actor}</span> {a.action}{" "}
                <span style={{ color: C.text }}>{a.target}</span>
                <div style={{ fontSize: 11, color: C.mutedFaint }}>{a.minutesAgo}m ago</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 820px) { .cadence-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* ─── Tasks (Kanban) ─────────────────────────────────────── */
const COLUMNS: { id: Status; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To-do" },
  { id: "inprogress", label: "In Progress" },
  { id: "done", label: "Done" },
];

function TasksView({
  C,
  tasks,
  setTasks,
  onAdd,
  onSuggest,
}: {
  C: Palette;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onAdd: (title: string) => void;
  onSuggest: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [over, setOver] = useState<Status | null>(null);

  const move = (id: string, status: Status) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onAdd(draft.trim());
              setDraft("");
            }
          }}
          placeholder="Quick add a task and press Enter…"
          style={{ flex: 1, minWidth: 220, padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.panel, color: C.text, fontSize: 13.5 }}
        />
        <button
          onClick={onSuggest}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 10, border: `1px solid ${C.accent}55`, background: `${C.accent}18`, color: C.accent, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          <Sparkles size={14} /> AI: suggest priority
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(220px, 1fr))", gap: 14, overflowX: "auto" }} className="cadence-kanban">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(col.id);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = e.dataTransfer.getData("text/plain");
                if (id) move(id, col.id);
              }}
              style={{
                background: over === col.id ? `${C.primary}10` : "transparent",
                border: `1px solid ${over === col.id ? C.primary : "transparent"}`,
                borderRadius: 16,
                padding: 8,
                minHeight: 120,
                transition: "background 0.12s, border-color 0.12s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 10px", fontSize: 12.5, fontWeight: 700, color: C.muted }}>
                {col.label}
                <span style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 999, padding: "1px 8px", fontSize: 11 }}>{colTasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <AnimatePresence>
                  {colTasks.map((t) => {
                    const member = TEAM.find((m) => m.initials === t.assignee) || TEAM[0];
                    return (
                      <motion.div
                        layout
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable
                        onDragStart={(e) => (e as unknown as React.DragEvent).dataTransfer.setData("text/plain", t.id)}
                        style={{
                          background: C.panelStrong,
                          border: `1px solid ${C.border}`,
                          borderRadius: 12,
                          padding: "11px 12px",
                          cursor: "grab",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>{t.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITY_COLOR[t.priority] }} />
                          <span style={{ fontSize: 10.5, color: C.mutedFaint, textTransform: "capitalize" }}>{t.priority}</span>
                          <Avatar member={member} size={20} />
                          {t.dueInDays !== null && (
                            <span style={{ marginLeft: "auto", fontSize: 10.5, color: t.dueInDays <= 1 ? C.danger : C.mutedFaint }}>
                              {t.dueInDays === 0 ? "today" : `${t.dueInDays}d`}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@media (max-width: 900px) { .cadence-kanban { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* ─── Calendar ───────────────────────────────────────────── */
function CalendarView({ C, events }: { C: Palette; events: CalEvent[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const hours = Array.from({ length: 9 }, (_, i) => 9 + i); // 9am - 5pm
  const [selected, setSelected] = useState<CalEvent | null>(null);

  return (
    <div style={{ maxWidth: 980, position: "relative" }}>
      <div style={{ display: "grid", gridTemplateColumns: "50px repeat(5, 1fr)", border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}` }} />
        {days.map((d) => (
          <div key={d} style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, borderLeft: `1px solid ${C.border}`, padding: "10px 0", textAlign: "center", fontSize: 12.5, fontWeight: 700 }}>
            {d}
          </div>
        ))}
        {hours.map((h, hi) => (
          <div key={h} style={{ display: "contents" }}>
            <div style={{ padding: "18px 8px 0", fontSize: 10.5, color: C.mutedFaint, textAlign: "right", borderTop: hi > 0 ? `1px solid ${C.border}` : "none" }}>
              {h}:00
            </div>
            {days.map((_, di) => (
              <div key={di} style={{ position: "relative", height: 52, borderTop: hi > 0 ? `1px solid ${C.border}` : "none", borderLeft: `1px solid ${C.border}` }}>
                {events
                  .filter((e) => e.day === di && Math.floor(e.startHour) === h)
                  .map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelected(e)}
                      style={{
                        position: "absolute",
                        left: 3,
                        right: 3,
                        top: (e.startHour % 1) * 52 + 2,
                        height: Math.max(e.hours * 52 - 4, 18),
                        background: `${e.color}2a`,
                        border: `1px solid ${e.color}77`,
                        borderRadius: 7,
                        padding: "3px 6px",
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: C.text,
                        textAlign: "left",
                        cursor: "pointer",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {e.title}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 70 }} />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 80,
                background: C.panelStrong,
                border: `1px solid ${C.borderStrong}`,
                borderRadius: 18,
                padding: 24,
                width: "min(320px, 90vw)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: selected.color }} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>{selected.title}</span>
                <button onClick={() => setSelected(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, cursor: "pointer" }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ color: C.muted, fontSize: 13 }}>
                {days[selected.day]} · {String(Math.floor(selected.startHour)).padStart(2, "0")}:{selected.startHour % 1 === 0 ? "00" : "30"} · {selected.hours}h
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── AI Assistant ───────────────────────────────────────── */
function AssistantView({
  C,
  chat,
  draft,
  setDraft,
  onSend,
  typing,
  endRef,
}: {
  C: Palette;
  chat: ChatMsg[];
  draft: string;
  setDraft: (v: string) => void;
  onSend: (v: string) => void;
  typing: boolean;
  endRef: React.RefObject<HTMLDivElement>;
}) {
  const suggestions = ["Summarize today", "What's my schedule?", "Create task: review PR #482"];
  return (
    <div style={{ maxWidth: 700, height: "calc(100vh - 180px)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 12 }}>
        {chat.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "78%",
                display: "flex",
                gap: 9,
                flexDirection: m.role === "user" ? "row-reverse" : "row",
              }}
            >
              {m.role === "ai" && (
                <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Sparkles size={13} color="white" />
                </div>
              )}
              <div
                style={{
                  background: m.role === "user" ? `linear-gradient(90deg, ${C.primary}, ${C.accent})` : C.panel,
                  border: m.role === "ai" ? `1px solid ${C.border}` : "none",
                  color: m.role === "user" ? "white" : C.text,
                  borderRadius: 14,
                  padding: "10px 14px",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                }}
              >
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "grid", placeItems: "center" }}>
              <Sparkles size={13} color="white" />
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.muted, animation: `mk-typing 1.2s ease-in-out ${i * 0.16}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSend(s)}
            style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 999, padding: "6px 13px", fontSize: 12, color: C.muted, cursor: "pointer" }}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend(draft);
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask Cadence anything…"
          style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.panel, color: C.text, fontSize: 14 }}
        />
        <button type="submit" style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`, border: "none", borderRadius: 12, width: 46, display: "grid", placeItems: "center", cursor: "pointer" }}>
          <Send size={16} color="white" />
        </button>
      </form>
    </div>
  );
}

/* ─── Team ───────────────────────────────────────────────── */
function TeamView({ C, tasks }: { C: Palette; tasks: Task[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14, maxWidth: 900 }}>
      {TEAM.map((m) => {
        const assigned = tasks.filter((t) => t.assignee === m.initials && t.status !== "done").length;
        return (
          <div key={m.initials} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, backdropFilter: "blur(14px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Avatar member={m} size={40} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.muted }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} /> Online
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: C.muted }}>{assigned} open task{assigned === 1 ? "" : "s"}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Settings ───────────────────────────────────────────── */
function SettingsView({ C, dark, setDark }: { C: Palette; dark: boolean; setDark: (v: boolean) => void }) {
  const [notifs, setNotifs] = useState({ mentions: true, assignments: true, ai: false });
  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Profile</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <Avatar member={TEAM[0]} size={48} />
          <div>
            <div style={{ fontWeight: 700 }}>Wassim Jebali</div>
            <div style={{ color: C.muted, fontSize: 12.5 }}>wassimjebali583@gmail.com</div>
          </div>
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Appearance</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13.5 }}>Theme</span>
          <div style={{ display: "flex", gap: 4, background: C.panelStrong, border: `1px solid ${C.border}`, borderRadius: 999, padding: 3 }}>
            <button onClick={() => setDark(true)} style={{ border: "none", borderRadius: 999, padding: "6px 14px", fontSize: 12.5, cursor: "pointer", background: dark ? C.primary : "transparent", color: dark ? "white" : C.muted }}>
              Dark
            </button>
            <button onClick={() => setDark(false)} style={{ border: "none", borderRadius: 999, padding: "6px 14px", fontSize: 12.5, cursor: "pointer", background: !dark ? C.primary : "transparent", color: !dark ? "white" : C.muted }}>
              Light
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Notifications</h2>
        {(
          [
            ["mentions", "Mentions"],
            ["assignments", "Task assignments"],
            ["ai", "AI daily summary"],
          ] as [keyof typeof notifs, string][]
        ).map(([key, label]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0" }}>
            <span style={{ fontSize: 13.5 }}>{label}</span>
            <button
              onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))}
              aria-pressed={notifs[key]}
              style={{
                width: 38,
                height: 22,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: notifs[key] ? C.primary : C.borderStrong,
                position: "relative",
                transition: "background 0.15s",
              }}
            >
              <span style={{ position: "absolute", top: 3, left: notifs[key] ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Command palette ────────────────────────────────────── */
function CommandPalette({
  C,
  onClose,
  results,
}: {
  C: Palette;
  onClose: () => void;
  results: (q: string) => { id: string; label: string; hint: string; action: () => void }[];
}) {
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(0);
  const items = results(q);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 90 }} />
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ duration: 0.16 }}
        style={{
          position: "fixed",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 95,
          width: "min(520px, 92vw)",
          background: C.panelStrong,
          border: `1px solid ${C.borderStrong}`,
          borderRadius: 16,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 40px 90px -20px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
          <Search size={16} color={C.muted} />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, items.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter" && items[index]) {
                items[index].action();
                onClose();
              }
            }}
            placeholder="Search or run a command…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 14.5 }}
          />
          <kbd style={{ fontSize: 10.5, color: C.mutedFaint, border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 6px" }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto", padding: 6 }}>
          {items.length === 0 && <div style={{ padding: "20px 14px", color: C.mutedFaint, fontSize: 13 }}>No results.</div>}
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => {
                it.action();
                onClose();
              }}
              onMouseEnter={() => setIndex(i)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                background: index === i ? C.panel : "transparent",
                color: C.text,
                fontSize: 13.5,
              }}
            >
              {it.label}
              <span style={{ fontSize: 11, color: C.mutedFaint }}>{it.hint}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}

/* ─── Shortcuts dialog ───────────────────────────────────── */
function ShortcutsDialog({ C, onClose }: { C: Palette; onClose: () => void }) {
  const rows = [
    ["Cmd/Ctrl + K", "Open command palette"],
    ["?", "Show this dialog"],
    ["Esc", "Close any overlay"],
  ];
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 90 }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 95,
          width: "min(360px, 90vw)",
          background: C.panelStrong,
          border: `1px solid ${C.borderStrong}`,
          borderRadius: 16,
          padding: 22,
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
          <Keyboard size={16} color={C.primaryBright} />
          <span style={{ fontWeight: 700, fontSize: 14.5 }}>Keyboard shortcuts</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>
        {rows.map(([key, label]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${C.border}`, fontSize: 13 }}>
            <span style={{ color: C.muted }}>{label}</span>
            <kbd style={{ fontSize: 11, border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 8px", fontFamily: "ui-monospace, monospace" }}>{key}</kbd>
          </div>
        ))}
      </motion.div>
    </>
  );
}

/* Avoid unused-import lint noise while keeping the icon available for future nav polish. */
void Plus;
