import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  CalendarClock,
  History,
  Pill,
  MessageCircle,
  Settings,
  Bell,
  ArrowLeft,
  Github,
  Search,
  ChevronRight,
  ChevronLeft,
  Check,
  Send,
  Star,
  Users,
  Stethoscope,
  X,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   AURAWELL — Care coordination, simplified
   Light, white, emerald, rounded, premium medical. Two full
   dashboards (Patient / Doctor) behind a role switch — the
   most structurally distinct of the three new products.
   ═══════════════════════════════════════════════════════════ */

const C = {
  bg: "#f4faf7",
  panel: "#ffffff",
  panelSoft: "#eef8f3",
  border: "#dfeee8",
  borderStrong: "#bfe3d4",
  text: "#122822",
  muted: "#5c7a70",
  mutedFaint: "#93ac9f",
  primary: "#059669",
  primaryBright: "#10b981",
  primarySoft: "#e3f6ed",
  danger: "#ef4444",
  warning: "#d97706",
  info: "#0ea5e9",
};

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  color: string;
  nextAvailable: string;
  bio: string;
}
interface Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  reason: string;
}
interface HistoryEntry {
  id: string;
  date: string;
  type: string;
  doctor: string;
  notes: string;
}
interface Prescription {
  id: string;
  name: string;
  dosage: string;
  refillsLeft: number;
  prescribedBy: string;
  status: "active" | "expired";
}
interface ThreadMsg {
  id: string;
  from: "patient" | "doctor";
  text: string;
}

const DOCTORS: Doctor[] = [
  { id: "d1", name: "Dr. Elena Marsh", specialty: "Cardiology", rating: 4.9, color: "#059669", nextAvailable: "Tomorrow", bio: "15 years in interventional cardiology." },
  { id: "d2", name: "Dr. Omar Farouk", specialty: "Dermatology", rating: 4.8, color: "#0ea5e9", nextAvailable: "Today", bio: "Focused on preventive skin health." },
  { id: "d3", name: "Dr. Sarah Chen", specialty: "Pediatrics", rating: 5.0, color: "#f472b6", nextAvailable: "In 2 days", bio: "Board-certified pediatrician, gentle with first visits." },
  { id: "d4", name: "Dr. James Whitfield", specialty: "General Practice", rating: 4.7, color: "#8b5cf6", nextAvailable: "Today", bio: "Your first stop for anything and everything." },
  { id: "d5", name: "Dr. Priya Nair", specialty: "Orthopedics", rating: 4.9, color: "#f59e0b", nextAvailable: "In 3 days", bio: "Sports injuries and joint recovery." },
  { id: "d6", name: "Dr. Lucas Bennett", specialty: "Psychiatry", rating: 4.8, color: "#14b8a6", nextAvailable: "Tomorrow", bio: "Calm, evidence-based mental health care." },
];
const SPECIALTIES = ["Any", ...new Set(DOCTORS.map((d) => d.specialty))];

const PATIENT_NAME = "Wassim Jebali";

const seedAppointments = (): Appointment[] => [
  { id: "ap1", patientName: PATIENT_NAME, doctorId: "d1", date: "2026-07-22", time: "10:00 AM", status: "upcoming", reason: "Annual cardiac check-up" },
  { id: "ap2", patientName: PATIENT_NAME, doctorId: "d4", date: "2026-07-05", time: "2:30 PM", status: "completed", reason: "General wellness visit" },
  { id: "ap3", patientName: PATIENT_NAME, doctorId: "d2", date: "2026-06-18", time: "11:15 AM", status: "completed", reason: "Skin consultation" },
  { id: "ap4", patientName: "Nadia Ilić", doctorId: "d1", date: "2026-07-18", time: "9:00 AM", status: "upcoming", reason: "Follow-up EKG" },
  { id: "ap5", patientName: "Marco Duarte", doctorId: "d1", date: "2026-07-18", time: "9:45 AM", status: "upcoming", reason: "Chest pain evaluation" },
  { id: "ap6", patientName: "Yuki Tanaka", doctorId: "d1", date: "2026-07-18", time: "11:00 AM", status: "upcoming", reason: "Blood pressure review" },
];

