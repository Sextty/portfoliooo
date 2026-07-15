import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicPortfolio from "@/pages/PublicPortfolio";

// Landing page stays eager for fastest first paint; everything else loads on demand.
const ProjectZone = lazy(() => import("@/pages/ProjectZone"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const ProjectPreview = lazy(() => import("@/pages/ProjectPreview"));
const GirlsBoutiqueRoute = lazy(() => import("@/pages/GirlsBoutique"));

function RouteLoader() {
  return (
    <div
      className="sheet-grid"
      style={{
        minHeight: "100vh",
        background: "#0B1E36",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        className="mono"
        style={{ color: "#FF5C39", fontSize: 12, letterSpacing: "0.3em" }}
      >
        DRAWING…
      </span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<PublicPortfolio />} />
          <Route path="/projects" element={<ProjectZone />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/project/:id" element={<ProjectPreview />} />
          <Route path="/girls-boutique" element={<GirlsBoutiqueRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
