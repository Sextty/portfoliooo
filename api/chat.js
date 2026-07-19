/**
 * Serverless proxy for the ChatFlow AI demo.
 *
 * The Groq API key lives ONLY here, server-side, as the GROQ_API_KEY
 * environment variable — it is never sent to the browser or committed to
 * source. The frontend calls POST /api/chat; this function forwards the
 * request to Groq's OpenAI-compatible endpoint and streams the reply back.
 *
 * Guards (a public AI proxy is abusable): a fixed model allow-list, a hard
 * max_tokens cap, capped message size/count, and a best-effort in-memory
 * per-IP rate limit. In-memory limiting is weak on serverless (state resets
 * on cold start and isn't shared across instances) — it's a speed bump, not
 * a wall. For production-grade limiting use a shared store (e.g. Upstash).
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Keep in sync with MODELS in src/pages/Demos/ChatFlowDemo.tsx
const ALLOWED_MODELS = new Set([
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
]);
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const MAX_TOKENS = 1024;
const MAX_MESSAGES = 40;
const MAX_CHARS_PER_MESSAGE = 8000;

// Best-effort in-memory sliding-window rate limit: N requests / window / IP.
const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60_000;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
    }
  }
  return arr.length > RATE_LIMIT;
}

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // No key configured (e.g. a fork without secrets) — the frontend treats
    // this as a signal to fall back to its local simulation.
    return res.status(503).json({ error: "AI is not configured on this deployment." });
  }

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Rate limit reached — give it a minute." });
  }

  // Vercel parses JSON bodies automatically; guard anyway.
  const body = typeof req.body === "object" && req.body ? req.body : {};
  const model = ALLOWED_MODELS.has(body.model) ? body.model : DEFAULT_MODEL;
  const messages = Array.isArray(body.messages) ? body.messages : null;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }
  if (messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: `Too many messages (max ${MAX_MESSAGES}).` });
  }

  const clean = [];
  for (const m of messages) {
    if (!m || typeof m.content !== "string") {
      return res.status(400).json({ error: "Each message needs a string content." });
    }
    const role = m.role === "system" || m.role === "assistant" ? m.role : "user";
    clean.push({ role, content: m.content.slice(0, MAX_CHARS_PER_MESSAGE) });
  }

  let upstream;
  try {
    upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: clean,
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        stream: true,
      }),
    });
  } catch {
    return res.status(502).json({ error: "Could not reach the AI service." });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return res.status(502).json({ error: "AI service error", detail: detail.slice(0, 300) });
  }

  // Stream Groq's SSE straight through to the browser.
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const reader = upstream.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  } catch {
    // Client disconnected or upstream aborted — just end.
  } finally {
    res.end();
  }
}
