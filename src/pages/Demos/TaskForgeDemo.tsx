import { useEffect, useState } from "react";
import DemoShell from "./DemoShell";

interface Card {
  id: string;
  title: string;
  desc: string;
  label: string;
}
interface Column {
  id: string;
  title: string;
  cards: Card[];
}

const STORAGE = "demo_taskforge_board";

const seed: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    cards: [
      { id: "c1", title: "Design onboarding flow", desc: "Wireframes + copy", label: "#ec4899" },
      { id: "c2", title: "Research auth providers", desc: "OAuth vs magic links", label: "#f59e0b" },
    ],
  },
  {
    id: "progress",
    title: "In Progress",
    cards: [
      { id: "c3", title: "Build board API", desc: "Express + Prisma", label: "#6366f1" },
      { id: "c4", title: "Drag & drop cards", desc: "Native HTML5 DnD", label: "#06b6d4" },
    ],
  },
  {
    id: "review",
    title: "Review",
    cards: [{ id: "c5", title: "Set up CI pipeline", desc: "GitHub Actions", label: "#8b5cf6" }],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "c6", title: "Project scaffolding", desc: "Repo + docker-compose", label: "#22c55e" }],
  },
];

function load(): Column[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through to seed */ }
  return seed;
}

export default function TaskForgeDemo() {
  const [cols, setCols] = useState<Column[]>(load);
  const [over, setOver] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(cols));
    } catch { /* quota — demo state just won't persist */ }
  }, [cols]);

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
    const labels = ["#6366f1", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899"];
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
                  label: labels[Math.floor(Math.random() * labels.length)],
                },
              ],
            }
          : c,
      ),
    );
  };

  const deleteCard = (colId: string, cardId: string) =>
    setCols((prev) =>
      prev.map((c) =>
        c.id === colId ? { ...c, cards: c.cards.filter((x) => x.id !== cardId) } : c,
      ),
    );

  return (
    <DemoShell
      title="TaskForge"
      tagline="Kanban Board"
      accent="#6366f1"
      github="https://github.com/Sextty/TaskForge"
      bg="#0f1225"
    >
      <div style={{ padding: "22px 24px", display: "flex", gap: 16, alignItems: "flex-start", overflowX: "auto" }}>
        {cols.map((col) => (
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
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, marginBottom: 10, padding: "0 4px", fontSize: 14 }}>
              <span>{col.title}</span>
              <span style={{ background: "#2a2f52", color: "#9298c4", borderRadius: 999, fontSize: 12, padding: "1px 9px" }}>
                {col.cards.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 12 }}>
              {col.cards.map((card) => (
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
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    background: "#161a34",
                    border: "1px solid #2a2f52",
                    borderRadius: 10,
                    padding: "10px 10px 10px 8px",
                    cursor: "grab",
                  }}
                >
                  <span style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: card.label }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{card.title}</div>
                    {card.desc && <div style={{ fontSize: 12, color: "#9298c4", marginTop: 2 }}>{card.desc}</div>}
                  </div>
                  <button
                    onClick={() => deleteCard(col.id, card.id)}
                    title="Delete"
                    style={{ background: "transparent", border: "none", color: "#9298c4", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
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
        ))}
      </div>
      <p style={{ color: "#9298c4", fontSize: 12, padding: "0 24px 30px" }}>
        Drag cards between columns — the board persists in your browser. The full
        app (Express + Prisma + PostgreSQL) is on GitHub.
      </p>
    </DemoShell>
  );
}
