import { useEffect, useMemo, useRef, useState } from "react";
import DemoShell from "./DemoShell";

interface FileVersion {
  version: number;
  size: number;
  ts: number;
  by: string;
}
interface VaultFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  owner: string;
  url?: string; // object URL for real uploads (downloadable)
  version?: number;
  ts: number;
  versions: FileVersion[];
  permission: "private" | "team can view" | "team can edit";
}
interface Activity {
  type: "created" | "deleted";
  name: string;
  by: string;
  ts: number;
}

const COLLABORATORS = ["alina", "marcus", "priya"];
const FAKE_FILES = ["q3-report.pdf", "design-v2.fig", "roadmap.xlsx", "team-photo.jpg", "api-spec.yaml", "budget-2026.csv"];
const QUOTA = 100 * 1048576; // 100 MB demo quota

const seed: VaultFile[] = [
  {
    id: "f1",
    name: "product-brief.pdf",
    size: 482_133,
    mimeType: "application/pdf",
    owner: "wassim",
    ts: Date.now() - 3600e3,
    version: 3,
    versions: [
      { version: 3, size: 482_133, ts: Date.now() - 3600e3, by: "wassim" },
      { version: 2, size: 445_020, ts: Date.now() - 86400e3, by: "alina" },
      { version: 1, size: 396_411, ts: Date.now() - 2 * 86400e3, by: "wassim" },
    ],
    permission: "team can edit",
  },
  {
    id: "f2",
    name: "logo-final.png",
    size: 128_990,
    mimeType: "image/png",
    owner: "alina",
    ts: Date.now() - 7200e3,
    version: 1,
    versions: [{ version: 1, size: 128_990, ts: Date.now() - 7200e3, by: "alina" }],
    permission: "team can view",
  },
  {
    id: "f3",
    name: "backup.zip",
    size: 8_421_002,
    mimeType: "application/zip",
    owner: "marcus",
    ts: Date.now() - 10800e3,
    version: 1,
    versions: [{ version: 1, size: 8_421_002, ts: Date.now() - 10800e3, by: "marcus" }],
    permission: "private",
  },
];

function humanSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}
function icon(mime: string) {
  if (mime.startsWith("image/")) return "🖼️";
  if (mime.startsWith("video/")) return "🎬";
  if (mime.startsWith("audio/")) return "🎵";
  if (mime.includes("pdf")) return "📕";
  if (mime.includes("zip") || mime.includes("tar")) return "🗜️";
  return "📄";
}

type TypeFilter = "all" | "images" | "docs" | "archives";
const TYPE_FILTERS: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "images", label: "Images" },
  { id: "docs", label: "Documents" },
  { id: "archives", label: "Archives" },
];

function matchesType(f: VaultFile, t: TypeFilter) {
  if (t === "all") return true;
  if (t === "images") return f.mimeType.startsWith("image/");
  if (t === "archives") return f.mimeType.includes("zip") || f.mimeType.includes("tar");
  return !f.mimeType.startsWith("image/") && !f.mimeType.includes("zip") && !f.mimeType.includes("tar");
}

