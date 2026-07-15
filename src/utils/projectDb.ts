import seedData from "@/data/projects.json";

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  image?: string; // Base64 or URL
  runUrl?: string;
  githubUrl?: string;
  videoUrl?: string; // Path/URL to a demo video — e.g. "/videos/foo.mp4" (baked
                     // into public/ and served to every visitor) or an external URL
  featured: boolean;
  color: string;
  year: string;
}

interface Seed {
  version: number;
  projects: Project[];
}

// The COMMITTED source of truth for what every visitor on every device sees.
// It's baked into the build from src/data/projects.json. To publish a change
// (including a demo video), edit that file — or use the Admin panel's
// "Export for deploy" button — then commit & push so Vercel redeploys.
//
// Bumping `version` in src/data/projects.json forces every browser (including
// yours) to drop its cached copy and reload the freshly-deployed data, so the
// change actually appears instead of a stale localStorage snapshot.
const SEED = seedData as unknown as Seed;
export const DATA_VERSION = SEED.version;

const STORAGE_KEY = "wassim_portfolio_projects";

interface StoredShape {
  version: number;
  projects: Project[];
}

function migrateLegacyUrls(projects: Array<Project & { liveUrl?: string }>): Project[] {
  return projects.map((p) => {
    if (p.liveUrl && !p.runUrl) {
      p.runUrl = p.liveUrl;
      delete p.liveUrl;
    }
    return p as Project;
  });
}

function writeStore(projects: Project[]): void {
  const payload: StoredShape = { version: SEED.version, projects };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

// Load the committed data as the working copy (used on first visit and whenever
// a newer deploy supersedes the cached copy).
function reseedFromCommitted(): Project[] {
  writeStore(SEED.projects);
  return SEED.projects;
}

export function getProjects(): Project[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return reseedFromCommitted();
  try {
    const parsed = JSON.parse(raw);
    // Back-compat: the previous format stored a bare array with no version.
    const stored: StoredShape = Array.isArray(parsed)
      ? { version: 0, projects: parsed }
      : parsed;
    // A newer committed version means the deployed site changed (e.g. a baked-in
    // demo video was added) — discard the stale cache and reseed from the deploy.
    if (!stored.version || stored.version < SEED.version) {
      return reseedFromCommitted();
    }
    return migrateLegacyUrls(stored.projects);
  } catch (e) {
    console.error("Error parsing projects from localStorage", e);
    return SEED.projects;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    writeStore(projects);
  } catch (e) {
    console.error("Failed to save projects to localStorage", e);
    // Most common cause: localStorage quota exceeded (base64 images are heavy).
    alert(
      "Failed to save changes — your browser's storage is full (this usually happens when project images are too large). " +
      "Try a smaller image, or remove an old uploaded image, then save again."
    );
    throw e; // re-throw so callers (handleSubmit) know it failed
  }
}

export function addProject(project: Omit<Project, "id">): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: Math.random().toString(36).substring(2, 11)
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

export function updateProject(id: string, updated: Omit<Project, "id">): boolean {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return false;
  projects[index] = { ...updated, id };
  saveProjects(projects);
  return true;
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  if (filtered.length === projects.length) return false;
  saveProjects(filtered);
  return true;
}