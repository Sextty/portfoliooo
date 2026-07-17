import { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import DemoShell from "./DemoShell";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  updatedAt: number;
}

const STORAGE = "demo_snapnote_notes";

const seed: Note[] = [
  {
    id: "n1",
    title: "Welcome to SnapNote",
    content:
      "# Welcome 👋\n\nSnapNote is a **markdown** notes app.\n\n- Write in markdown\n- Tag your notes\n- Search across everything\n\n`inline code` renders too.",
    tags: ["intro", "guide"],
    pinned: true,
    updatedAt: Date.now(),
  },
  {
    id: "n2",
    title: "Meeting notes — roadmap",
    content: "## Roadmap sync\n\n- Ship search\n- Add sharing\n- Export to PDF\n\n> Follow up with design on the editor.",
    tags: ["work", "meeting"],
    pinned: false,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "n3",
    title: "Reading list",
    content: "### To read\n\n- Designing Data-Intensive Applications\n- The Pragmatic Programmer\n- *Refactoring* — Martin Fowler",
    tags: ["personal", "books"],
    pinned: false,
    updatedAt: Date.now() - 2 * 86400000,
  },
];

function load(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw);
  } catch { /* reseed */ }
  return seed;
}

// Minimal inline-markdown renderer for the demo: **bold**, *italic*, `code`.
function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*")) return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code key={i} style={{ background: "#10131c", padding: "2px 6px", borderRadius: 4, fontSize: "0.9em" }}>
          {p.slice(1, -1)}
        </code>
      );
    return <Fragment key={i}>{p}</Fragment>;
  });
}

// Minimal block renderer: headings, lists, quotes, paragraphs.
function Markdown({ src }: { src: string }) {
  const blocks = src.split(/\n{2,}/);
  return (
    <div style={{ lineHeight: 1.7 }}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim() !== "");
        if (lines.length === 0) return null;
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={bi} style={{ margin: "0.6em 0", paddingLeft: 22 }}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return lines.map((l, li) => {
          const key = `${bi}-${li}`;
          if (l.startsWith("### ")) return <h3 key={key} style={{ margin: "0.8em 0 0.3em" }}>{inline(l.slice(4))}</h3>;
          if (l.startsWith("## ")) return <h2 key={key} style={{ margin: "0.8em 0 0.3em" }}>{inline(l.slice(3))}</h2>;
          if (l.startsWith("# ")) return <h1 key={key} style={{ margin: "0.8em 0 0.3em" }}>{inline(l.slice(2))}</h1>;
          if (l.startsWith("> "))
            return (
              <blockquote key={key} style={{ borderLeft: "3px solid #14b8a6", margin: "0.6em 0", paddingLeft: 14, color: "#8b93a7" }}>
                {inline(l.slice(2))}
              </blockquote>
            );
          if (l.startsWith("- ")) return <li key={key} style={{ marginLeft: 22 }}>{inline(l.slice(2))}</li>;
          return <p key={key} style={{ margin: "0.4em 0" }}>{inline(l)}</p>;
        });
      })}
    </div>
  );
}

