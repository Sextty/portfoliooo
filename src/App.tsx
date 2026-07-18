import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";
import PublicPortfolio from "@/pages/PublicPortfolio";

// Landing page stays eager for fastest first paint; everything else loads on demand.
const ProjectZone = lazy(() => import("@/pages/ProjectZone"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const ProjectPreview = lazy(() => import("@/pages/ProjectPreview"));
const GirlsBoutiqueRoute = lazy(() => import("@/pages/GirlsBoutique"));
const DemoRoute = lazy(() => import("@/pages/Demos"));

function RouteLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F7F9",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          border: "3px solid #E6E8F0",
          borderTopColor: "#2B50E0",
          animation: "spin-ring 0.8s linear infinite",
        }}
      />
      <span style={{ color: "#566070", fontSize: 14, fontWeight: 500 }}>
        Loading…
      </span>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<PublicPortfolio />} />
            <Route path="/projects" element={<ProjectZone />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/project/:id" element={<ProjectPreview />} />
            <Route path="/girls-boutique" element={<GirlsBoutiqueRoute />} />
            <Route path="/demo/:id" element={<DemoRoute />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  );
}
