import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SectionEntrance } from "@/components/SectionEntrance";
import { VideoModal } from "@/components/VideoModal";
import { useActiveSection } from "@/utils/useActiveSection";
import { getProjects, Project } from "@/utils/projectDb";
import { COLORS } from "@/theme/palette";
import { Navbar } from "./landing/Navbar";
import { HeroSection } from "./landing/HeroSection";
import { StatsBand } from "./landing/StatsBand";
import { WorkSection } from "./landing/WorkSection";
import { ServicesSection } from "./landing/ServicesSection";
import { PrinciplesSection } from "./landing/PrinciplesSection";
import { AboutSection } from "./landing/AboutSection";
import { ContactSection } from "./landing/ContactSection";
import { Footer } from "./landing/Footer";

export default function PublicPortfolio() {
  const [scrolled, setScrolled] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const activeSection = useActiveSection(["work", "services", "about", "contact"]);
  const location = useLocation();
  const [playingVideo, setPlayingVideo] = useState<{
    src: string;
    title: string;
    color?: string;
  } | null>(null);

  useEffect(() => {
    setProjects(getProjects());
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Honor /#section links arriving from other routes (e.g. "Start a project"
  // on the catalog): scroll once the section exists in the DOM.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  // Launcher shows featured projects that run inside this site
  const launcherDemos = useMemo(
    () =>
      projects.filter((p) => p.featured && p.runUrl?.startsWith("/")).slice(0, 4),
    [projects]
  );

  return (
    <div
      style={{
        background: COLORS.porcelain,
        color: COLORS.ink,
        overflowX: "hidden",
      }}
    >
      <a href="#work" className="skip-link">
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar scrolled={scrolled} activeSection={activeSection} />
      <main>
        <HeroSection demos={launcherDemos} />
        <StatsBand projects={projects} />
        <SectionEntrance>
          <WorkSection
            projects={projects}
            onWatchDemo={(src, title, color) =>
              setPlayingVideo({ src, title, color })
            }
          />
        </SectionEntrance>
        <SectionEntrance delay={0.05}>
          <ServicesSection />
        </SectionEntrance>
        <SectionEntrance delay={0.05}>
          <PrinciplesSection />
        </SectionEntrance>
        <SectionEntrance delay={0.05}>
          <AboutSection />
        </SectionEntrance>
        <SectionEntrance delay={0.05}>
          <ContactSection />
        </SectionEntrance>
      </main>
      <Footer />

      <VideoModal
        isOpen={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        videoSrc={playingVideo?.src || ""}
        projectTitle={playingVideo?.title || ""}
        projectColor={playingVideo?.color}
      />
    </div>
  );
}