const seedHistory = (): HistoryEntry[] => [
  { id: "h1", date: "2026-07-05", type: "General wellness visit", doctor: "Dr. James Whitfield", notes: "Vitals normal. Recommended increased water intake and a follow-up in 6 months." },
  { id: "h2", date: "2026-06-18", type: "Skin consultation", doctor: "Dr. Omar Farouk", notes: "Mild eczema on left forearm. Prescribed topical corticosteroid, 2-week course." },
  { id: "h3", date: "2026-03-02", type: "Annual cardiac check-up", doctor: "Dr. Elena Marsh", notes: "EKG normal. Cholesterol slightly elevated — discussed diet adjustments." },
  { id: "h4", date: "2025-11-14", type: "Flu vaccination", doctor: "Dr. James Whitfield", notes: "Seasonal flu shot administered. No adverse reaction observed." },
  { id: "h5", date: "2025-08-30", type: "Sports injury follow-up", doctor: "Dr. Priya Nair", notes: "Ankle sprain fully healed. Cleared for normal activity." },
];

const seedPrescriptions = (): Prescription[] => [
  { id: "rx1", name: "Atorvastatin", dosage: "10mg, once daily", refillsLeft: 2, prescribedBy: "Dr. Elena Marsh", status: "active" },
  { id: "rx2", name: "Hydrocortisone cream", dosage: "Apply 2x daily", refillsLeft: 0, prescribedBy: "Dr. Omar Farouk", status: "expired" },
  { id: "rx3", name: "Vitamin D3", dosage: "2000 IU, once daily", refillsLeft: 5, prescribedBy: "Dr. James Whitfield", status: "active" },
];

const seedThread = (): ThreadMsg[] => [
  { id: "tm1", from: "patient", text: "Hi Dr. Marsh, I've been having occasional palpitations in the evenings. Should I be concerned?" },
  { id: "tm2", from: "doctor", text: "Thanks for flagging this. Occasional palpitations are often benign, but let's keep an eye on it — can you track frequency until your appointment on the 22nd?" },
  { id: "tm3", from: "patient", text: "Will do. Should I avoid caffeine in the meantime?" },
  { id: "tm4", from: "doctor", text: "Good instinct — cutting back on caffeine and alcohol for now is a reasonable precaution. See you Tuesday." },
];

const DOCTOR_REPLIES = [
  "Thanks for the update — noted in your chart.",
  "That sounds normal, but let's discuss it at your next visit.",
  "I'd recommend monitoring that for another few days.",
  "Good question — I'll have more detail after reviewing your latest results.",
];

