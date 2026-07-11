import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  Project,
} from "@/utils/projectDb";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Lock,
  LogOut,
  Folder,
  Star,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

const BEAUTIFUL_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Emerald", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Pink", value: "#ec4899" },
];

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    tags: "",
    image: "",
    runUrl: "",
    githubUrl: "",
    videoUrl: "",
    featured: false,
    color: "#6366f1",
    year: new Date().getFullYear().toString(),
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [dbVideoStatus, setDbVideoStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check local storage for auth state
    const auth = localStorage.getItem("wassim_portfolio_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      setProjects(getProjects());
    }
  }, []);

  // Sync check for IndexedDB video files whenever projects change
  useEffect(() => {
    const checkDbVideos = async () => {
      try {
        const { getVideo } = await import("@/utils/videoDb");
        const statusMap: Record<string, boolean> = {};
        for (const p of projects) {
          const blob = await getVideo(p.id);
          statusMap[p.id] = !!blob;
        }
        setDbVideoStatus(statusMap);
      } catch (err) {
        console.error("Error checking video DB", err);
      }
    };
    if (projects.length > 0) {
      checkDbVideos();
    }
  }, [projects]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setError("");
      localStorage.setItem("wassim_portfolio_admin_auth", "true");
      setProjects(getProjects());
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("wassim_portfolio_admin_auth");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Base64 file uploader
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleRemoveDbVideo = async () => {
    if (!editingId) return;
    if (confirm("Are you sure you want to remove the uploaded video for this project?")) {
      try {
        const { deleteVideo } = await import("@/utils/videoDb");
        await deleteVideo(editingId);
        setDbVideoStatus((prev) => ({ ...prev, [editingId]: false }));
        alert("Video file removed successfully.");
      } catch (err) {
        console.error("Error removing video", err);
      }
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      tagline: "",
      description: "",
      tags: "",
      image: "",
      runUrl: "",
      githubUrl: "",
      videoUrl: "",
      featured: false,
      color: "#6366f1",
      year: new Date().getFullYear().toString(),
    });
    setVideoFile(null);
    setIsFormOpen(true);
  };

  const openEditForm = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      tagline: project.tagline || "",
      description: project.description,
      tags: project.tags.join(", "),
      image: project.image || "",
      runUrl: project.runUrl || "",
      githubUrl: project.githubUrl || "",
      videoUrl: project.videoUrl || "",
      featured: project.featured,
      color: project.color || "#6366f1",
      year: project.year || new Date().getFullYear().toString(),
    });
    setVideoFile(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const projectPayload = {
      title: formData.title,
      tagline: formData.tagline || "Web Application",
      description: formData.description,
      tags: tagsArray,
      image: formData.image,
      runUrl: formData.runUrl,
      githubUrl: formData.githubUrl,
      videoUrl: formData.videoUrl,
      featured: formData.featured,
      color: formData.color,
      year: formData.year,
    };

    let projectId = editingId;
    try {
      if (editingId) {
        updateProject(editingId, projectPayload);
      } else {
        const newProj = addProject(projectPayload);
        projectId = newProj.id;
      }
    } catch (err) {
      console.error("Save failed, aborting", err);
      return; // keep the form open with the user's data intact
    }

    if (videoFile && projectId) {
      try {
        const { saveVideo } = await import("@/utils/videoDb");
        await saveVideo(projectId, videoFile);
      } catch (err) {
        console.error("Error saving video file to IndexedDB", err);
      }
    }

    setProjects(getProjects());
    setIsFormOpen(false);
    setVideoFile(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
      try {
        const { deleteVideo } = await import("@/utils/videoDb");
        await deleteVideo(id);
      } catch (err) {
        console.error("Error deleting video", err);
      }
      setProjects(getProjects());
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background dot-grid"
        style={{ color: "#e8ecf4" }}
      >
        <div className="absolute top-8 left-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
        </div>

        <form
          onSubmit={handleLogin}
          className="glass p-10 rounded-2xl max-w-md w-full flex flex-col gap-6"
        >
          <div className="text-center">
            <div className="w-14 h-14 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="text-primary" size={24} />
            </div>
            <h1
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "1.5rem",
              }}
            >
              Admin Dashboard
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
              Enter password to access database management
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (default: admin123)"
              required
              className="glow-input w-full px-4 py-3 rounded-xl"
            />
            {error && (
              <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                {error}
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary py-3 rounded-xl font-semibold">
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  // Dashboard Stats
  const totalProjects = projects.length;
  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <div
      className="min-h-screen bg-background dot-grid flex flex-col"
      style={{ color: "#e8ecf4" }}
    >
      {/* Header */}
      <header
        style={{
          height: 72,
          background: "rgba(6,9,18,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(99,102,241,0.12)",
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16"
      >
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft size={16} /> Portfolio
          </Link>
          <Link
            to="/projects"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            style={{ textDecoration: "none" }}
          >
            Project Zone
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, color: "#64748b" }} className="mono">
              SESSION STATUS:
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#10b981",
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.25)",
                padding: "2px 8px",
                borderRadius: 6,
              }}
              className="mono"
            >
              ADMIN
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors bg-transparent border-0 cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-20 px-8 md:px-16 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="section-tag mb-3">◈ &nbsp;Control Panel</p>
            <h1
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                color: "#e8ecf4",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Manage Projects
            </h1>
            <div className="gradient-line mt-5 max-w-sm" />
          </div>

          <button
            onClick={openAddForm}
            className="btn-primary px-6 py-3.5 rounded-xl text-[14px] flex items-center gap-2"
          >
            <Plus size={16} /> Add New Project
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="glass rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
              <Folder className="text-primary" size={20} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b" }} className="mono">
                TOTAL PROJECTS
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  fontFamily: "'Sora', sans-serif",
                  marginTop: 2,
                }}
              >
                {totalProjects}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald/10 border border-emerald/20 rounded-xl flex items-center justify-center">
              <Star className="text-emerald" size={20} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b" }} className="mono">
                FEATURED LANDING
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  fontFamily: "'Sora', sans-serif",
                  marginTop: 2,
                }}
              >
                {featuredCount}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 bg-amber/10 border border-amber/20 rounded-xl flex items-center justify-center">
              <Layers className="text-amber" size={20} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748b" }} className="mono">
                DATA STORAGE
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  fontFamily: "'Sora', sans-serif",
                  marginTop: 2,
                }}
              >
                LocalStorage
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal/Drawer */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="glass rounded-2xl w-full max-w-2xl overflow-hidden my-8">
              <div
                className="px-8 py-5 border-b border-border flex justify-between items-center bg-background/50"
              >
                <h3
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                  }}
                >
                  {editingId ? "Edit Project" : "Add New Project"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
                      PROJECT TITLE *
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. NexaCommerce"
                      required
                      className="glow-input w-full px-4 py-2.5 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
                      TAGLINE *
                    </label>
                    <input
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      placeholder="e.g. Full-Stack E-Commerce Platform"
                      required
                      className="glow-input w-full px-4 py-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
                      YEAR SHIPPED *
                    </label>
                    <input
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      placeholder="e.g. 2024"
                      required
                      className="glow-input w-full px-4 py-2.5 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
                      ACCENT COLOR
                    </label>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="glow-input w-full px-4 py-2.5 rounded-xl bg-card"
                    >
                      {BEAUTIFUL_COLORS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.name} ({c.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 justify-center pl-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none mt-5">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 rounded border-border bg-input-background text-primary focus:ring-primary focus:ring-offset-background"
                      />
                      <span className="mono" style={{ fontSize: 11, color: "#e8ecf4" }}>
                        FEATURE ON LANDING
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
                    DESCRIPTION *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the project, build features, architecture details..."
                    required
                    rows={4}
                    className="glow-input w-full px-4 py-2.5 rounded-xl"
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
                    TECH STACK / TAGS * (comma-separated)
                  </label>
                  <input
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g. React, Next.js, Node.js, Stripe, PostgreSQL"
                    required
                    className="glow-input w-full px-4 py-2.5 rounded-xl"
                  />
                </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
                        RUN URL
                      </label>
                      <input
                        name="runUrl"
                        value={formData.runUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com (optional)"
                        className="glow-input w-full px-4 py-2.5 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
                        GITHUB REPOSITORY
                      </label>
                      <input
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleInputChange}
                        placeholder="https://github.com/username/project (optional)"
                        className="glow-input w-full px-4 py-2.5 rounded-xl"
                      />
                    </div>
                  </div>

                {/* Image Section */}
                <div className="border border-border rounded-xl p-5 bg-card/30 flex flex-col gap-4">
                  <div className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
                    PROJECT HERO IMAGE (UPLOAD FILE OR PASTE ONLINE URL)
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: 12, color: "#64748b" }}>
                        Upload Local File
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary/10 file:text-primary
                          hover:file:bg-primary/20
                          cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: 12, color: "#64748b" }}>
                        Paste Image URL
                      </label>
                      <input
                        name="image"
                        value={formData.image.startsWith("data:") ? "" : formData.image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/screenshot.jpg"
                        className="glow-input w-full px-4 py-2.5 rounded-xl"
                      />
                    </div>
                  </div>

                  {formData.image && (
                    <div className="mt-2">
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                        Image Preview:
                      </div>
                      <div className="w-full h-36 border border-border rounded-xl overflow-hidden relative">
                        <img
                          src={formData.image}
                          alt="Project preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white w-7 h-7 rounded-full flex items-center justify-center border-0 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Section */}
                <div className="border border-border rounded-xl p-5 bg-card/30 flex flex-col gap-4">
                  <div className="mono" style={{ fontSize: 11, color: "#6366f1" }}>
                    PROJECT DEMO VIDEO (UPLOAD FILE TO INDEXEDDB OR PASTE ONLINE URL)
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: 12, color: "#64748b" }}>
                        Upload Local MP4/WebM File
                      </label>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleVideoUpload}
                        className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary/10 file:text-primary
                          hover:file:bg-primary/20
                          cursor-pointer"
                      />
                      {videoFile && (
                        <span style={{ fontSize: 11, color: "#10b981" }} className="mono">
                          ✓ File selected: {videoFile.name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: 12, color: "#64748b" }}>
                        Paste Video URL / Local Asset Path
                      </label>
                      <input
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleInputChange}
                        placeholder="e.g. /videos/devpulse.mp4 or https://site..."
                        className="glow-input w-full px-4 py-2.5 rounded-xl"
                      />
                    </div>
                  </div>

                  {editingId && (dbVideoStatus[editingId] || videoFile) && (
                    <div className="mt-1 flex items-center justify-between bg-black/20 p-3 rounded-lg border border-border/40">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 12, color: "#10b981" }} className="mono">
                          🎥 Stored video file exists in IndexedDB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDbVideo}
                        className="text-xs text-destructive hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        Remove Uploaded Video File
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="btn-ghost px-5 py-2.5 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2.5 rounded-xl text-sm"
                  >
                    {editingId ? "Save Changes" : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project List */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border bg-card/20 flex items-center justify-between">
            <h3
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              All Projects ({projects.length})
            </h3>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No projects in the database. Click &ldquo;Add New Project&rdquo; to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] mono text-muted-foreground">
                    <th className="p-5 w-16">IMAGE</th>
                    <th className="p-5">TITLE & TAGLINE</th>
                    <th className="p-5">TECH STACK</th>
                    <th className="p-5 w-24 text-center">FEATURED</th>
                    <th className="p-5 w-24 text-center">VIDEO</th>
                    <th className="p-5 w-32 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/60 hover:bg-card/10 transition-colors"
                    >
                      <td className="p-5">
                        <div className="w-12 h-12 rounded-lg bg-input-background border border-border overflow-hidden flex items-center justify-center">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-muted-foreground/45" size={18} />
                          )}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: p.color,
                            }}
                          />
                          {p.title}
                          <span style={{ fontSize: 11, color: "#64748b" }} className="mono">
                            ({p.year})
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {p.tagline}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1.5">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="mono text-[10px]"
                              style={{
                                color: p.color,
                                background: `${p.color}09`,
                                border: `1px solid ${p.color}15`,
                                padding: "1px 6px",
                                borderRadius: 4,
                              }}
                            >
                               {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        {p.featured ? (
                          <span
                            className="mono text-[10px]"
                            style={{
                              color: "#10b981",
                              background: "rgba(16,185,129,0.12)",
                              border: "1px solid rgba(16,185,129,0.25)",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            YES
                          </span>
                        ) : (
                          <span
                            className="mono text-[10px]"
                            style={{
                              color: "#64748b",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.06)",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            NO
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        {dbVideoStatus[p.id] ? (
                          <span
                            className="mono text-[10px]"
                            style={{
                              color: "#10b981",
                              background: "rgba(16,185,129,0.12)",
                              border: "1px solid rgba(16,185,129,0.25)",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            FILE (DB)
                          </span>
                        ) : p.videoUrl ? (
                          <span
                            className="mono text-[10px]"
                            style={{
                              color: "#6366f1",
                              background: "rgba(99,102,241,0.12)",
                              border: "1px solid rgba(99,102,241,0.25)",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            URL LINK
                          </span>
                        ) : (
                          <span
                            className="mono text-[10px]"
                            style={{
                              color: "#64748b",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.06)",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            NONE
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(p)}
                            className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary flex items-center justify-center cursor-pointer transition-colors"
                            title="Edit project"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="w-8 h-8 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive flex items-center justify-center cursor-pointer transition-colors"
                            title="Delete project"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}