export default function SnapNoteDemo() {
  const [notes, setNotes] = useState<Note[]>(load);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(notes));
    } catch { /* demo state just won't persist */ }
  }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.tags.some((t) => t.includes(q)),
        )
      : notes;
    return [...base].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [notes, query]);

  const selected = notes.find((n) => n.id === selectedId) || null;

  const createNote = () => {
    const n: Note = {
      id: Math.random().toString(36).slice(2, 9),
      title: "Untitled",
      content: "",
      tags: [],
      pinned: false,
      updatedAt: Date.now(),
    };
    setNotes((prev) => [n, ...prev]);
    setSelectedId(n.id);
    setPreview(false);
  };

  const update = (id: string, patch: Partial<Note>) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));

  const remove = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <DemoShell
      title="SnapNote"
      tagline="Markdown Notes"
      accent="#14b8a6"
      github="https://github.com/Sextty/SnapNote"
      bg="#0f1117"
    >
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 49px)" }}>
        {/* sidebar */}
        <aside style={{ borderRight: "1px solid #262b38", padding: 16, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 800 }}>Notes</span>
            <button onClick={createNote} style={{ background: "#14b8a6", color: "#04201c", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}>
              + New
            </button>
          </div>
          <input
            placeholder="Search notes & tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8, border: "1px solid #262b38", background: "#10131c", color: "#e6e9f0", marginBottom: 12 }}
          />
          <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedId(n.id)}
                style={{
                  textAlign: "left",
                  background: "#171a23",
                  border: `1px solid ${n.id === selectedId ? "#14b8a6" : "#262b38"}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  cursor: "pointer",
                  color: "#e6e9f0",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {n.pinned && "📌 "}
                  {n.title || "Untitled"}
                </div>
                <div style={{ fontSize: 12, color: "#8b93a7", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {n.content.replace(/[#*`>-]/g, "").slice(0, 50) || "Empty"}
                </div>
                {n.tags.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {n.tags.map((t) => (
                      <span key={t} style={{ fontSize: 11, color: "#14b8a6", background: "rgba(20,184,166,0.1)", borderRadius: 999, padding: "1px 8px" }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
            {filtered.length === 0 && <div style={{ color: "#8b93a7", padding: 12 }}>No notes found.</div>}
          </div>
        </aside>

        {/* editor */}
        <main style={{ overflowY: "auto" }}>
          {selected ? (
            <div style={{ padding: "24px 28px", maxWidth: 780, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  value={selected.title}
                  onChange={(e) => update(selected.id, { title: e.target.value })}
                  placeholder="Title"
                  style={{ flex: 1, fontSize: 22, fontWeight: 700, background: "transparent", border: "none", color: "#e6e9f0", outline: "none" }}
                />
                <button onClick={() => setPreview(false)} style={{ background: "#10131c", border: `1px solid ${preview ? "#262b38" : "#14b8a6"}`, color: preview ? "#8b93a7" : "#e6e9f0", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                  Write
                </button>
                <button onClick={() => setPreview(true)} style={{ background: "#10131c", border: `1px solid ${preview ? "#14b8a6" : "#262b38"}`, color: preview ? "#e6e9f0" : "#8b93a7", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                  Preview
                </button>
                <button onClick={() => update(selected.id, { pinned: !selected.pinned })} title="Pin" style={{ background: "#10131c", border: "1px solid #262b38", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                  📌
                </button>
                <button onClick={() => remove(selected.id)} style={{ background: "rgba(239,68,68,0.14)", color: "#fca5a5", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
              <input
                value={selected.tags.join(", ")}
                onChange={(e) =>
                  update(selected.id, {
                    tags: e.target.value.split(",").map((t) => t.toLowerCase().trim()).filter(Boolean),
                  })
                }
                placeholder="tags, comma, separated"
                style={{ width: "100%", boxSizing: "border-box", margin: "12px 0", background: "transparent", border: "none", borderBottom: "1px solid #262b38", color: "#14b8a6", padding: "6px 0", outline: "none", fontSize: 13 }}
              />
              {preview ? (
                <Markdown src={selected.content} />
              ) : (
                <textarea
                  value={selected.content}
                  onChange={(e) => update(selected.id, { content: e.target.value })}
                  placeholder="Write markdown here… (# heading, **bold**, - list, > quote)"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    minHeight: "55vh",
                    background: "#10131c",
                    border: "1px solid #262b38",
                    borderRadius: 10,
                    color: "#e6e9f0",
                    padding: 14,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 14,
                    lineHeight: 1.6,
                    resize: "vertical",
                  }}
                />
              )}
            </div>
          ) : (
            <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#8b93a7" }}>
              <p>Select a note, or create a new one.</p>
            </div>
          )}
        </main>
      </div>
    </DemoShell>
  );
}