export default function CloudVaultDemo() {
  const [files, setFiles] = useState<VaultFile[]>(seed);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [drag, setDrag] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [selected, setSelected] = useState<VaultFile | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  // Simulated collaborators — in the real app these arrive over the NestJS
  // WebSocket gateway; here an interval plays that role.
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() > 0.4) return;
      const by = COLLABORATORS[Math.floor(Math.random() * COLLABORATORS.length)];
      const name = FAKE_FILES[Math.floor(Math.random() * FAKE_FILES.length)];
      const size = 20_000 + Math.floor(Math.random() * 4_000_000);
      const f: VaultFile = {
        id: Math.random().toString(36).slice(2, 9),
        name,
        size,
        mimeType: name.endsWith(".jpg") ? "image/jpeg" : name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream",
        owner: by,
        ts: Date.now(),
        version: 1,
        versions: [{ version: 1, size, ts: Date.now(), by }],
        permission: "team can view",
      };
      setFiles((prev) => [f, ...prev].slice(0, 30));
      setActivity((a) => [{ type: "created" as const, name, by, ts: Date.now() }, ...a].slice(0, 25));
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // Revoke object URLs on unmount; Escape closes the details modal.
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const upload = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach((file) => {
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      setFiles((prev) => {
        // Same rule as the real app: re-uploading a filename bumps its version.
        const existing = prev.find((x) => x.name === file.name);
        if (existing) {
          return prev.map((x) =>
            x.id === existing.id
              ? {
                  ...x,
                  size: file.size,
                  mimeType: file.type || x.mimeType,
                  url,
                  version: (x.version || 1) + 1,
                  ts: Date.now(),
                  versions: [
                    { version: (x.version || 1) + 1, size: file.size, ts: Date.now(), by: "you" },
                    ...x.versions,
                  ],
                }
              : x,
          );
        }
        const f: VaultFile = {
          id: Math.random().toString(36).slice(2, 9),
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          owner: "you",
          url,
          version: 1,
          ts: Date.now(),
          versions: [{ version: 1, size: file.size, ts: Date.now(), by: "you" }],
          permission: "private",
        };
        return [f, ...prev];
      });
      setActivity((a) => [{ type: "created" as const, name: file.name, by: "you", ts: Date.now() }, ...a].slice(0, 25));
    });
  };

  const remove = (f: VaultFile) => {
    setFiles((prev) => prev.filter((x) => x.id !== f.id));
    setActivity((a) => [{ type: "deleted" as const, name: f.name, by: "you", ts: Date.now() }, ...a].slice(0, 25));
    setSelected((s) => (s?.id === f.id ? null : s));
  };

  const setPermission = (id: string, permission: VaultFile["permission"]) => {
    setFiles((prev) => prev.map((x) => (x.id === id ? { ...x, permission } : x)));
    setSelected((s) => (s?.id === id ? { ...s, permission } : s));
  };

  const used = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);
  const visible = files.filter(
    (f) => matchesType(f, typeFilter) && (!query.trim() || f.name.toLowerCase().includes(query.trim().toLowerCase())),
  );

  const chipStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "rgba(245,158,11,0.14)" : "transparent",
    color: active ? "#fbbf24" : "#8a97a6",
    border: `1px solid ${active ? "#f59e0b66" : "#26303a"}`,
    borderRadius: 999,
    padding: "6px 13px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  });

  return (
    <DemoShell
      title="CloudVault"
      tagline="Secure File Storage & Collaboration"
      accent="#f59e0b"
      github="https://github.com/Sextty/CloudVault"
      bg="#0c1116"
    >
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "24px 20px 60px" }}>
        {/* Storage meter */}
        <div style={{ background: "#151b22", border: "1px solid #26303a", borderRadius: 12, padding: "14px 18px", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Team storage</span>
            <span style={{ color: "#8a97a6" }}>
              {humanSize(used)} of {humanSize(QUOTA)} used
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "#1e2730", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.min((used / QUOTA) * 100, 100)}%`,
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            aria-label="Search files"
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #26303a",
              background: "#151b22",
              color: "#e7edf3",
              fontSize: 13.5,
              width: "min(200px, 50vw)",
            }}
          />
          {TYPE_FILTERS.map((t) => (
            <button key={t.id} onClick={() => setTypeFilter(t.id)} style={chipStyle(typeFilter === t.id)} aria-pressed={typeFilter === t.id}>
              {t.label}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: "#151b22", border: "1px solid #26303a", borderRadius: 8, padding: 3 }}>
            {(["list", "grid"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={`${v} view`}
                aria-pressed={view === v}
                style={{
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 6,
                  padding: "5px 11px",
                  fontSize: 14,
                  background: view === v ? "#26303a" : "transparent",
                  color: view === v ? "#e7edf3" : "#8a97a6",
                }}
              >
                {v === "list" ? "☰" : "▦"}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-grid-cv">
          <div>
            {/* dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                upload(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${drag ? "#f59e0b" : "#26303a"}`,
                background: drag ? "rgba(245,158,11,0.06)" : "#151b22",
                borderRadius: 14,
                padding: 26,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.15s",
                marginBottom: 18,
              }}
            >
              <div style={{ fontSize: 30 }}>☁️</div>
              <div style={{ fontWeight: 600, marginTop: 6 }}>Drop files to upload</div>
              <div style={{ color: "#8a97a6", fontSize: 13 }}>
                or click to browse — files stay in your browser for this demo (MinIO/S3 in the real app)
              </div>
              <input ref={inputRef} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
            </div>

            {/* empty state */}
            {visible.length === 0 && (
              <div style={{ background: "#151b22", border: "1px solid #26303a", borderRadius: 12, padding: 32, textAlign: "center", color: "#8a97a6", fontSize: 14 }}>
                Nothing matches — try a different search or filter.
              </div>
            )}

            {/* file list / grid */}
            {view === "list" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {visible.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelected(f)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelected(f)}
                    style={{ display: "flex", alignItems: "center", gap: 12, background: "#151b22", border: "1px solid #26303a", borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}
                  >
                    <span style={{ fontSize: 22 }}>{icon(f.mimeType)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                      <div style={{ color: "#8a97a6", fontSize: 12 }}>
                        {humanSize(f.size)} · v{f.version || 1} · {f.owner}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      {f.url && (
                        <a href={f.url} download={f.name} style={{ background: "#1e2730", color: "#e7edf3", border: "1px solid #26303a", borderRadius: 8, padding: "8px 12px", fontSize: 13, textDecoration: "none" }}>
                          Download
                        </a>
                      )}
                      <button onClick={() => remove(f)} style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13 }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                {visible.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelected(f)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelected(f)}
                    style={{ background: "#151b22", border: "1px solid #26303a", borderRadius: 12, padding: 14, textAlign: "center", cursor: "pointer" }}
                  >
                    <div style={{ fontSize: 34, marginBottom: 8 }}>
                      {f.url && f.mimeType.startsWith("image/") ? (
                        <img src={f.url} alt="" style={{ width: "100%", height: 64, objectFit: "cover", borderRadius: 8 }} />
                      ) : (
                        icon(f.mimeType)
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                    <div style={{ color: "#8a97a6", fontSize: 11, marginTop: 3 }}>
                      {humanSize(f.size)} · v{f.version || 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* activity feed */}
          <aside style={{ background: "#151b22", border: "1px solid #26303a", borderRadius: 12, padding: 16, alignSelf: "start" }}>
            <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Live activity
            </div>
            {activity.length === 0 && <div style={{ color: "#8a97a6", fontSize: 13 }}>Waiting for events… (collaborators are simulated)</div>}
            {activity.map((it, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: "1px solid #26303a", fontSize: 13 }}>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 7px",
                    borderRadius: 999,
                    textTransform: "uppercase",
                    background: it.type === "deleted" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                    color: it.type === "deleted" ? "#fca5a5" : "#86efac",
                  }}
                >
                  {it.type}
                </span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#8a97a6" }}>
                  {it.name} <em>({it.by})</em>
                </span>
                <span style={{ color: "#8a97a6", fontSize: 11 }}>
                  {new Date(it.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            ))}
          </aside>
        </div>
        <p style={{ color: "#8a97a6", fontSize: 12, marginTop: 24 }}>
          Uploads/deletes and collaborator events update the feed live — click a
          file for versions &amp; sharing. The full app (NestJS + PostgreSQL +
          MinIO + WebSockets) is on GitHub.
        </p>
      </div>

      {/* File details modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5,8,12,0.72)",
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
            aria-label={`File details: ${selected.name}`}
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#151b22", border: "1px solid #26303a", borderRadius: 16, padding: 22, width: "min(460px, 94vw)", maxHeight: "86vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 30 }}>{icon(selected.mimeType)}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</div>
                <div style={{ color: "#8a97a6", fontSize: 12.5 }}>
                  {humanSize(selected.size)} · uploaded by {selected.owner}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#8a97a6", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {selected.url && selected.mimeType.startsWith("image/") && (
              <img src={selected.url} alt={selected.name} style={{ width: "100%", borderRadius: 10, marginBottom: 16, maxHeight: 220, objectFit: "contain", background: "#0c1116" }} />
            )}

            {/* Sharing */}
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8a97a6", marginBottom: 8 }}>Sharing</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {(["private", "team can view", "team can edit"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPermission(selected.id, p)}
                  style={{
                    background: selected.permission === p ? "rgba(245,158,11,0.14)" : "transparent",
                    color: selected.permission === p ? "#fbbf24" : "#8a97a6",
                    border: `1px solid ${selected.permission === p ? "#f59e0b66" : "#26303a"}`,
                    borderRadius: 999,
                    padding: "5px 12px",
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: 600,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`https://vault.example/share/${selected.id}`).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              style={{ width: "100%", background: "#1e2730", color: copied ? "#86efac" : "#e7edf3", border: "1px solid #26303a", borderRadius: 8, padding: "10px 12px", cursor: "pointer", fontSize: 13.5, marginBottom: 18 }}
            >
              {copied ? "✓ Share link copied" : "Copy share link"}
            </button>

            {/* Version history */}
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8a97a6", marginBottom: 8 }}>
              Version history
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {selected.versions.map((v) => (
                <div key={v.version} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid #26303a", fontSize: 13 }}>
                  <span style={{ fontFamily: "ui-monospace, monospace", color: v.version === selected.version ? "#fbbf24" : "#8a97a6" }}>
                    v{v.version}
                  </span>
                  <span style={{ color: "#e7edf3" }}>{humanSize(v.size)}</span>
                  <span style={{ color: "#8a97a6" }}>by {v.by}</span>
                  <span style={{ marginLeft: "auto", color: "#8a97a6", fontSize: 12 }}>
                    {new Date(v.ts).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                  {v.version === selected.version && (
                    <span style={{ fontSize: 10.5, color: "#86efac", border: "1px solid #22c55e55", borderRadius: 999, padding: "1px 7px" }}>
                      current
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              {selected.url && (
                <a
                  href={selected.url}
                  download={selected.name}
                  style={{ flex: 1, textAlign: "center", background: "linear-gradient(90deg, #f59e0b, #fbbf24)", color: "#1a1206", fontWeight: 700, border: "none", borderRadius: 8, padding: "11px 12px", textDecoration: "none", fontSize: 13.5 }}
                >
                  Download
                </a>
              )}
              <button
                onClick={() => remove(selected)}
                style={{ flex: 1, background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "none", borderRadius: 8, padding: "11px 12px", cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}
              >
                Delete file
              </button>
            </div>
          </div>
        </div>
      )}
    </DemoShell>
  );
}
