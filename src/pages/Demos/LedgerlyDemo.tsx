import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  FileBarChart,
  Settings,
  Bell,
  ArrowLeft,
  Github,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronDown,
  X,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   LEDGERLY — Finance analytics for growing teams
   Dark, corporate, blue. Stripe/Mercury-inspired but original:
   own full app chrome, deterministic seeded ledger, real CSV
   export, every "insight" computed live from the seeded data.
   ═══════════════════════════════════════════════════════════ */

const C = {
  bg: "#05070d",
  panel: "#0d1220",
  panelAlt: "#10162a",
  border: "#1c2338",
  borderStrong: "#2a3252",
  text: "#eef1fb",
  muted: "#7c85a8",
  mutedFaint: "#4b5273",
  blue: "#3b82f6",
  blueBright: "#60a5fa",
  green: "#22c55e",
  red: "#f87171",
  amber: "#fbbf24",
};

const CATEGORY_COLORS: Record<string, string> = {
  Software: "#3b82f6",
  Rent: "#f87171",
  Groceries: "#22c55e",
  Transport: "#fbbf24",
  Entertainment: "#a78bfa",
  Income: "#34d399",
  Utilities: "#60a5fa",
  Health: "#f472b6",
  Travel: "#fb923c",
  Dining: "#38bdf8",
};
const CATEGORIES = Object.keys(CATEGORY_COLORS).filter((c) => c !== "Income");

interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit";
  balance: number;
  last4: string;
  color: string;
}
interface Txn {
  id: string;
  date: string; // ISO
  description: string;
  merchant: string;
  category: string;
  amount: number; // negative = expense
  accountId: string;
}
interface Budget {
  category: string;
  limit: number;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACCOUNTS: Account[] = [
  { id: "chk", name: "Operating Checking", type: "checking", balance: 48210.32, last4: "4821", color: C.blue },
  { id: "sav", name: "Reserve Savings", type: "savings", balance: 122500, last4: "9013", color: C.green },
  { id: "crd", name: "Corporate Card", type: "credit", balance: -6420.55, last4: "2277", color: C.amber },
];

const MERCHANTS: Record<string, string[]> = {
  Software: ["Vercel", "Figma", "Linear", "GitHub", "Notion", "Datadog"],
  Rent: ["WeWork Downtown"],
  Groceries: ["Whole Foods", "Trader Joe's", "Local Market"],
  Transport: ["Uber", "Lyft", "Shell Gas"],
  Entertainment: ["Spotify", "Netflix", "Steam"],
  Income: ["Client Invoice — Acme Co", "Client Invoice — Nova Inc", "Stripe Payout"],
  Utilities: ["Comcast", "PG&E", "AT&T"],
  Health: ["CVS Pharmacy", "Kaiser Permanente"],
  Travel: ["United Airlines", "Marriott", "Airbnb"],
  Dining: ["Blue Bottle Coffee", "Chipotle", "The Grove Bistro"],
};

function seedTransactions(): Txn[] {
  const rng = mulberry32(7);
  const out: Txn[] = [];
  const today = new Date();
  let id = 1;
  for (let d = 0; d < 90; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const txnsToday = rng() < 0.62 ? 1 + Math.floor(rng() * 2) : 0;
    for (let i = 0; i < txnsToday; i++) {
      const isIncome = rng() < 0.06;
      const category = isIncome ? "Income" : CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
      const merchants = MERCHANTS[category];
      const merchant = merchants[Math.floor(rng() * merchants.length)];
      const base =
        category === "Income"
          ? 2400 + rng() * 6200
          : category === "Rent"
            ? 3200
            : category === "Software"
              ? 15 + rng() * 180
              : category === "Travel"
                ? 90 + rng() * 640
                : 8 + rng() * 140;
      out.push({
        id: `tx${id++}`,
        date: date.toISOString().slice(0, 10),
        description: merchant,
        merchant,
        category,
        amount: isIncome ? Math.round(base * 100) / 100 : -Math.round(base * 100) / 100,
        accountId: category === "Rent" || category === "Income" ? "chk" : rng() < 0.7 ? "crd" : "chk",
      });
    }
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

const DEFAULT_BUDGETS: Budget[] = [
  { category: "Software", limit: 900 },
  { category: "Rent", limit: 3200 },
  { category: "Groceries", limit: 500 },
  { category: "Transport", limit: 250 },
  { category: "Entertainment", limit: 150 },
  { category: "Dining", limit: 400 },
];

function monthKey(iso: string) {
  return iso.slice(0, 7);
}
function fmt(n: number, currency = "USD") {
  const sym: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };
  const s = sym[currency] || "$";
  const abs = Math.abs(n);
  return `${n < 0 ? "-" : ""}${s}${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type View = "dashboard" | "transactions" | "budgets" | "reports" | "settings";

export default function LedgerlyDemo() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [txns] = useState<Txn[]>(seedTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP">("USD");
  const [notifOpen, setNotifOpen] = useState(false);

  if (!authed) return <LedgerlyAuth onEnter={() => setAuthed(true)} />;

  const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
    { id: "budgets", label: "Budgets", icon: Wallet },
    { id: "reports", label: "Reports", icon: FileBarChart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", display: "flex" }}>
      <aside style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${C.border}`, padding: "20px 14px", display: "flex", flexDirection: "column" }} className="ledgerly-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 8px 22px" }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: C.blue, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, color: "white" }}>L</div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>Ledgerly</span>
        </div>
        {navItems.map((n) => {
          const Icon = n.icon;
          const active = view === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: active ? C.panelAlt : "transparent",
                color: active ? C.text : C.muted,
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                borderLeft: active ? `2px solid ${C.blue}` : "2px solid transparent",
                marginBottom: 2,
              }}
            >
              <Icon size={15} />
              {n.label}
            </button>
          );
        })}
        <div style={{ marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <Link to="/projects" style={{ display: "flex", alignItems: "center", gap: 8, color: C.mutedFaint, textDecoration: "none", fontSize: 12.5, padding: "6px 8px" }}>
            <ArrowLeft size={13} /> Back to portfolio
          </Link>
          <a href="https://github.com/Sextty/Ledgerly" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: C.mutedFaint, textDecoration: "none", fontSize: 12.5, padding: "6px 8px" }}>
            <Github size={13} /> Source
          </a>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ height: 56, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 14.5, textTransform: "capitalize" }}>{view}</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", color: C.blueBright, border: `1px solid ${C.blueBright}55`, borderRadius: 999, padding: "2px 9px" }}>LIVE DEMO</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, width: 32, height: 32, display: "grid", placeItems: "center", cursor: "pointer", color: C.muted, position: "relative" }}>
                <Bell size={14} />
                <span style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: C.red }} />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    style={{ position: "absolute", top: 40, right: 0, width: 290, background: C.panelAlt, border: `1px solid ${C.borderStrong}`, borderRadius: 12, padding: 10, zIndex: 50, boxShadow: "0 24px 50px -18px rgba(0,0,0,0.7)" }}
                  >
                    {["Corporate Card bill due in 3 days", "Unusual transaction: $640 at United Airlines", "Reserve Savings crossed $120k"].map((t) => (
                      <div key={t} style={{ padding: "9px 8px", fontSize: 12.5, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{t}</div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.blue, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, color: "white" }}>WJ</div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "24px 26px 60px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {view === "dashboard" && <DashboardView txns={txns} currency={currency} onSeeAll={() => setView("transactions")} />}
              {view === "transactions" && <TransactionsView txns={txns} currency={currency} />}
              {view === "budgets" && <BudgetsView txns={txns} budgets={budgets} setBudgets={setBudgets} currency={currency} />}
              {view === "reports" && <ReportsView txns={txns} currency={currency} />}
              {view === "settings" && <SettingsView currency={currency} setCurrency={setCurrency} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <style>{`@media (max-width: 820px) { .ledgerly-sidebar { display: none; } }`}</style>
    </div>
  );
}

function LedgerlyAuth({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 24px" }}>
        <Link to="/projects" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.muted, textDecoration: "none", fontSize: 13.5 }}>
          <ArrowLeft size={15} /> Portfolio
        </Link>
      </div>
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 20 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: "min(400px, 92vw)", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 36, textAlign: "center" }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: C.blue, display: "grid", placeItems: "center", margin: "0 auto 18px", fontWeight: 800, fontSize: 20, color: "white" }}>L</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Ledgerly</h1>
          <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.6, margin: "0 0 26px" }}>
            Finance analytics for growing teams — accounts, transactions, budgets, and AI spending insights in one dashboard.
          </p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onEnter} style={{ width: "100%", padding: "13px 0", border: "none", borderRadius: 10, background: C.blue, color: "white", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}>
            Sign in to demo workspace
          </motion.button>
          <p style={{ color: C.mutedFaint, fontSize: 11.5, marginTop: 16 }}>90 days of seeded ledger data — nothing real, fully interactive.</p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────── */
function DashboardView({ txns, currency, onSeeAll }: { txns: Txn[]; currency: "USD" | "EUR" | "GBP"; onSeeAll: () => void }) {
  const netWorth = ACCOUNTS.reduce((s, a) => s + a.balance, 0);

  const monthly = useMemo(() => {
    const map = new Map<string, { income: number; spend: number }>();
    txns.forEach((t) => {
      const k = monthKey(t.date);
      const e = map.get(k) || { income: 0, spend: 0 };
      if (t.amount > 0) e.income += t.amount;
      else e.spend += -t.amount;
      map.set(k, e);
    });
    return [...map.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).slice(-4);
  }, [txns]);

  const insights = useMemo(() => {
    const thisMonth = monthKey(new Date().toISOString());
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = monthKey(lastMonthDate.toISOString());
    const byCat = (month: string) => {
      const m = new Map<string, number>();
      txns.filter((t) => monthKey(t.date) === month && t.amount < 0).forEach((t) => m.set(t.category, (m.get(t.category) || 0) - t.amount));
      return m;
    };
    const cur = byCat(thisMonth);
    const prev = byCat(lastMonth);
    const deltas = [...cur.entries()]
      .map(([cat, amt]) => {
        const p = prev.get(cat) || 0;
        const pct = p > 0 ? Math.round(((amt - p) / p) * 100) : 100;
        return { cat, amt, pct };
      })
      .filter((d) => Number.isFinite(d.pct))
      .sort((a, b) => b.pct - a.pct);
    const biggest = [...txns].filter((t) => t.amount < 0).sort((a, b) => a.amount - b.amount)[0];
    return { topIncrease: deltas[0], biggest };
  }, [txns]);

  const maxMonthly = Math.max(1, ...monthly.flatMap((m) => [m[1].income, m[1].spend]));
  const recent = txns.slice(0, 6);

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 22 }}>
        {ACCOUNTS.map((a) => (
          <div key={a.id} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color }} />
              <span style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{a.type} •••• {a.last4}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{fmt(a.balance, currency)}</div>
            <div style={{ fontSize: 12.5, color: C.mutedFaint, marginTop: 3 }}>{a.name}</div>
          </div>
        ))}
      </div>

      <div style={{ background: `linear-gradient(135deg, ${C.blue}18, transparent)`, border: `1px solid ${C.blue}33`, borderRadius: 14, padding: "16px 20px", marginBottom: 22 }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 3 }}>Net worth</div>
        <div style={{ fontSize: 30, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{fmt(netWorth, currency)}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 18 }} className="ledgerly-grid">
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 16px" }}>Income vs. spend — last 4 months</h2>
          <svg viewBox="0 0 400 180" style={{ width: "100%", height: "auto" }}>
            {monthly.map(([key, v], i) => {
              const gw = 400 / monthly.length;
              const x = i * gw + 14;
              const bw = (gw - 34) / 2;
              const hi = (v.income / maxMonthly) * 140;
              const hs = (v.spend / maxMonthly) * 140;
              return (
                <g key={key}>
                  <rect x={x} y={150 - hi} width={bw} height={hi} rx={2} fill={C.green} />
                  <rect x={x + bw + 4} y={150 - hs} width={bw} height={hs} rx={2} fill={C.red} />
                  <text x={x + bw} y={168} textAnchor="middle" fontSize={10} fill={C.mutedFaint}>
                    {new Date(`${key}-15`).toLocaleDateString("en-US", { month: "short" })}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: "flex", gap: 16, fontSize: 11.5, color: C.muted, marginTop: 4 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, background: C.green, borderRadius: 2 }} /> Income</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, background: C.red, borderRadius: 2 }} /> Spend</span>
          </div>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={14} color={C.blueBright} /> AI spending insights
          </h2>
          {insights.topIncrease && (
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.muted, padding: "10px 12px", background: C.panelAlt, borderRadius: 10 }}>
              {insights.topIncrease.pct >= 0 ? (
                <>You spent <b style={{ color: C.text }}>{insights.topIncrease.pct}% more</b> on <b style={{ color: C.text }}>{insights.topIncrease.cat}</b> this month vs. last.</>
              ) : (
                <>You spent <b style={{ color: C.green }}>{Math.abs(insights.topIncrease.pct)}% less</b> on <b style={{ color: C.text }}>{insights.topIncrease.cat}</b> this month. Nice.</>
              )}
            </div>
          )}
          {insights.biggest && (
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.muted, padding: "10px 12px", background: C.panelAlt, borderRadius: 10 }}>
              Your largest transaction this quarter: <b style={{ color: C.text }}>{fmt(insights.biggest.amount, currency)}</b> at <b style={{ color: C.text }}>{insights.biggest.merchant}</b>.
            </div>
          )}
          <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.muted, padding: "10px 12px", background: C.panelAlt, borderRadius: 10 }}>
            Recommended: set a budget for <b style={{ color: C.text }}>Travel</b> — it has none yet and shows the most month-to-month swing.
          </div>
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>Recent transactions</h2>
          <button onClick={onSeeAll} style={{ background: "none", border: "none", color: C.blueBright, fontSize: 12.5, cursor: "pointer" }}>See all →</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {recent.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORY_COLORS[t.category], flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t.merchant}</span>
              <span style={{ color: C.mutedFaint, fontSize: 12 }}>{t.category}</span>
              <span style={{ color: C.mutedFaint, fontSize: 12, width: 84 }}>{t.date}</span>
              <span style={{ fontWeight: 600, color: t.amount > 0 ? C.green : C.text, fontVariantNumeric: "tabular-nums", width: 96, textAlign: "right" }}>{fmt(t.amount, currency)}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 820px) { .ledgerly-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* ─── Transactions ───────────────────────────────────────── */
function TransactionsView({ txns, currency }: { txns: Txn[]; currency: "USD" | "EUR" | "GBP" }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sortKey, setSortKey] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    let list = txns.filter((t) => (category === "all" || t.category === category) && (!q.trim() || t.merchant.toLowerCase().includes(q.trim().toLowerCase())));
    list = [...list].sort((a, b) => {
      if (sortKey === "date") return sortDir * (a.date < b.date ? -1 : 1);
      return sortDir * (a.amount - b.amount);
    });
    return list;
  }, [txns, q, category, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => setPage(1), [q, category, sortKey, sortDir]);

  const exportCsv = () => {
    const header = "Date,Merchant,Category,Amount,Account\n";
    const rows = filtered.map((t) => `${t.date},"${t.merchant}",${t.category},${t.amount},${t.accountId}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ledgerly-transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const th = (label: string, key: "date" | "amount") => (
    <th
      onClick={() => {
        if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
        else {
          setSortKey(key);
          setSortDir(-1);
        }
      }}
      style={{ textAlign: key === "amount" ? "right" : "left", padding: "10px 12px", fontSize: 11.5, color: C.muted, fontWeight: 600, cursor: "pointer", userSelect: "none" }}
    >
      {label} {sortKey === key ? (sortDir === 1 ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div style={{ maxWidth: 1080 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.mutedFaint }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search merchant…" style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 34px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.panel, color: C.text, fontSize: 13 }} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "9px 12px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.panel, color: C.text, fontSize: 13 }}>
          <option value="all">All categories</option>
          {[...CATEGORIES, "Income"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button onClick={exportCsv} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.panel, color: C.text, cursor: "pointer", fontSize: 13 }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {th("Date", "date")}
                <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11.5, color: C.muted }}>Merchant</th>
                <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11.5, color: C.muted }}>Category</th>
                {th("Amount", "amount")}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((t) => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: C.muted }}>{t.date}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{t.merchant}</td>
                  <td style={{ padding: "10px 12px", fontSize: 12.5 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: CATEGORY_COLORS[t.category] }} />
                      {t.category}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, textAlign: "right", color: t.amount > 0 ? C.green : C.text, fontVariantNumeric: "tabular-nums" }}>{fmt(t.amount, currency)}</td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "30px 12px", textAlign: "center", color: C.mutedFaint, fontSize: 13 }}>No transactions match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 12, color: C.mutedFaint }}>{filtered.length} transaction{filtered.length === 1 ? "" : "s"}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: page === 1 ? C.mutedFaint : C.text, cursor: page === 1 ? "default" : "pointer", fontSize: 12.5 }}>Prev</button>
            <span style={{ fontSize: 12.5, color: C.muted, padding: "5px 4px" }}>{page} / {pageCount}</span>
            <button disabled={page === pageCount} onClick={() => setPage((p) => p + 1)} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: page === pageCount ? C.mutedFaint : C.text, cursor: page === pageCount ? "default" : "pointer", fontSize: 12.5 }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Budgets ────────────────────────────────────────────── */
function BudgetsView({ txns, budgets, setBudgets, currency }: { txns: Txn[]; budgets: Budget[]; setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>; currency: "USD" | "EUR" | "GBP" }) {
  const thisMonth = monthKey(new Date().toISOString());
  const spentByCategory = useMemo(() => {
    const m = new Map<string, number>();
    txns.filter((t) => monthKey(t.date) === thisMonth && t.amount < 0).forEach((t) => m.set(t.category, (m.get(t.category) || 0) - t.amount));
    return m;
  }, [txns, thisMonth]);

  return (
    <div style={{ maxWidth: 900 }}>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 18 }}>Monthly budgets by category — this month's spend so far.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
        {budgets.map((b) => {
          const spent = spentByCategory.get(b.category) || 0;
          const pct = Math.min((spent / b.limit) * 100, 100);
          const over = spent > b.limit;
          const color = over ? C.red : pct > 80 ? C.amber : C.green;
          return (
            <div key={b.category} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORY_COLORS[b.category] }} />
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{b.category}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.muted, marginBottom: 6 }}>
                <span style={{ color: over ? C.red : C.text, fontWeight: 600 }}>{fmt(spent, currency)}</span>
                <span>
                  of{" "}
                  <input
                    type="number"
                    value={b.limit}
                    onChange={(e) => setBudgets((prev) => prev.map((x) => (x.category === b.category ? { ...x, limit: Number(e.target.value) || 0 } : x)))}
                    style={{ width: 60, background: "transparent", border: "none", borderBottom: `1px dashed ${C.border}`, color: C.text, fontSize: 12.5, textAlign: "right" }}
                  />
                </span>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: C.panelAlt, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.4s ease" }} />
              </div>
              {over && <div style={{ fontSize: 11, color: C.red, marginTop: 6 }}>Over budget by {fmt(spent - b.limit, currency)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Reports ────────────────────────────────────────────── */
function ReportsView({ txns, currency }: { txns: Txn[]; currency: "USD" | "EUR" | "GBP" }) {
  const months = useMemo(() => [...new Set(txns.map((t) => monthKey(t.date)))].sort().reverse(), [txns]);
  const [month, setMonth] = useState(months[0]);

  const data = useMemo(() => {
    const list = txns.filter((t) => monthKey(t.date) === month);
    const income = list.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const spend = list.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
    const byCat = new Map<string, number>();
    list.filter((t) => t.amount < 0).forEach((t) => byCat.set(t.category, (byCat.get(t.category) || 0) - t.amount));
    const top = [...list].filter((t) => t.amount < 0).sort((a, b) => a.amount - b.amount).slice(0, 5);
    return { income, spend, byCat: [...byCat.entries()].sort((a, b) => b[1] - a[1]), top };
  }, [txns, month]);

  const totalCat = data.byCat.reduce((s, [, v]) => s + v, 0) || 1;
  const R = 60;
  const CIRC = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 13, color: C.muted }}>Report for</span>
        <div style={{ position: "relative" }}>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ appearance: "none", padding: "8px 32px 8px 14px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.panel, color: C.text, fontSize: 13, fontWeight: 600 }}>
            {months.map((m) => (
              <option key={m} value={m}>{new Date(`${m}-15`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.muted }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.green, fontSize: 12 }}><TrendingUp size={13} /> Income</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{fmt(data.income, currency)}</div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.red, fontSize: 12 }}><TrendingDown size={13} /> Spend</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{fmt(data.spend, currency)}</div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: C.muted }}>Net</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: data.income - data.spend >= 0 ? C.green : C.red }}>{fmt(data.income - data.spend, currency)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }} className="ledgerly-grid">
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 14px" }}>Category breakdown</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <svg viewBox="0 0 140 140" width={130} height={130}>
              {data.byCat.map(([cat, amt]) => {
                const frac = amt / totalCat;
                const dash = frac * CIRC;
                const el = <circle key={cat} cx={70} cy={70} r={R} fill="none" stroke={CATEGORY_COLORS[cat]} strokeWidth={20} strokeDasharray={`${dash} ${CIRC - dash}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)" />;
                acc += dash;
                return el;
              })}
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {data.byCat.slice(0, 6).map(([cat, amt]) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORY_COLORS[cat] }} />
                  <span style={{ color: C.muted }}>{cat}</span>
                  <span style={{ marginLeft: "auto", fontWeight: 600 }}>{Math.round((amt / totalCat) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 14px" }}>Top transactions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.top.map((t) => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                <span style={{ color: C.muted }}>{t.merchant}</span>
                <span style={{ fontWeight: 600 }}>{fmt(t.amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 820px) { .ledgerly-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* ─── Settings ───────────────────────────────────────────── */
function SettingsView({ currency, setCurrency }: { currency: string; setCurrency: (c: "USD" | "EUR" | "GBP") => void }) {
  const [prefs, setPrefs] = useState({ billReminders: true, unusualActivity: true, weeklyDigest: false });
  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 14px" }}>Currency</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {(["USD", "EUR", "GBP"] as const).map((c) => (
            <button key={c} onClick={() => setCurrency(c)} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${currency === c ? C.blue : C.border}`, background: currency === c ? `${C.blue}22` : "transparent", color: currency === c ? C.blueBright : C.muted, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 14px" }}>Notifications</h2>
        {(
          [
            ["billReminders", "Bill due reminders"],
            ["unusualActivity", "Unusual transaction alerts"],
            ["weeklyDigest", "Weekly spending digest"],
          ] as [keyof typeof prefs, string][]
        ).map(([key, label]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0" }}>
            <span style={{ fontSize: 13 }}>{label}</span>
            <button onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))} style={{ width: 38, height: 22, borderRadius: 999, border: "none", cursor: "pointer", background: prefs[key] ? C.blue : C.borderStrong, position: "relative" }}>
              <span style={{ position: "absolute", top: 3, left: prefs[key] ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* keep X import intentional for future close affordances without lint noise */
void X;