/** "9:45 AM" -> 585 (minutes since midnight) so time strings sort correctly. */
function timeToMinutes(t: string): number {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

type Role = "patient" | "doctor";
type PatientView = "overview" | "appointments" | "history" | "prescriptions" | "messages" | "settings";
type DoctorView = "today" | "patients" | "schedule" | "messages" | "settings";

export default function AurawellDemo() {
  const [role, setRole] = useState<Role | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(seedAppointments);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(seedPrescriptions);
  const [thread, setThread] = useState<ThreadMsg[]>(seedThread);

  if (!role) return <RoleGate onPick={setRole} />;

  return role === "patient" ? (
    <PatientApp appointments={appointments} setAppointments={setAppointments} prescriptions={prescriptions} setPrescriptions={setPrescriptions} thread={thread} setThread={setThread} onSwitchRole={() => setRole(null)} />
  ) : (
    <DoctorApp appointments={appointments} thread={thread} setThread={setThread} onSwitchRole={() => setRole(null)} />
  );
}

function RoleGate({ onPick }: { onPick: (r: Role) => void }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 24px" }}>
        <Link to="/projects" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.muted, textDecoration: "none", fontSize: 13.5 }}>
          <ArrowLeft size={15} /> Portfolio
        </Link>
      </div>
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 20 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: "min(460px, 94vw)", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 28, padding: 38, textAlign: "center", boxShadow: "0 30px 80px -30px rgba(5,150,105,0.18)" }}>
          <div style={{ width: 54, height: 54, borderRadius: 18, background: C.primary, display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
            <span style={{ color: "white", fontWeight: 800, fontSize: 22 }}>+</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Aurawell</h1>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.65, margin: "0 0 28px" }}>
            Care coordination, simplified. Book appointments, message your care team, and keep every record in one place.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} onClick={() => onPick("patient")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 16, border: `1px solid ${C.border}`, background: C.panelSoft, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: C.primary, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Users size={17} color="white" />
              </div>
              <span>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Continue as Patient</div>
                <div style={{ fontSize: 12, color: C.muted }}>Book visits, view records, message doctors</div>
              </span>
              <ChevronRight size={16} style={{ marginLeft: "auto", color: C.mutedFaint }} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} onClick={() => onPick("doctor")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 16, border: `1px solid ${C.border}`, background: C.panelSoft, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "#0ea5e9", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Stethoscope size={17} color="white" />
              </div>
              <span>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Continue as Doctor</div>
                <div style={{ fontSize: 12, color: C.muted }}>Manage today's queue and patients</div>
              </span>
              <ChevronRight size={16} style={{ marginLeft: "auto", color: C.mutedFaint }} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Shell({
  brandSub,
  nav,
  activeId,
  onNav,
  onSwitchRole,
  headerTitle,
  children,
}: {
  brandSub: string;
  nav: { id: string; label: string; icon: typeof Home }[];
  activeId: string;
  onNav: (id: string) => void;
  onSwitchRole: () => void;
  headerTitle: string;
  children: React.ReactNode;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", display: "flex" }}>
      <aside style={{ width: 226, flexShrink: 0, borderRight: `1px solid ${C.border}`, padding: "20px 14px", display: "flex", flexDirection: "column", background: C.panel }} className="aurawell-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 8px 4px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: C.primary, display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 14 }}>+</div>
          <span style={{ fontWeight: 800, fontSize: 15.5, letterSpacing: "-0.01em" }}>Aurawell</span>
        </div>
        <div style={{ fontSize: 11.5, color: C.mutedFaint, padding: "2px 8px 18px" }}>{brandSub}</div>

        {nav.map((n) => {
          const Icon = n.icon;
          const active = activeId === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: active ? C.primarySoft : "transparent",
                color: active ? C.primary : C.muted,
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                marginBottom: 2,
              }}
            >
              <Icon size={16} />
              {n.label}
            </button>
          );
        })}

        <div style={{ marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 2 }}>
          <button onClick={onSwitchRole} style={{ display: "flex", alignItems: "center", gap: 8, color: C.mutedFaint, background: "none", border: "none", cursor: "pointer", fontSize: 12.5, padding: "6px 8px", textAlign: "left" }}>
            <Users size={13} /> Switch role
          </button>
          <Link to="/projects" style={{ display: "flex", alignItems: "center", gap: 8, color: C.mutedFaint, textDecoration: "none", fontSize: 12.5, padding: "6px 8px" }}>
            <ArrowLeft size={13} /> Back to portfolio
          </Link>
          <a href="https://github.com/Sextty/Aurawell" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: C.mutedFaint, textDecoration: "none", fontSize: 12.5, padding: "6px 8px" }}>
            <Github size={13} /> Source
          </a>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ height: 58, borderBottom: `1px solid ${C.border}`, background: C.panel, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 14.5 }}>{headerTitle}</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", color: C.primary, border: `1px solid ${C.primary}55`, borderRadius: 999, padding: "2px 9px" }}>LIVE DEMO</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <button onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications" style={{ position: "relative", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, width: 34, height: 34, display: "grid", placeItems: "center", cursor: "pointer", color: C.muted }}>
              <Bell size={15} />
              <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: C.danger }} />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ position: "absolute", top: 42, right: 40, width: 270, background: C.panel, border: `1px solid ${C.borderStrong}`, borderRadius: 14, padding: 10, zIndex: 50, boxShadow: "0 24px 60px -20px rgba(5,150,105,0.25)" }}>
                  {["Appointment reminder: tomorrow at 10:00 AM", "New message from your care team", "Prescription refill available"].map((t) => (
                    <div key={t} style={{ padding: "9px 8px", fontSize: 12.5, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{t}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.primary, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700, color: "white" }}>WJ</div>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 26px 60px" }}>{children}</main>
      </div>
      <style>{`@media (max-width: 820px) { .aurawell-sidebar { display: none; } }`}</style>
    </div>
  );
}

/* ═══ PATIENT APP ═══ */
function PatientApp({
  appointments,
  setAppointments,
  prescriptions,
  setPrescriptions,
  thread,
  setThread,
  onSwitchRole,
}: {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  prescriptions: Prescription[];
  setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
  thread: ThreadMsg[];
  setThread: React.Dispatch<React.SetStateAction<ThreadMsg[]>>;
  onSwitchRole: () => void;
}) {
  const [view, setView] = useState<PatientView>("overview");
  const [booking, setBooking] = useState(false);
  const history = useMemo(seedHistory, []);
  const mine = appointments.filter((a) => a.patientName === PATIENT_NAME);
  const upcoming = mine.filter((a) => a.status === "upcoming").sort((a, b) => (a.date < b.date ? -1 : 1));

  const nav: { id: PatientView; label: string; icon: typeof Home }[] = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "appointments", label: "Appointments", icon: CalendarClock },
    { id: "history", label: "Medical History", icon: History },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <Shell brandSub="Patient portal" nav={nav} activeId={view} onNav={(id) => setView(id as PatientView)} onSwitchRole={onSwitchRole} headerTitle={nav.find((n) => n.id === view)?.label || ""}>
      {view === "overview" && (
        <PatientOverview upcoming={upcoming} onBook={() => setBooking(true)} onMessages={() => setView("messages")} prescriptions={prescriptions} />
      )}
      {view === "appointments" && <PatientAppointments mine={mine} onBook={() => setBooking(true)} />}
      {view === "history" && <MedicalHistory history={history} />}
      {view === "prescriptions" && <PrescriptionsView prescriptions={prescriptions} setPrescriptions={setPrescriptions} />}
      {view === "messages" && <MessagesView thread={thread} setThread={setThread} withName="Dr. Elena Marsh" replies={DOCTOR_REPLIES} myRole="patient" />}
      {view === "settings" && <PatientSettings />}

      <AnimatePresence>
        {booking && (
          <BookingFlow
            onClose={() => setBooking(false)}
            onConfirm={(doctorId, date, time, reason) => {
              setAppointments((prev) => [
                { id: `ap${Math.random().toString(36).slice(2, 8)}`, patientName: PATIENT_NAME, doctorId, date, time, status: "upcoming", reason },
                ...prev,
              ]);
            }}
          />
        )}
      </AnimatePresence>
    </Shell>
  );
}

