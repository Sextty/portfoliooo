import { Project } from "@/utils/projectDb";

/**
 * Case-study content: the story each product page tells.
 * Everything here is authored per project; getCaseStudy() falls back to a
 * neutral generated story for projects added later via the admin panel.
 */

export interface ArchNode {
  /** Short label, e.g. "FastAPI" */
  label: string;
  /** One-line role, e.g. "Metrics API" */
  sub: string;
}

export interface Architecture {
  client: ArchNode;
  services: ArchNode[];
  stores: ArchNode[];
  /** One sentence under the diagram */
  note?: string;
}

export interface EngineeringDecision {
  title: string;
  body: string;
}

export interface RoadmapItem {
  label: string;
  status: "planned" | "exploring";
}

export interface CaseStudy {
  problem: string;
  solution: string;
  architecture: Architecture;
  decisions: EngineeringDecision[];
  roadmap: RoadmapItem[];
  features: string[];
  codeFileName: string;
  codeSnippet: string;
  setupSteps: string[];
}

const CASE_STUDIES: Record<string, CaseStudy> = {
  "girls-boutique": {
    problem:
      "Small fashion retailers need a real store — catalog, cart, checkout, and a back office — without renting a SaaS platform they can't customize or afford.",
    solution:
      "A complete PHP + MySQL boutique: categorized catalog, cart, wishlist, checkout, and an admin dashboard. On this site it's re-created end to end in your browser, backed by a real SQLite database compiled to WebAssembly — so you can use the whole store without installing anything.",
    architecture: {
      client: { label: "Storefront", sub: "PHP views · Tailwind CSS" },
      services: [{ label: "PHP app", sub: "Catalog · cart · checkout" }],
      stores: [{ label: "MySQL", sub: "Products · orders · users" }],
      note: "The in-browser demo ships the same schema to SQLite via sql.js — a real database, not mocked arrays.",
    },
    decisions: [
      {
        title: "Plain PHP over a framework",
        body: "The store fits in a handful of well-named files. Skipping a framework keeps it deployable on any shared host a small retailer already pays for.",
      },
      {
        title: "Schema first",
        body: "Products, categories, orders, and users were designed as a relational schema with foreign keys up front — so features like the wishlist were new queries, not rewrites.",
      },
      {
        title: "A real database in the demo",
        body: "The live demo runs the same schema on SQLite compiled to WASM. Search, cart totals, and the admin panel all execute real SQL in your browser tab.",
      },
    ],
    roadmap: [
      { label: "Online payment integration", status: "planned" },
      { label: "Product reviews & ratings", status: "planned" },
      { label: "Order-status email notifications", status: "exploring" },
    ],
    features: [
      "Product catalog with categories",
      "Shopping cart & checkout",
      "Wishlist management",
      "Admin dashboard",
      "MySQL database",
      "Responsive design",
    ],
    codeFileName: "schema.sql",
    codeSnippet: `-- Categories, Products, Users, Orders\nCREATE TABLE products (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(150) NOT NULL,\n  price DECIMAL(10,2) NOT NULL,\n  image_url VARCHAR(255) NOT NULL,\n  category_id INT NOT NULL,\n  FOREIGN KEY (category_id) REFERENCES categories(id)\n);`,
    setupSteps: [
      "Install XAMPP or MAMP and start Apache + MySQL",
      "Copy the girls/ folder to htdocs/",
      "Import schema.sql into phpMyAdmin",
      "Edit db.php with your MySQL credentials",
      "Visit http://localhost/girls/ in your browser",
    ],
  },

  devpulse: {
    problem:
      "Engineering teams can inspect individual pipelines, but the shape of their delivery — velocity, deploy frequency, failure trends — stays invisible without stitching tools together by hand.",
    solution:
      "A metrics platform that ingests CI/CD events and turns them into live dashboards: team velocity, pipeline health, and deploy analytics. A React + D3 frontend over a FastAPI backend, with ClickHouse as the event store — the whole stack boots with one docker-compose command.",
    architecture: {
      client: { label: "React + D3.js", sub: "Custom dashboards" },
      services: [{ label: "FastAPI", sub: "Metrics API · Python" }],
      stores: [{ label: "ClickHouse", sub: "Columnar event store" }],
      note: "Events are append-only; every chart is an aggregation query.",
    },
    decisions: [
      {
        title: "ClickHouse over Postgres",
        body: "Pipeline analytics is append-heavy and aggregation-heavy. A columnar store keeps dashboard queries fast as the event volume grows — no pre-computed rollup tables to maintain.",
      },
      {
        title: "D3 over a chart library",
        body: "Velocity streams and pipeline timelines aren't stock chart shapes. Owning the rendering with D3 costs more up front and buys exactly the visualization the data needs.",
      },
      {
        title: "One-command environment",
        body: "docker-compose brings up the frontend, API, and event store with seeded data — the barrier to trying the product is a single command.",
      },
    ],
    roadmap: [
      { label: "GitHub webhook ingestion", status: "planned" },
      { label: "Alerting on trend regressions", status: "exploring" },
      { label: "Cross-team benchmarks", status: "planned" },
    ],
    features: [
      "Real-time engineering metrics",
      "CI/CD pipeline insights",
      "Team velocity charts",
      "Automated performance reports",
      "ClickHouse high-performance queries",
      "Interactive D3.js visualizations",
    ],
    codeFileName: "analytics.py",
    codeSnippet: `# Fetch velocity metrics from ClickHouse\ndef get_velocity(team_id: str):\n    query = f"SELECT count() as velocity, date FROM cicd_pipelines WHERE team_id = '{team_id}' GROUP BY date"\n    return db.execute(query)`,
    setupSteps: [
      "Install Python 3.10+",
      "Install dependencies: pip install fastapi uvicorn clickhouse-driver",
      "Configure your .env with ClickHouse credentials",
      "Start backend server: uvicorn main:app --reload",
      "Run frontend development server: npm run dev",
    ],
  },

  "chatflow-ai": {
    problem:
      "Real-time chat is easy to demo and hard to run: presence, typing, and history have to stay consistent across nodes — and users now expect AI assistance inline.",
    solution:
      "A messaging platform with instant delivery, typing indicators, and presence over Socket.io; MongoDB for history; a Redis adapter so delivery scales horizontally; and OpenAI-powered smart replies that degrade gracefully when no key is configured.",
    architecture: {
      client: { label: "Next.js", sub: "Chat client" },
      services: [{ label: "Socket.io gateway", sub: "Delivery · presence" }],
      stores: [
        { label: "Redis", sub: "Pub/sub fan-out" },
        { label: "MongoDB", sub: "Message history" },
        { label: "OpenAI", sub: "Smart replies" },
      ],
      note: "Any node can serve any room — Redis pub/sub carries events between instances.",
    },
    decisions: [
      {
        title: "Redis adapter from day one",
        body: "Sockets pinned to a single node don't scale. Routing events through Redis pub/sub means any instance can serve any room, so adding capacity is just adding nodes.",
      },
      {
        title: "AI that degrades gracefully",
        body: "Smart replies call OpenAI when a key is configured and fall back to a local heuristic when it isn't — the product demos fully offline and never blocks on a third party.",
      },
      {
        title: "History as documents",
        body: "Messages map naturally to MongoDB documents; per-room pagination is one indexed query, and the schema evolves without migrations.",
      },
    ],
    roadmap: [
      { label: "Read receipts", status: "planned" },
      { label: "File attachments", status: "planned" },
      { label: "Mobile app shell", status: "exploring" },
    ],
    features: [
      "Real-time message synchronization",
      "AI-powered smart replies",
      "Conversation threading",
      "Voice messages",
      "End-to-end encryption",
      "MongoDB database integrations",
    ],
    codeFileName: "server.js",
    codeSnippet: `// Socket.io connection for real-time messaging\nio.on('connection', (socket) => {\n  socket.on('message', async (data) => {\n    const response = await ai.generateSmartReply(data.text);\n    io.emit('reply', { text: response, to: data.sender });\n  });\n});`,
    setupSteps: [
      "Install Node.js (v18+)",
      "Run npm install to install dependencies",
      "Set up MongoDB & Redis instances",
      "Configure your OpenAI API key in .env",
      "Start application server: npm run dev",
    ],
  },

  cloudvault: {
    problem:
      "Teams outgrow files-in-chat fast: they need shared storage with permissions, version history, and visibility into what changed — without losing the immediacy of a shared folder.",
    solution:
      "Team file storage on S3-compatible object storage with versioned metadata, granular permissions, and a live activity feed. A React frontend over a NestJS API, PostgreSQL for truth about files, MinIO/S3 for the files themselves, and WebSockets keeping every collaborator's view current.",
    architecture: {
      client: { label: "React", sub: "Files · activity feed" },
      services: [{ label: "NestJS API", sub: "Auth · permissions · uploads" }],
      stores: [
        { label: "PostgreSQL", sub: "Metadata · versions" },
        { label: "MinIO / S3", sub: "Object storage" },
      ],
      note: "Changes push to every open client over WebSockets — nobody refreshes.",
    },
    decisions: [
      {
        title: "Split metadata from objects",
        body: "Files live in object storage; the truth about them — versions, permissions, activity — lives in Postgres. Each layer does the thing it's best at.",
      },
      {
        title: "S3-compatible from the start",
        body: "MinIO in development, real S3 in production, one code path. The storage backend is a config value, not an architecture decision deferred.",
      },
      {
        title: "Push, don't poll",
        body: "The activity feed is pushed over WebSockets. Every collaborator sees uploads and permission changes the moment they happen.",
      },
    ],
    roadmap: [
      { label: "Expiring share links", status: "planned" },
      { label: "Full-text search inside documents", status: "exploring" },
      { label: "Per-folder storage quotas", status: "planned" },
    ],
    features: [
      "Secure file uploads (AWS S3)",
      "Real-time document editing",
      "Granular permission management",
      "Version control history",
      "WebSockets notifications",
      "Database security roles",
    ],
    codeFileName: "s3.service.ts",
    codeSnippet: `// Upload file stream to AWS S3\nasync uploadFile(file: Express.Multer.File, userId: string) {\n  return this.s3.upload({\n    Bucket: process.env.AWS_BUCKET,\n    Key: \`users/\${userId}/\${file.originalname}\`,\n    Body: file.buffer,\n  }).promise();\n}`,
    setupSteps: [
      "Install Node.js & PostgreSQL",
      "Run npm install inside project folder",
      "Configure AWS credentials & S3 Bucket in .env",
      "Run prisma db push or migration",
      "Start NestJS API server: npm run start:dev",
    ],
  },

  taskforge: {
    problem:
      "Most board tools are heavier than the workflow they manage. Teams want drag-and-drop that feels instant and an API simple enough to extend.",
    solution:
      "A kanban board with native HTML5 drag-and-drop and optimistic UI — a card moves the moment you drop it. Behind it, an Express + Prisma API over PostgreSQL that auto-seeds a sample board on first boot.",
    architecture: {
      client: { label: "React", sub: "Board · native DnD" },
      services: [{ label: "Express + Prisma", sub: "Boards API" }],
      stores: [{ label: "PostgreSQL", sub: "Columns · cards · positions" }],
      note: "Card ordering updates in a single transaction — no phantom positions.",
    },
    decisions: [
      {
        title: "Native drag-and-drop",
        body: "HTML5 drag events instead of a DnD library keep the bundle small and the core interaction dependency-free — the browser already knows how to drag.",
      },
      {
        title: "Optimistic UI",
        body: "The card moves instantly and the API confirms after; on failure the move rolls back. Latency never sits between the user and the board.",
      },
      {
        title: "The schema is the contract",
        body: "Columns, cards, and positions are one relational model in Prisma. Reordering is positional indexes updated in one transaction, so the board can't desync.",
      },
    ],
    roadmap: [
      { label: "Multi-board workspaces", status: "planned" },
      { label: "Card comments & mentions", status: "planned" },
      { label: "Keyboard-first navigation", status: "exploring" },
    ],
    features: [
      "Fully responsive layout across all device screens",
      "Drag-and-drop across lanes with optimistic UI",
      "Colored cards and per-column organization",
      "Auto-seeded sample board on first boot",
    ],
    codeFileName: "board.ts",
    codeSnippet: `// Reorder a card within one transaction\nawait prisma.$transaction([\n  prisma.card.update({\n    where: { id: cardId },\n    data: { columnId: to, position },\n  }),\n  prisma.card.updateMany({\n    where: { columnId: to, position: { gte: position } },\n    data: { position: { increment: 1 } },\n  }),\n]);`,
    setupSteps: [
      "Clone the repository from GitHub",
      "Run npm install in server/ and client/",
      "Start PostgreSQL (or docker-compose up)",
      "Run prisma migrate dev to create the schema",
      "Start the API and the Vite dev server",
    ],
  },

  snapnote: {
    problem:
      "Note apps drift into bloat. Writing tools should stay out of the way: markdown in, instant search out, zero friction between capture and recall.",
    solution:
      "A fast markdown notes app with live preview, tags, pinning, and search across titles, content, and tags — built as one full-stack Next.js App Router codebase with Prisma and PostgreSQL.",
    architecture: {
      client: { label: "Next.js", sub: "App Router · live preview" },
      services: [{ label: "Server components", sub: "Rendering · actions" }],
      stores: [{ label: "PostgreSQL", sub: "Notes · tags (via Prisma)" }],
      note: "First paint carries real content — the notes list renders on the server.",
    },
    decisions: [
      {
        title: "Server components for the list",
        body: "The notes list renders on the server, so the first paint is content, not a spinner. Interactivity hydrates only where it's needed — the editor.",
      },
      {
        title: "Search stays in SQL",
        body: "Case-insensitive search across titles, content, and tags is one indexed query. No search service until the data actually demands one.",
      },
      {
        title: "Markdown is the storage format",
        body: "The source of truth is portable plain text. The preview is derived at render time and never stored, so notes can't rot into a proprietary format.",
      },
    ],
    roadmap: [
      { label: "Note links & backlinks", status: "planned" },
      { label: "Public sharing pages", status: "planned" },
      { label: "Offline-first editing", status: "exploring" },
    ],
    features: [
      "Markdown editing with live preview",
      "Tags, pinning, and quick filters",
      "Search across titles, content, and tags",
      "Full-stack Next.js App Router codebase",
    ],
    codeFileName: "search.ts",
    codeSnippet: `// One indexed query covers titles, content, and tags\nreturn prisma.note.findMany({\n  where: {\n    OR: [\n      { title: { contains: q, mode: "insensitive" } },\n      { content: { contains: q, mode: "insensitive" } },\n      { tags: { some: { name: { contains: q, mode: "insensitive" } } } },\n    ],\n  },\n  orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],\n});`,
    setupSteps: [
      "Clone the repository from GitHub",
      "Run npm install",
      "Start PostgreSQL (or docker-compose up)",
      "Run prisma migrate dev",
      "Start the dev server: npm run dev",
    ],
  },

  fittrack: {
    problem:
      "Workout logs die in note apps. Consistency needs visible momentum — streaks, weekly volume, and trends that update the moment you log a set.",
    solution:
      "Log workouts and watch weekly training volume, daily streaks, and activity breakdowns update as you go. React + Recharts on the front, an Express API over MongoDB behind it, seeded with sample history so the charts mean something on first open.",
    architecture: {
      client: { label: "React + Recharts", sub: "Volume · streaks · trends" },
      services: [{ label: "Express API", sub: "Workouts · stats" }],
      stores: [{ label: "MongoDB", sub: "Logs · aggregations" }],
      note: "Weekly volume and breakdowns are MongoDB aggregation pipelines, not client-side math.",
    },
    decisions: [
      {
        title: "The chart is the product",
        body: "Every logged set immediately re-renders volume and streaks. The feedback loop — see the bar grow — is the retention mechanic, so it had to be instant.",
      },
      {
        title: "Aggregate in the database",
        body: "Weekly volume, streaks, and breakdowns are MongoDB aggregation pipelines. The client renders results; it doesn't compute them.",
      },
      {
        title: "Seeded history",
        body: "The demo boots with weeks of realistic data, because an empty fitness tracker convinces nobody. Empty states matter; so do full ones.",
      },
    ],
    roadmap: [
      { label: "Exercise library with PR tracking", status: "planned" },
      { label: "Goal reminders & nudges", status: "exploring" },
      { label: "CSV export", status: "planned" },
    ],
    features: [
      "Workout logging with instant chart updates",
      "Weekly volume and daily streaks",
      "Activity breakdowns by exercise type",
      "Seeded sample history",
    ],
    codeFileName: "stats.js",
    codeSnippet: `// Weekly volume via aggregation pipeline\nconst volume = await Workout.aggregate([\n  { $match: { userId } },\n  { $group: {\n      _id: { $week: "$date" },\n      total: { $sum: "$volume" },\n    } },\n  { $sort: { _id: 1 } },\n]);`,
    setupSteps: [
      "Clone the repository from GitHub",
      "Run npm install in server/ and client/",
      "Start MongoDB (or docker-compose up)",
      "Start the Express API: npm run dev",
      "Start the React dev server",
    ],
  },

  pollwave: {
    problem:
      "Live audiences answer in seconds or not at all. A poll is only worth running if every screen shows the same result at the same moment.",
    solution:
      "Create a poll, share it, and watch votes stream in live across every open browser — native WebSockets for delivery, Redis pub/sub to fan results out across server instances, PostgreSQL so results survive restarts.",
    architecture: {
      client: { label: "Next.js", sub: "Polls · live results" },
      services: [{ label: "WebSocket server", sub: "Subscribe · vote · broadcast" }],
      stores: [
        { label: "Redis", sub: "Pub/sub fan-out" },
        { label: "PostgreSQL", sub: "Votes · persistence" },
      ],
      note: "Redis moves messages; Postgres holds the truth.",
    },
    decisions: [
      {
        title: "Native WebSockets, no wrapper",
        body: "The protocol is three messages: subscribe, vote, results. At that size a library is indirection — the platform primitive is enough.",
      },
      {
        title: "Redis pub/sub for scale-out",
        body: "Any server instance broadcasts results to all subscribers through Redis, so horizontal scaling is deployment configuration, not a rewrite.",
      },
      {
        title: "Persistence is separate from delivery",
        body: "Votes are written to Postgres before they're broadcast. Live delivery can hiccup; the count never can.",
      },
    ],
    roadmap: [
      { label: "QR-code join flow", status: "planned" },
      { label: "Multiple question types", status: "planned" },
      { label: "Result exports", status: "exploring" },
    ],
    features: [
      "Live results across every open browser",
      "Native WebSocket delivery",
      "Redis pub/sub horizontal fan-out",
      "PostgreSQL persistence",
    ],
    codeFileName: "live.ts",
    codeSnippet: `// Broadcast results to every instance's subscribers\nsub.subscribe("poll:results");\nsub.on("message", (_ch, payload) => {\n  const { pollId, results } = JSON.parse(payload);\n  for (const ws of rooms.get(pollId) ?? []) {\n    ws.send(JSON.stringify({ type: "results", results }));\n  }\n});`,
    setupSteps: [
      "Clone the repository from GitHub",
      "Run npm install",
      "Start PostgreSQL and Redis (or docker-compose up)",
      "Run the database migrations",
      "Start the dev server: npm run dev",
    ],
  },
};

