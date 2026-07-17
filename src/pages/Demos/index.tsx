import { lazy, Suspense, ComponentType, LazyExoticComponent } from "react";
import { useParams, Navigate } from "react-router-dom";

// Each demo is its own chunk — visiting /demo/taskforge only loads that demo.
const registry: Record<string, LazyExoticComponent<ComponentType>> = {
  devpulse: lazy(() => import("./DevPulseDemo")),
  "chatflow-ai": lazy(() => import("./ChatFlowDemo")),
  cloudvault: lazy(() => import("./CloudVaultDemo")),
  taskforge: lazy(() => import("./TaskForgeDemo")),
  snapnote: lazy(() => import("./SnapNoteDemo")),
  fittrack: lazy(() => import("./FitTrackDemo")),
  pollwave: lazy(() => import("./PollWaveDemo")),
};

export default function DemoRoute() {
  const { id } = useParams();
  const Demo = id ? registry[id] : undefined;
  if (!Demo) return <Navigate to="/projects" replace />;
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#0d1117",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8b93a7",
            fontFamily: "monospace",
            fontSize: 12,
            letterSpacing: "0.3em",
          }}
        >
          BOOTING DEMO…
        </div>
      }
    >
      <Demo />
    </Suspense>
  );
}
