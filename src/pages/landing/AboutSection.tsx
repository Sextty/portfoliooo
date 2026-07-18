import { motion } from "motion/react";
import { Github, ExternalLink } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { SectionHeader } from "./SectionHeader";
import profilePhoto from "@/assets/profile.jpg";
import { SITE } from "@/data/site";
import { COLORS } from "@/theme/palette";

const facts = [
  { label: "Location", value: "Tunis, Tunisia" },
  { label: "Timezone", value: "UTC+1" },
  { label: "Experience", value: "3+ years" },
  { label: "Focus", value: "Full-stack web" },
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <SectionHeader eyebrow="About" title="Behind the demos." />

        <div className="grid md:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="relative" style={{ maxWidth: 360 }}>
              <ImageWithFallback
                src={profilePhoto}
                alt="Wassim Jebali — full-stack developer"
                style={{
                  width: "100%",
                  height: 420,
                  objectFit: "cover",
                  objectPosition: "center center",
                  borderRadius: 24,
                  border: `1px solid ${COLORS.line}`,
                  boxShadow: "0 24px 60px -24px rgba(15,18,34,0.25)",
                  display: "block",
                }}
              />
              <div
                className="stamp"
                style={{ position: "absolute", bottom: -16, right: -6 }}
              >
                Open to work
              </div>
            </div>
          </motion.div>

          {/* Bio + facts */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="md:col-span-3"
          >
            <p
              style={{
                color: COLORS.ink,
                fontSize: 17,
                lineHeight: 1.75,
                marginBottom: "1.2rem",
              }}
            >
              I&apos;m Wassim Jebali, a full-stack developer from Tunisia with
              3+ years of experience building web applications. I like owning
              the whole build — from the first database schema to the last
              interface detail — which is why everything here ships as a
              working product, not a mock-up.
            </p>
            <p
              style={{
                color: COLORS.slate,
                fontSize: 15.5,
                lineHeight: 1.75,
                marginBottom: "2rem",
              }}
            >
              When I&apos;m not shipping, I&apos;m exploring new technologies,
              contributing to open source, and sharing what I learn with the
              developer community.
            </p>

            <div className="title-block grid grid-cols-2 sm:grid-cols-4 mb-8">
              {facts.map((f) => (
                <div key={f.label} className="tb-cell">
                  <span className="tb-label">{f.label}</span>
                  <span className="tb-value">{f.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={SITE.github}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
                style={{ padding: "11px 22px", fontSize: 14.5, textDecoration: "none" }}
              >
                <Github size={16} /> GitHub
              </a>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
                style={{ padding: "11px 22px", fontSize: 14.5, textDecoration: "none" }}
              >
                <ExternalLink size={16} /> LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
