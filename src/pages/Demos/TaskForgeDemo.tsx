import { useEffect, useState } from "react";
import DemoShell from "./DemoShell";

interface Card {
  id: string;
  title: string;
  desc: string;
  label: string;
  assignee: string;
  priority: "low" | "medium" | "high";
}
interface Column {
  id: string;
  title: string;
  cards: Card[];
}

// v2 key: cards gained assignee/priority; older cached boards migrate below.
const STORAGE = "demo_taskforge_board_v2";
const LEGACY_STORAGE = "demo_taskforge_board";

const PEOPLE = ["AL", "MK", "WJ", "PR"];
const LABELS = ["#6366f1", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6"];
const WIP_LIMIT = 3; // soft limit for In Progress

const seed: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    cards: [
      { id: "c1", title: "Design onboarding flow", desc: "Wireframes + copy", label: "#ec4899", assignee: "AL", priority: "medium" },
      { id: "c2", title: "Research auth providers", desc: "OAuth vs magic links", label: "#f59e0b", assignee: "MK", priority: "low" },
    ],
  },
  {
    id: "progress",
    title: "In Progress",
    cards: [
      { id: "c3", title: "Build board API", desc: "Express + Prisma", label: "#6366f1", assignee: "WJ", priority: "high" },
      { id: "c4", title: "Drag & drop cards", desc: "Native HTML5 DnD", label: "#06b6d4", assignee: "WJ", priority: "medium" },
    ],
  },
  {
    id: "review",
    title: "Review",
    cards: [{ id: "c5", title: "Set up CI pipeline", desc: "GitHub Actions", label: "#8b5cf6", assignee: "PR", priority: "medium" }],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "c6", title: "Project scaffolding", desc: "Repo + docker-compose", label: "#22c55e", assignee: "AL", priority: "low" }],
  },
];

function load(): Column[] {
  try {
    const raw = localStorage.getItem(STORAGE) ?? localStorage.getItem(LEGACY_STORAGE);
    if (raw) {
      const cols = JSON.parse(raw) as Column[];
      // Migrate cards saved before assignee/priority existed.
      return cols.map((c) => ({
        ...c,
        cards: c.cards.map((card) => ({
          assignee: PEOPLE[0],
          priority: "medium" as const,
          ...card,
        })),
      }));
    }
  } catch { /* fall through to seed */ }
  return seed;
}

const PRIORITY_META: Record<Card["priority"], { label: string; color: string }> = {
  low: { label: "Low", color: "#9298c4" },
  medium: { label: "Med", color: "#f59e0b" },
  high: { label: "High", color: "#ef4444" },
};

function Avatar({ initials, size = 22 }: { initials: string; size?: number }) {
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
        background: "linear-gradient(135deg, #6366f1, #06b6d4)",
        color: "white",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}