/** Neutral generated story for projects added later via the admin panel. */
function fallbackCaseStudy(project: Project): CaseStudy {
  const [frontTag, ...restTags] = project.tags;
  return {
    problem: `${project.tagline} — built to solve a real workflow end to end, not to sit in a repo as a half-finished experiment.`,
    solution: project.description,
    architecture: {
      client: { label: frontTag || "Client", sub: "User interface" },
      services: [{ label: restTags[0] || "API", sub: "Application logic" }],
      stores: [{ label: restTags[1] || "Database", sub: "Persistence" }],
    },
    decisions: [
      {
        title: "Own the whole build",
        body: "Frontend, API, and data layer are designed together, so features land as one coherent change instead of three coordinated ones.",
      },
      {
        title: "Boring technology where it counts",
        body: "Proven tools for the foundation, novelty only where it earns its place — the product stays maintainable a year later.",
      },
    ],
    roadmap: [
      { label: "Expanded feature set", status: "planned" },
      { label: "Deployment hardening", status: "exploring" },
    ],
    features: [
      "Fully responsive layout across all device screens",
      "Interactive user interface with smooth transitions",
      "Optimized page load speeds and performance",
      "Clean, scalable, and modular codebase structure",
    ],
    codeFileName: "App.tsx",
    codeSnippet: `// Main entry point for ${project.title}\nimport React from "react";\n\nexport default function Main() {\n  return (\n    <div className="container">\n      <h1>Welcome to ${project.title}!</h1>\n      <p>Custom project description and layout.</p>\n    </div>\n  );\n}`,
    setupSteps: [
      "Clone the repository from GitHub",
      "Install project dependencies using npm install",
      "Create a .env file and set up configuration keys",
      "Start the development server using npm run dev",
      "Open http://localhost:5173/ in your browser",
    ],
  };
}

export function getCaseStudy(project: Project): CaseStudy {
  return CASE_STUDIES[project.id] ?? fallbackCaseStudy(project);
}
