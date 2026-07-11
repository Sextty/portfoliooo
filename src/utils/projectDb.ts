export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  image?: string; // Base64 or URL
  runUrl?: string;
  githubUrl?: string;
  featured: boolean;
  color: string;
  year: string;
}

const STORAGE_KEY = "wassim_portfolio_projects_v2";

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "girls-boutique",
    title: "Girls Boutique",
    tagline: "E-Commerce Platform for Fashion & Beauty",
    description: "A full-featured PHP e-commerce boutique for women's fashion, makeup, and accessories. Features product catalog with categories, shopping cart, wishlist, checkout, admin dashboard, and MySQL database.",
    tags: ["PHP", "MySQL", "Tailwind CSS", "JavaScript", "HTML/CSS"],
    featured: true,
    color: "#ec4899",
    year: "2025",
    runUrl: "/girls-boutique",
    githubUrl: "https://github.com/Sextty/girls-boutique"
  },
  {
    id: "devpulse",
    title: "DevPulse",
    tagline: "Developer Analytics Dashboard",
    description: "Real-time engineering metrics platform with CI/CD pipeline insights, team velocity charts, and automated performance reports.",
    tags: ["React", "Python", "FastAPI", "ClickHouse", "D3.js"],
    featured: true,
    color: "#10b981",
    year: "2024",
    runUrl: "https://devpulse.demo",
    githubUrl: "https://github.com/Sextty/devpulse"
  },
  {
    id: "chatflow-ai",
    title: "ChatFlow AI",
    tagline: "Real-Time Messaging with AI",
    description: "Scalable messaging platform with AI-powered smart replies, conversation threading, voice messages, and end-to-end encryption.",
    tags: ["Next.js", "Socket.io", "Redis", "OpenAI", "MongoDB"],
    featured: true,
    color: "#8b5cf6",
    year: "2023",
    runUrl: "https://chatflow.demo",
    githubUrl: "https://github.com/Sextty/chatflow-ai"
  },
  {
    id: "cloudvault",
    title: "CloudVault",
    tagline: "Secure File Storage & Collaboration",
    description: "Team collaboration platform with version-controlled file storage, real-time document editing, and granular permission management.",
    tags: ["React", "NestJS", "AWS S3", "PostgreSQL", "WebSockets"],
    featured: false,
    color: "#f59e0b",
    year: "2023",
    runUrl: "https://cloudvault.demo",
    githubUrl: "https://github.com/Sextty/cloudvault"
  }
];

export function getProjects(): Project[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
    return DEFAULT_PROJECTS;
  }
  try {
    const projects: any[] = JSON.parse(data);
    let changed = false;
    const migrated = projects.map((p) => {
      if (p.liveUrl && !p.runUrl) {
        p.runUrl = p.liveUrl;
        delete p.liveUrl;
        changed = true;
      }
      return p as Project;
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch (e) {
    console.error("Error parsing projects from localStorage", e);
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
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
