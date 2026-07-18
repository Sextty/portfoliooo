import { useState } from "react";
import { motion } from "motion/react";
import { Github, ExternalLink, Mail, MapPin, Send } from "lucide-react";
import { tint } from "@/utils/color";
import { SITE } from "@/data/site";
import { COLORS } from "@/theme/palette";

export function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // No backend: compose the message in the visitor's email app instead.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Project inquiry from ${form.name}`;
    const body = `Hi Wassim,\n\n${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setStatus("sent");
    setTimeout(() => setStatus("idle"), 4000);
  };

  const contactRows = [
    {
      icon: Mail,
      label: "Email",
      value: SITE.email,
      href: `mailto:${SITE.email}`,
    },
    {
      icon: Github,
      label: "GitHub",
      value: "github.com/Sextty",
      href: SITE.github,
    },
    {
      icon: ExternalLink,
      label: "LinkedIn",
      value: "linkedin.com/in/wassim-wess",
      href: SITE.linkedin,
    },
    {
      icon: MapPin,
      label: "Location",
      value: SITE.location,
      href: undefined,
    },
  ];

  return (
    <section id="contact" className="relative pt-8 pb-24 md:pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div
          style={{
            background: COLORS.ink,
            borderRadius: 32,
            padding: "clamp(2rem, 5vw, 4rem)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Quiet cobalt glow in the corner */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-30%",
              right: "-12%",
              width: "55%",
              height: "80%",
              background: `radial-gradient(closest-side, ${tint(COLORS.cobalt, 0.35)}, transparent 75%)`,
              pointerEvents: "none",
            }}
          />

          <div className="grid lg:grid-cols-5 gap-12 relative">
            {/* Pitch + direct lines */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <p className="eyebrow mb-3" style={{ color: "#93A8FF" }}>
                Contact
              </p>
              <h2
                className="display"
                style={{
                  fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)",
                  letterSpacing: "-0.025em",
                  color: COLORS.darkText,
                  lineHeight: 1.1,
                  marginBottom: 16,
                }}
              >
                Let&apos;s build the next one.
              </h2>
              <p
                style={{
                  color: COLORS.darkMuted,
                  fontSize: 15.5,
                  lineHeight: 1.75,
                  marginBottom: 32,
                  maxWidth: 380,
                }}
              >
                Tell me about your project, a role you&apos;re hiring for, or
                just say hello. I usually reply within 24 hours.
              </p>

              <div className="flex flex-col gap-4">
                {contactRows.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-4">
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.06)",
                          border: `1px solid ${COLORS.darkLine}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} style={{ color: COLORS.darkMuted }} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: COLORS.darkMuted,
                            marginBottom: 2,
                          }}
                        >
                          {item.label}
                        </div>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={
                              item.href.startsWith("http") ? "_blank" : undefined
                            }
                            rel="noreferrer"
                            style={{
                              fontSize: 14.5,
                              fontWeight: 500,
                              color: COLORS.darkText,
                              textDecoration: "none",
                              transition: "color 0.2s",
                              overflowWrap: "anywhere",
                            }}
                            onMouseEnter={(e) =>
                              ((e.target as HTMLAnchorElement).style.color =
                                "#93A8FF")
                            }
                            onMouseLeave={(e) =>
                              ((e.target as HTMLAnchorElement).style.color =
                                COLORS.darkText)
                            }
                          >
                            {item.value}
                          </a>
                        ) : (
                          <div
                            style={{
                              fontSize: 14.5,
                              fontWeight: 500,
                              color: COLORS.darkText,
                            }}
                          >
                            {item.value}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Form on paper */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div
                style={{
                  background: COLORS.paper,
                  borderRadius: 20,
                  padding: "clamp(1.5rem, 3vw, 2.25rem)",
                  boxShadow: "0 30px 80px -20px rgba(0,0,0,0.4)",
                }}
              >
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-name"
                        style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}
                      >
                        Name
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        autoComplete="name"
                        className="glow-input"
                        style={{ padding: "13px 16px", fontSize: 15, width: "100%" }}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-email"
                        style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}
                      >
                        Email
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        required
                        autoComplete="email"
                        className="glow-input"
                        style={{ padding: "13px 16px", fontSize: 15, width: "100%" }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-message"
                      style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="What are you building — and where can I help?"
                      required
                      rows={6}
                      className="glow-input"
                      style={{
                        padding: "13px 16px",
                        fontSize: 15,
                        width: "100%",
                        resize: "vertical",
                        lineHeight: 1.65,
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status !== "idle"}
                    className="btn-primary"
                    style={{
                      padding: "14px 0",
                      fontSize: 15,
                      opacity: status !== "idle" ? 0.75 : 1,
                      cursor: status !== "idle" ? "not-allowed" : "pointer",
                    }}
                  >
                    {status === "idle" ? (
                      <>
                        Send message <Send size={15} />
                      </>
                    ) : (
                      <>Opening your email app…</>
                    )}
                  </button>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: COLORS.slate,
                      textAlign: "center",
                    }}
                  >
                    This opens your email app with the message pre-filled — just
                    hit send.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
