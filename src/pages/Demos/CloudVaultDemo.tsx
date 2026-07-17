import { useEffect, useRef, useState } from "react";
import DemoShell from "./DemoShell";

interface VaultFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  owner: string;
  url?: string; // object URL for real uploads (downloadable)
  ts: number;
}
interface Activity {
  type: "created" | "deleted";
  name: string;
  by: string;
  ts: number;
}

const COLLABORATORS = ["alina", "marcus", "priya"];
const FAKE_FILES = ["q3-report.pdf", "design-v2.fig", "roadmap.xlsx", "team-photo.jpg", "api-spec.yaml", "budget-2026.csv"];

const seed: VaultFile[] = [
  { id: "f1", name: "product-brief.pdf", size: 482_133, mimeType: "application/pdf", owner: "wassim", ts: Date.now() - 3600e3 },
  { id: "f2", name: "logo-final.png", size: 128_990, mimeType: "image/png", owner: "alina", ts: Date.now() - 7200e3 },
  { id: "f3", name: "backup.zip", size: 8_421_002, mimeType: "application/zip", owner: "marcus", ts: Date.now() - 10800e3 },
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

export default function CloudVaultDemo() {
  const [files, setFiles] = useState<VaultFile[]>(seed);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  // Simulated collaborators — in the real app these arrive over the NestJS
  // WebSocket gateway; here an interval plays that role.
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() > 0.4) return;
      const by = COLLABORATORS[Math.floor(Math.random() * COLLABORATORS.length)];
      const name = FAKE_FILES[Math.floor(Math.random() * FAKE_FILES.length)];
      const f: VaultFile = {
        id: Math.random().toString(36).slice(2, 9),
        name,
        size: 20_000 + Math.floor(Math.random() * 4_000_000),
        mimeType: name.endsWith(".jpg") ? "image/jpeg" : name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream",
        owner: by,
        ts: Date.now(),
      };
      setFiles((prev) => [f, ...prev].slice(0, 30));
      setActivity((a) => [{ type: "created" as const, name, by, ts: Date.now() }, ...a].slice(0, 25));
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // Revoke object URLs on unmount.
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const upload = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach((file) => {
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      const f: VaultFile = {
        id: Math.random().toString(36).slice(2, 9),
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        owner: "you",
        url,
        ts: Date.now(),
      };
      setFiles((prev) => [f, ...prev]);
      setActivity((a) => [{ type: "created" as const, name: file.name, by: "you", ts: Date.now() }, ...a].slice(0, 25));
    });
  };

  const remove = (f: VaultFile) => {
    setFiles((prev) => prev.filter((x) => x.id !== f.id));
    setActivity((a) => [{ type: "deleted" as const, name: f.name, by: "you", ts: Date.now() }, ...a].slice(0, 25));
  };

  return (
    <DemoShell
      title="CloudVault"
      tagline="Secure File Storage & Collaboration"
      accent="#f59e0b"
      github="https://github.com/Sextty/CloudVault"
      bg="#0c1116"
    >
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "24px 20px 60px" }}>
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
                padding: 34,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.15s",
                marginBottom: 18,
              }}
            >
              <div style={{ fontSize: 34 }}>☁️</div>
              <div style={{ fontWeight: 600, marginTop: 6 }}>Drop files to upload</div>
              <div style={{ color: "#8a97a6", fontSize: 13 }}>
                or click to browse — files stay in your browser for this demo (MinIO/S3 in the real app)
              </div>
              <input ref={inputRef} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
            </div>

            {/* file list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {files.map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#151b22", border: "1px solid #26303a", borderRadius: 10, padding: "12px 14px" }}>
                  <span style={{ fontSize: 22 }}>{icon(f.mimeType)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                    <div style={{ color: "#8a97a6", fontSize: 12 }}>
                      {humanSize(f.size)} · v1 · {f.owner}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
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
          Uploads/deletes and collaborator events update the feed live — the full
          app (NestJS + PostgreSQL + MinIO + WebSockets) is on GitHub.
        </p>
      </div>
    </DemoShell>
  );
}