function StatTile({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 18, padding: "16px 18px" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{label}</div>
    </div>
  );
}

function PatientOverview({ upcoming, onBook, onMessages, prescriptions }: { upcoming: Appointment[]; onBook: () => void; onMessages: () => void; prescriptions: Prescription[] }) {
  const next = upcoming[0];
  const nextDoctor = next ? DOCTORS.find((d) => d.id === next.doctorId) : null;
  const activeRx = prescriptions.filter((p) => p.status === "active").length;

  return (
    <div style={{ maxWidth: 1040 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div style={{ flex: 2, minWidth: 280, background: `linear-gradient(135deg, ${C.primary}, #14b8a6)`, borderRadius: 22, padding: 24, color: "white" }}>
          <div style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 6 }}>Next appointment</div>
          {next && nextDoctor ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{nextDoctor.name}</div>
              <div style={{ fontSize: 13.5, opacity: 0.9, marginBottom: 14 }}>
                {nextDoctor.specialty} · {next.date} at {next.time}
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>{next.reason}</div>
            </>
          ) : (
            <div style={{ fontSize: 15, fontWeight: 600 }}>No upcoming appointments</div>
          )}
          <button onClick={onBook} style={{ marginTop: 18, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", color: "white", borderRadius: 12, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Book another visit
          </button>
        </div>
        <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={onBook} style={{ display: "flex", alignItems: "center", gap: 10, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", textAlign: "left" }}>
            <CalendarClock size={17} color={C.primary} /> <span style={{ fontSize: 13.5, fontWeight: 600 }}>Book appointment</span>
          </button>
          <button onClick={onMessages} style={{ display: "flex", alignItems: "center", gap: 10, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", textAlign: "left" }}>
            <MessageCircle size={17} color={C.info} /> <span style={{ fontSize: 13.5, fontWeight: 600 }}>Message your doctor</span>
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatTile label="Upcoming visits" value={upcoming.length} color={C.primary} />
        <StatTile label="Active prescriptions" value={activeRx} color={C.info} />
        <StatTile label="Care team" value={2} color="#8b5cf6" />
        <StatTile label="Health score" value="92" color="#f59e0b" />
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Upcoming appointments</h2>
        {upcoming.length === 0 ? (
          <div style={{ color: C.mutedFaint, fontSize: 13.5 }}>Nothing scheduled — book a visit whenever you're ready.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map((a) => {
              const doc = DOCTORS.find((d) => d.id === a.doctorId)!;
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.panelSoft, borderRadius: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: doc.color, display: "grid", placeItems: "center", color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {doc.name.split(" ").map((w) => w[0]).slice(-2).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{doc.specialty} · {a.reason}</div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12.5, color: C.muted, flexShrink: 0 }}>
                    {a.date}
                    <br />
                    {a.time}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientAppointments({ mine, onBook }: { mine: Appointment[]; onBook: () => void }) {
  const sorted = [...mine].sort((a, b) => (a.date < b.date ? 1 : -1));
  const statusColor: Record<Appointment["status"], string> = { upcoming: C.primary, completed: C.mutedFaint, cancelled: C.danger };
  return (
    <div style={{ maxWidth: 760 }}>
      <button onClick={onBook} style={{ marginBottom: 18, background: C.primary, color: "white", border: "none", borderRadius: 12, padding: "11px 20px", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
        + Book appointment
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((a) => {
          const doc = DOCTORS.find((d) => d.id === a.doctorId)!;
          return (
            <div key={a.id} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: doc.color, display: "grid", placeItems: "center", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {doc.name.split(" ").map((w) => w[0]).slice(-2).join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{doc.name}</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>{doc.specialty} · {a.reason}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 12.5, color: C.muted }}>
                {a.date}
                <br />
                {a.time}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[a.status], border: `1px solid ${statusColor[a.status]}55`, borderRadius: 999, padding: "3px 11px", textTransform: "capitalize", flexShrink: 0 }}>
                {a.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MedicalHistory({ history }: { history: HistoryEntry[] }) {
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: C.border }} />
        {history.map((h) => (
          <div key={h.id} style={{ position: "relative", marginBottom: 22 }}>
            <span style={{ position: "absolute", left: -24, top: 3, width: 12, height: 12, borderRadius: "50%", background: C.primary, border: "3px solid white", boxShadow: `0 0 0 1px ${C.borderStrong}` }} />
            <div style={{ fontSize: 12, color: C.mutedFaint, marginBottom: 3 }}>{h.date}</div>
            <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 3 }}>{h.type}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 6 }}>{h.doctor}</div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 13, color: C.text, lineHeight: 1.6 }}>{h.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrescriptionsView({ prescriptions, setPrescriptions }: { prescriptions: Prescription[]; setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>> }) {
  const requestRefill = (id: string) => setPrescriptions((prev) => prev.map((p) => (p.id === id ? { ...p, refillsLeft: p.refillsLeft + 3, status: "active" } : p)));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, maxWidth: 900 }}>
      {prescriptions.map((p) => (
        <div key={p.id} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primarySoft, display: "grid", placeItems: "center" }}>
              <Pill size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{p.dosage}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Prescribed by {p.prescribedBy}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: p.status === "active" ? C.primary : C.danger }}>
              {p.status === "active" ? `${p.refillsLeft} refills left` : "Expired"}
            </span>
            {p.refillsLeft === 0 && (
              <button onClick={() => requestRefill(p.id)} style={{ background: C.primarySoft, color: C.primary, border: "none", borderRadius: 999, padding: "6px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Request refill
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PatientSettings() {
  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Profile</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.primary, display: "grid", placeItems: "center", color: "white", fontWeight: 700 }}>WJ</div>
          <div>
            <div style={{ fontWeight: 700 }}>{PATIENT_NAME}</div>
            <div style={{ color: C.muted, fontSize: 12.5 }}>wassimjebali583@gmail.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ DOCTOR APP ═══ */
function DoctorApp({ appointments, thread, setThread, onSwitchRole }: { appointments: Appointment[]; thread: ThreadMsg[]; setThread: React.Dispatch<React.SetStateAction<ThreadMsg[]>>; onSwitchRole: () => void }) {
  const [view, setView] = useState<DoctorView>("today");
  const [query, setQuery] = useState("");
  const me = DOCTORS[0]; // Dr. Elena Marsh
  const myAppointments = appointments.filter((a) => a.doctorId === me.id);
  const todaysQueue = myAppointments.filter((a) => a.date === "2026-07-18").sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  const patientDirectory = useMemo(() => [...new Set(appointments.map((a) => a.patientName))].sort(), [appointments]);
  const filteredPatients = patientDirectory.filter((p) => p.toLowerCase().includes(query.toLowerCase()));

  const nav: { id: DoctorView; label: string; icon: typeof Home }[] = [
    { id: "today", label: "Today", icon: Home },
    { id: "patients", label: "Patients", icon: Users },
    { id: "schedule", label: "Schedule", icon: CalendarClock },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <Shell brandSub={`${me.name} · ${me.specialty}`} nav={nav} activeId={view} onNav={(id) => setView(id as DoctorView)} onSwitchRole={onSwitchRole} headerTitle={nav.find((n) => n.id === view)?.label || ""}>
      {view === "today" && <DoctorToday queue={todaysQueue} me={me} />}
      {view === "patients" && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.mutedFaint }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patients…" style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px 10px 38px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.panel, fontSize: 13.5 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredPatients.map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.panelSoft, color: C.primary, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 }}>{p.split(" ").map((w) => w[0]).join("")}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{appointments.filter((a) => a.patientName === p).length} visit(s) on record</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {view === "schedule" && <DoctorSchedule queue={myAppointments} />}
      {view === "messages" && <MessagesView thread={thread} setThread={setThread} withName={PATIENT_NAME} replies={["Understood, thanks for the detail.", "Please continue monitoring and note anything unusual.", "That's a good sign — keep it up."]} myRole="doctor" />}
      {view === "settings" && (
        <div style={{ maxWidth: 480, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Profile</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: me.color, display: "grid", placeItems: "center", color: "white", fontWeight: 700 }}>EM</div>
            <div>
              <div style={{ fontWeight: 700 }}>{me.name}</div>
              <div style={{ color: C.muted, fontSize: 12.5 }}>{me.specialty}</div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

function DoctorToday({ queue, me }: { queue: Appointment[]; me: Doctor }) {
  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatTile label="Patients today" value={queue.length} color={C.primary} />
        <StatTile label="Avg rating" value={me.rating} color="#f59e0b" />
        <StatTile label="Next slot" value={me.nextAvailable} color={C.info} />
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Today's queue</h2>
        {queue.length === 0 ? (
          <div style={{ color: C.mutedFaint, fontSize: 13.5 }}>No patients scheduled today.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {queue.map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: C.panelSoft, borderRadius: 14 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: i === 0 ? C.primary : "white", color: i === 0 ? "white" : C.mutedFaint, border: `1px solid ${C.borderStrong}`, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.patientName}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{a.reason}</div>
                </div>
                <span style={{ fontSize: 12.5, color: C.muted }}>{a.time}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? C.primary : C.mutedFaint, border: `1px solid ${i === 0 ? C.primary : C.border}`, borderRadius: 999, padding: "3px 11px" }}>
                  {i === 0 ? "In progress" : "Waiting"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorSchedule({ queue }: { queue: Appointment[] }) {
  const byDate = useMemo(() => {
    const m = new Map<string, Appointment[]>();
    [...queue].sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((a) => {
      const list = m.get(a.date) || [];
      list.push(a);
      m.set(a.date, list);
    });
    return [...m.entries()].map(([date, list]) => [date, [...list].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))] as [string, Appointment[]]);
  }, [queue]);
  return (
    <div style={{ maxWidth: 700, display: "flex", flexDirection: "column", gap: 18 }}>
      {byDate.map(([date, list]) => (
        <div key={date}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8, color: C.muted }}>{date}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {list.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: "9px 14px", fontSize: 13 }}>
                <span style={{ fontWeight: 600, width: 78 }}>{a.time}</span>
                <span>{a.patientName}</span>
                <span style={{ marginLeft: "auto", color: C.muted, fontSize: 12 }}>{a.reason}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Messages (shared by both roles) ───────────────────── */
function MessagesView({ thread, setThread, withName, replies, myRole }: { thread: ThreadMsg[]; setThread: React.Dispatch<React.SetStateAction<ThreadMsg[]>>; withName: string; replies: string[]; myRole: "patient" | "doctor" }) {
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const otherRole = myRole === "patient" ? "doctor" : "patient";

  const send = () => {
    if (!draft.trim()) return;
    setThread((prev) => [...prev, { id: Math.random().toString(36).slice(2), from: myRole, text: draft.trim() }]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setThread((prev) => [...prev, { id: Math.random().toString(36).slice(2), from: otherRole, text: replies[Math.floor(Math.random() * replies.length)] }]);
    }, 1100 + Math.random() * 500);
  };

  return (
    <div style={{ maxWidth: 620, height: "calc(100vh - 200px)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: "18px 18px 0 0", padding: "12px 18px", fontWeight: 700, fontSize: 13.5 }}>{withName}</div>
      <div style={{ flex: 1, background: C.panel, border: `1px solid ${C.border}`, borderTop: "none", overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {thread.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.from === myRole ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "75%", background: m.from === myRole ? C.primary : C.panelSoft, color: m.from === myRole ? "white" : C.text, borderRadius: 14, padding: "9px 13px", fontSize: 13.5, lineHeight: 1.55 }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: C.panelSoft, borderRadius: 14, padding: "10px 14px", display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.mutedFaint, animation: `mk-typing 1.2s ease-in-out ${i * 0.16}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{ display: "flex", gap: 8, background: C.panel, border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 18px 18px", padding: 14 }}
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.panelSoft, fontSize: 13.5 }} />
        <button type="submit" style={{ background: C.primary, border: "none", borderRadius: 12, width: 42, display: "grid", placeItems: "center", cursor: "pointer" }}>
          <Send size={15} color="white" />
        </button>
      </form>
    </div>
  );
}

/* ─── Multi-step booking flow ────────────────────────────── */
function nextDays(n: number) {
  const out: { iso: string; label: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({ iso: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) });
  }
  return out;
}
const TIME_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM"];

function BookingFlow({ onClose, onConfirm }: { onClose: () => void; onConfirm: (doctorId: string, date: string, time: string, reason: string) => void }) {
  const [step, setStep] = useState(1);
  const [specialty, setSpecialty] = useState("Any");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  const days = useMemo(() => nextDays(7), []);
  const bookedSlots = useMemo(() => {
    // deterministic "unavailable" slots so the grid feels real
    const seed = (doctorId || "") + (date || "");
    let h = 0;
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return new Set(TIME_SLOTS.filter((_, i) => (h >> i) % 5 === 0));
  }, [doctorId, date]);

  const doctors = specialty === "Any" ? DOCTORS : DOCTORS.filter((d) => d.specialty === specialty);
  const doctor = DOCTORS.find((d) => d.id === doctorId);

  const confirm = () => {
    if (!doctorId || !date || !time) return;
    onConfirm(doctorId, date, time, reason.trim() || "General consultation");
    setDone(true);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(18,40,34,0.45)", zIndex: 90 }} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 95, width: "min(520px, 94vw)", maxHeight: "88vh", overflowY: "auto", background: "white", borderRadius: 24, padding: 26, boxShadow: "0 40px 100px -20px rgba(5,150,105,0.3)" }}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 10px" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} style={{ width: 60, height: 60, borderRadius: "50%", background: C.primarySoft, display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
              <Check size={28} color={C.primary} />
            </motion.div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>Appointment confirmed</h2>
            <p style={{ color: C.muted, fontSize: 13.5, margin: "0 0 22px" }}>
              {doctor?.name} · {date} at {time}
            </p>
            <button onClick={onClose} style={{ background: C.primary, color: "white", border: "none", borderRadius: 12, padding: "11px 26px", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: 15.5 }}>Book an appointment</span>
              <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", gap: 5, marginBottom: 22 }}>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} style={{ flex: 1, height: 4, borderRadius: 999, background: s <= step ? C.primary : C.border }} />
              ))}
            </div>

            {step === 1 && (
              <div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>What kind of care do you need?</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SPECIALTIES.map((s) => (
                    <button key={s} onClick={() => setSpecialty(s)} style={{ padding: "9px 16px", borderRadius: 999, border: `1px solid ${specialty === s ? C.primary : C.border}`, background: specialty === s ? C.primarySoft : "white", color: specialty === s ? C.primary : C.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Choose a doctor</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {doctors.map((d) => (
                    <button key={d.id} onClick={() => setDoctorId(d.id)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "12px 14px", borderRadius: 14, border: `1px solid ${doctorId === d.id ? C.primary : C.border}`, background: doctorId === d.id ? C.primarySoft : "white", cursor: "pointer" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: d.color, display: "grid", placeItems: "center", color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{d.name.split(" ").map((w) => w[0]).slice(-2).join("")}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{d.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{d.specialty}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#d97706" }}>
                          <Star size={11} fill="currentColor" /> {d.rating}
                        </div>
                        <div style={{ fontSize: 11, color: C.mutedFaint }}>{d.nextAvailable}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>Pick a date</div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 18 }}>
                  {days.map((d) => (
                    <button key={d.iso} onClick={() => { setDate(d.iso); setTime(null); }} style={{ flexShrink: 0, padding: "9px 14px", borderRadius: 12, border: `1px solid ${date === d.iso ? C.primary : C.border}`, background: date === d.iso ? C.primarySoft : "white", color: date === d.iso ? C.primary : C.text, fontSize: 12.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {d.label}
                    </button>
                  ))}
                </div>
                {date && (
                  <>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>Pick a time</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: 8 }}>
                      {TIME_SLOTS.map((t) => {
                        const disabled = bookedSlots.has(t);
                        return (
                          <button key={t} disabled={disabled} onClick={() => setTime(t)} style={{ padding: "8px 6px", borderRadius: 10, border: `1px solid ${time === t ? C.primary : C.border}`, background: disabled ? "#f4f4f4" : time === t ? C.primarySoft : "white", color: disabled ? C.mutedFaint : time === t ? C.primary : C.text, fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", textDecoration: disabled ? "line-through" : "none" }}>
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>What's this visit about?</div>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Briefly describe your reason for visiting…" style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 13.5, resize: "vertical", marginBottom: 16, fontFamily: "inherit" }} />
                <div style={{ background: C.panelSoft, borderRadius: 14, padding: 14, fontSize: 13 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{doctor?.name}</div>
                  <div style={{ color: C.muted }}>{doctor?.specialty} · {date} at {time}</div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {step > 1 && (
                <button onClick={() => setStep((s) => s - 1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                  <ChevronLeft size={15} /> Back
                </button>
              )}
              {step < 4 ? (
                <button
                  disabled={(step === 2 && !doctorId) || (step === 3 && !time)}
                  onClick={() => setStep((s) => s + 1)}
                  style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: C.primary, color: "white", border: "none", borderRadius: 12, padding: "10px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", opacity: (step === 2 && !doctorId) || (step === 3 && !time) ? 0.5 : 1 }}
                >
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={confirm} style={{ marginLeft: "auto", background: C.primary, color: "white", border: "none", borderRadius: 12, padding: "10px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                  Confirm booking
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}
