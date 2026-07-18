import { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import DemoShell from "./DemoShell";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  updatedAt: number;
  trashed?: boolean;
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

type Mode = "write" | "split" | "preview";

export default function SnapNoteDemo() {
  const [notes, setNotes] = useState<Note[]>(load);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("write");
  const [showTrash, setShowTrash] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(notes));
    } catch { /* demo state just won't persist */ }
  }, [notes]);

  const allTags = useMemo(
    () => [...new Set(notes.filter((n) => !n.trashed).flatMap((n) => n.tags))].sort(),
    [notes],
  );
  const trashCount = notes.filter((n) => n.trashed).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = notes.filter((n) => {
      if (Boolean(n.trashed) !== showTrash) return false;
      if (tagFilter && !n.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.includes(q))
      );
    });
    return [...base].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [notes, query, tagFilter, showTrash]);

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
    setMode("write");
    setShowTrash(false);
  };

  const update = (id: string, patch: Partial<Note>) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));

  const trash = (id: string) => {
    update(id, { trashed: true, pinned: false });
    if (selectedId === id) setSelectedId(null);
  };
  const restore = (id: string) => update(id, { trashed: false });
  const destroy = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const exportNote = (n: Note) => {
    const blob = new Blob([`# ${n.title}\n\n${n.content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(n.title || "note").replace(/[^a-z0-9-_ ]/gi, "").trim() || "note"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const modeBtn = (m: Mode, label: string) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      className={m === "split" ? "snap-split-btn" : undefined}
      style={{
        background: "#10131c",
        border: `1px solid ${mode === m ? "#14b8a6" : "#262b38"}`,
        color: mode === m ? "#e6e9f0" : "#8b93a7",
        borderRadius: 8,
        padding: "6px 12px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  const editorArea = (n: Note) => (
    <textarea
      value={n.content}
      onChange={(e) => update(n.id, { content: e.target.value })}
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
  );

  return (
    <DemoShell
      title="SnapNote"
      tagline="Markdown Notes"
      accent="#14b8a6"
      github="https://github.com/Sextty/SnapNote"
      bg="#0f1117"
    >
      <div className="demo-split-snap">
        {/* sidebar */}
        <aside style={{ borderRight: "1px solid #262b38", padding: 16, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 800 }}>{showTrash ? "Trash" : "Notes"}</span>
            <button onClick={createNote} style={{ background: "#14b8a6", color: "#04201c", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}>
              + New
            </button>
          </div>
          <input
            placeholder="Search notes & tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8, border: "1px solid #262b38", background: "#10131c", color: "#e6e9f0", marginBottom: 10 }}
          />

          {/* tag filter */}
          {!showTrash && allTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTagFilter(tagFilter === t ? null : t)}
                  aria-pressed={tagFilter === t}
                  style={{
                    fontSize: 11,
                    color: tagFilter === t ? "#04201c" : "#14b8a6",
                    background: tagFilter === t ? "#14b8a6" : "rgba(20,184,166,0.1)",
                    border: "none",
                    borderRadius: 999,
                    padding: "2px 9px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
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
            {filtered.length === 0 && (
              <div style={{ color: "#8b93a7", padding: 12, fontSize: 13.5 }}>
                {showTrash ? "Trash is empty." : "No notes found."}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowTrash((s) => !s);
              setSelectedId(null);
              setTagFilter(null);
            }}
            style={{
              marginTop: 10,
              background: showTrash ? "rgba(20,184,166,0.1)" : "transparent",
              border: "1px solid #262b38",
              color: showTrash ? "#14b8a6" : "#8b93a7",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 13,
              textAlign: "left",
            }}
          >
            {showTrash ? "← Back to notes" : `🗑 Trash (${trashCount})`}
          </button>
        </aside>

        {/* editor */}
        <main style={{ overflowY: "auto" }}>
          {selected ? (
            selected.trashed ? (
              <div style={{ padding: "24px 28px", maxWidth: 780, margin: "0 auto" }}>
                <div style={{ background: "#171a23", border: "1px solid #262b38", borderRadius: 12, padding: 18, marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ color: "#8b93a7", fontSize: 14 }}>This note is in the trash.</span>
                  <button onClick={() => restore(selected.id)} style={{ background: "#14b8a6", color: "#04201c", border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 600, cursor: "pointer", marginLeft: "auto" }}>
                    Restore
                  </button>
                  <button onClick={() => destroy(selected.id)} style={{ background: "rgba(239,68,68,0.14)", color: "#fca5a5", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
                    Delete forever
                  </button>
                </div>
                <h1 style={{ fontSize: 22, margin: "0 0 12px" }}>{selected.title}</h1>
                <Markdown src={selected.content} />
              </div>
            ) : (
              <div style={{ padding: "24px 28px", maxWidth: mode === "split" ? 1100 : 780, margin: "0 auto" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    value={selected.title}
                    onChange={(e) => update(selected.id, { title: e.target.value })}
                    placeholder="Title"
                    style={{ flex: 1, minWidth: 160, fontSize: 22, fontWeight: 700, background: "transparent", border: "none", color: "#e6e9f0", outline: "none" }}
                  />
                  {modeBtn("write", "Write")}
                  {modeBtn("split", "Split")}
                  {modeBtn("preview", "Preview")}
                  <button onClick={() => update(selected.id, { pinned: !selected.pinned })} title={selected.pinned ? "Unpin" : "Pin"} style={{ background: "#10131c", border: `1px solid ${selected.pinned ? "#14b8a6" : "#262b38"}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                    📌
                  </button>
                  <button onClick={() => exportNote(selected)} title="Export as markdown" style={{ background: "#10131c", border: "1px solid #262b38", color: "#8b93a7", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                    ⇩ .md
                  </button>
                  <button onClick={() => trash(selected.id)} style={{ background: "rgba(239,68,68,0.14)", color: "#fca5a5", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
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
                <div style={{ color: "#8b93a7", fontSize: 12, marginBottom: 8 }}>
                  {selected.content.trim() ? selected.content.trim().split(/\s+/).length : 0} words ·{" "}
                  {selected.content.length} chars · saved locally
                </div>
                {mode === "preview" && <Markdown src={selected.content} />}
                {mode === "write" && editorArea(selected)}
                {mode === "split" && (
                  <div className="snap-split">
                    {editorArea(selected)}
                    <div style={{ border: "1px solid #262b38", borderRadius: 10, padding: 14, minHeight: "55vh", overflowY: "auto" }}>
                      <Markdown src={selected.content} />
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#8b93a7", textAlign: "center", padding: 20 }}>
              <div>
                <div style={{ fontSize: 34, marginBottom: 10 }}>📝</div>
                <p style={{ margin: "0 0 14px" }}>
                  {showTrash ? "Select a trashed note to restore it." : "Select a note, or create a new one."}
                </p>
                {!showTrash && (
                  <button onClick={createNote} style={{ background: "#14b8a6", color: "#04201c", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 600, cursor: "pointer" }}>
                    + New note
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </DemoShell>
  );
}