export default function TaskForgeDemo() {
  const [cols, setCols] = useState<Column[]>(load);
  const [over, setOver] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ colId: string; card: Card } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(cols));
    } catch { /* quota — demo state just won't persist */ }
  }, [cols]);

  // Escape closes the card editor.
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditing(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  const moveCard = (cardId: string, fromId: string, toId: string) => {
    if (fromId === toId) return;
    setCols((prev) => {
      const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
      const from = next.find((c) => c.id === fromId)!;
      const to = next.find((c) => c.id === toId)!;
      const idx = from.cards.findIndex((c) => c.id === cardId);
      if (idx === -1) return prev;
      const [card] = from.cards.splice(idx, 1);
      to.cards.push(card);
      return next;
    });
  };

  const addCard = (colId: string, title: string) => {
    setCols((prev) =>
      prev.map((c) =>
        c.id === colId
          ? {
              ...c,
              cards: [
                ...c.cards,
                {
                  id: Math.random().toString(36).slice(2, 9),
                  title,
                  desc: "",
                  label: LABELS[Math.floor(Math.random() * LABELS.length)],
                  assignee: PEOPLE[Math.floor(Math.random() * PEOPLE.length)],
                  priority: "medium",
                },
              ],
            }
          : c,
      ),
    );
  };

  const updateCard = (colId: string, updated: Card) =>
    setCols((prev) =>
      prev.map((c) =>
        c.id === colId ? { ...c, cards: c.cards.map((x) => (x.id === updated.id ? updated : x)) } : c,
      ),
    );

  const deleteCard = (colId: string, cardId: string) =>
    setCols((prev) =>
      prev.map((c) =>
        c.id === colId ? { ...c, cards: c.cards.filter((x) => x.id !== cardId) } : c,
      ),
    );

  const matches = (card: Card) => {
    const q = query.trim().toLowerCase();
    if (q && !`${card.title} ${card.desc}`.toLowerCase().includes(q)) return false;
    if (labelFilter && card.label !== labelFilter) return false;
    return true;
  };
  const filtering = query.trim() !== "" || labelFilter !== null;

  const chip: React.CSSProperties = {
    background: "#1a1e3a",
    border: "1px solid #2a2f52",
    color: "#9298c4",
    borderRadius: 999,
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: 13,
  };

  return (
    <DemoShell
      title="TaskForge"
      tagline="Kanban Board"
      accent="#6366f1"
      github="https://github.com/Sextty/TaskForge"
      bg="#0f1225"
    >
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "16px 24px 0" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cards…"
          aria-label="Search cards"
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #2a2f52",
            background: "#10132a",
            color: "#e8eaf6",
            fontSize: 13.5,
            width: "min(220px, 55vw)",
          }}
        />
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {LABELS.map((l) => (
            <button
              key={l}
              onClick={() => setLabelFilter(labelFilter === l ? null : l)}
              aria-label={`Filter by label ${l}`}
              aria-pressed={labelFilter === l}
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                background: l,
                border: labelFilter === l ? "2px solid white" : "2px solid transparent",
                cursor: "pointer",
                opacity: labelFilter && labelFilter !== l ? 0.35 : 1,
                transition: "opacity 0.15s",
              }}
            />
          ))}
        </div>
        {filtering && (
          <button onClick={() => { setQuery(""); setLabelFilter(null); }} style={chip}>
            Clear filters
          </button>
        )}
        <button
          onClick={() => setCols(seed)}
          style={{ ...chip, marginLeft: "auto" }}
          title="Restore the sample board"
        >
          Reset board
        </button>
      </div>

      <div style={{ padding: "18px 24px", display: "flex", gap: 16, alignItems: "flex-start", overflowX: "auto" }}>
        {cols.map((col) => {
          const overWip = col.id === "progress" && col.cards.length > WIP_LIMIT;
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
                try {
                  const { cardId, fromId } = JSON.parse(e.dataTransfer.getData("text/plain"));
                  moveCard(cardId, fromId, col.id);
                } catch { /* not a card drop */ }
              }}
              style={{
                background: over === col.id ? "#202554" : "#1a1e3a",
                border: `1px solid ${over === col.id ? "#6366f1" : "#2a2f52"}`,
                borderRadius: 12,
                width: 270,
                minWidth: 270,
                padding: 12,
                transition: "background 0.12s, border-color 0.12s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600, marginBottom: 10, padding: "0 4px", fontSize: 14 }}>
                <span>{col.title}</span>
                <span
                  title={overWip ? `Over the soft WIP limit of ${WIP_LIMIT}` : undefined}
                  style={{
                    background: overWip ? "rgba(245,158,11,0.16)" : "#2a2f52",
                    color: overWip ? "#f59e0b" : "#9298c4",
                    border: overWip ? "1px solid #f59e0b66" : "1px solid transparent",
                    borderRadius: 999,
                    fontSize: 12,
                    padding: "1px 9px",
                  }}
                >
                  {col.cards.length}
                  {col.id === "progress" ? ` / ${WIP_LIMIT}` : ""}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 12 }}>
                {col.cards.map((card) => {
                  const dim = filtering && !matches(card);
                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "text/plain",
                          JSON.stringify({ cardId: card.id, fromId: col.id }),
                        );
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => setEditing({ colId: col.id, card: { ...card } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditing({ colId: col.id, card: { ...card } });
                      }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        background: "#161a34",
                        border: "1px solid #2a2f52",
                        borderRadius: 10,
                        padding: "10px 10px 10px 8px",
                        cursor: "grab",
                        opacity: dim ? 0.25 : 1,
                        transition: "opacity 0.15s",
                      }}
                    >
                      <span style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: card.label }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{card.title}</div>
                        {card.desc && <div style={{ fontSize: 12, color: "#9298c4", marginTop: 2 }}>{card.desc}</div>}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
                          <Avatar initials={card.assignee} size={20} />
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: PRIORITY_META[card.priority].color,
                              border: `1px solid ${PRIORITY_META[card.priority].color}55`,
                              borderRadius: 999,
                              padding: "1px 8px",
                            }}
                          >
                            {PRIORITY_META[card.priority].label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {adding === col.id ? (
                <input
                  autoFocus
                  value={draft}
                  placeholder="Card title…"
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => setAdding(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && draft.trim()) {
                      addCard(col.id, draft.trim());
                      setDraft("");
                      setAdding(null);
                    }
                    if (e.key === "Escape") setAdding(null);
                  }}
                  style={{ width: "100%", marginTop: 8, padding: "9px 10px", borderRadius: 8, border: "1px solid #2a2f52", background: "#10132a", color: "#e8eaf6", boxSizing: "border-box" }}
                />
              ) : (
                <button
                  onClick={() => setAdding(col.id)}
                  style={{ width: "100%", marginTop: 8, background: "transparent", border: "1px dashed #2a2f52", color: "#9298c4", borderRadius: 8, padding: 8, cursor: "pointer" }}
                >
                  + Add card
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ color: "#9298c4", fontSize: 12, padding: "0 24px 30px" }}>
        Drag cards between columns, click one to edit — the board persists in
        your browser. The full app (Express + Prisma + PostgreSQL) is on GitHub.
      </p>

      {/* Card editor modal */}
      {editing && (
        <div
          onClick={() => setEditing(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,10,24,0.7)",
            backdropFilter: "blur(3px)",
            display: "grid",
            placeItems: "center",
            zIndex: 80,
            padding: 18,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Edit card: ${editing.card.title}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#161a34",
              border: "1px solid #2a2f52",
              borderRadius: 16,
              padding: 22,
              width: "min(440px, 94vw)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: editing.card.label }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Edit card</span>
              <button
                onClick={() => setEditing(null)}
                aria-label="Close"
                style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#9298c4", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <label style={{ display: "block", fontSize: 12, color: "#9298c4", marginBottom: 5 }}>Title</label>
            <input
              value={editing.card.title}
              onChange={(e) => setEditing({ ...editing, card: { ...editing.card, title: e.target.value } })}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid #2a2f52", background: "#10132a", color: "#e8eaf6", fontSize: 14, marginBottom: 14 }}
            />

            <label style={{ display: "block", fontSize: 12, color: "#9298c4", marginBottom: 5 }}>Notes</label>
            <textarea
              value={editing.card.desc}
              rows={2}
              onChange={(e) => setEditing({ ...editing, card: { ...editing.card, desc: e.target.value } })}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid #2a2f52", background: "#10132a", color: "#e8eaf6", fontSize: 14, marginBottom: 14, resize: "vertical" }}
            />

            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: "#9298c4", marginBottom: 6 }}>Label</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {LABELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setEditing({ ...editing, card: { ...editing.card, label: l } })}
                      aria-label={`Label ${l}`}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        background: l,
                        border: editing.card.label === l ? "2px solid white" : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9298c4", marginBottom: 6 }}>Assignee</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {PEOPLE.map((p) => (
                    <button
                      key={p}
                      onClick={() => setEditing({ ...editing, card: { ...editing.card, assignee: p } })}
                      aria-label={`Assign to ${p}`}
                      style={{
                        border: editing.card.assignee === p ? "2px solid #6366f1" : "2px solid transparent",
                        borderRadius: "50%",
                        padding: 1,
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <Avatar initials={p} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9298c4", marginBottom: 6 }}>Priority</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {(Object.keys(PRIORITY_META) as Card["priority"][]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setEditing({ ...editing, card: { ...editing.card, priority: p } })}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: editing.card.priority === p ? "#e8eaf6" : "#9298c4",
                        background: editing.card.priority === p ? "#2a2f52" : "transparent",
                        border: "1px solid #2a2f52",
                        borderRadius: 999,
                        padding: "4px 12px",
                        cursor: "pointer",
                      }}
                    >
                      {PRIORITY_META[p].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  deleteCard(editing.colId, editing.card.id);
                  setEditing(null);
                }}
                style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid #ef444455", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}
              >
                Delete
              </button>
              <button
                onClick={() => {
                  if (editing.card.title.trim()) {
                    updateCard(editing.colId, { ...editing.card, title: editing.card.title.trim() });
                    setEditing(null);
                  }
                }}
                style={{ marginLeft: "auto", background: "linear-gradient(90deg, #6366f1, #06b6d4)", color: "white", border: "none", borderRadius: 8, padding: "10px 22px", cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </DemoShell>
  );
}
