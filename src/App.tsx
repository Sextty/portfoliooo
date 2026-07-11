import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicPortfolio from "@/pages/PublicPortfolio";
import ProjectZone from "@/pages/ProjectZone";
import AdminPanel from "@/pages/AdminPanel";
import ProjectPreview from "@/pages/ProjectPreview";
import GirlsBoutique from "@/pages/GirlsBoutique/GirlsBoutique";
import { StoreProvider } from "@/pages/GirlsBoutique/store";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPortfolio />} />
        <Route path="/projects" element={<ProjectZone />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/project/:id" element={<ProjectPreview />} />
        <Route path="/girls-boutique" element={<StoreProvider><GirlsBoutique /></StoreProvider>} />
      </Routes>
    </BrowserRouter>
  );
}
