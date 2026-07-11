import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { initDb, getDb, getProductsByCategory, getProductById, getTrendingProducts, getRelatedProducts, createOrder, svgPlaceholder } from "./db";
import { useStore } from "./store";
import { Product } from "./types";
import { ArrowLeft, ShoppingBag, Heart, X, Minus, Plus, Star, ChevronLeft, ChevronRight, Menu } from "lucide-react";

type Page =
  | { name: "home" }
  | { name: "makeup" }
  | { name: "fashion"; tab?: string }
  | { name: "product"; id: number }
  | { name: "cart" }
  | { name: "checkout" }
  | { name: "wishlist" };

const G = { pink: "#ec4899", bg: "#060912", text: "#e8ecf4", muted: "#64748b", border: "rgba(236,72,153,0.12)", card: "rgba(236,72,153,0.04)" };

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } } };
const scaleIn = { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } } };

const productImgs: Record<string, string> = {
  "prod_img_1": svgPlaceholder("makeup", "CT"),
  "prod_img_2": svgPlaceholder("makeup", "NARS"),
  "prod_img_3": svgPlaceholder("makeup", "UD"),
  "prod_img_4": svgPlaceholder("makeup", "Fenty"),
  "prod_img_5": svgPlaceholder("makeup", "TO"),
  "prod_img_6": svgPlaceholder("makeup", "Morphe"),
  "prod_img_7": svgPlaceholder("bags", "Polène"),
  "prod_img_8": svgPlaceholder("bags", "Mango"),
  "prod_img_9": svgPlaceholder("bags", "Aritzia"),
  "prod_img_10": svgPlaceholder("clothes", "Ref"),
  "prod_img_11": svgPlaceholder("clothes", "Burberry"),
  "prod_img_12": svgPlaceholder("clothes", "O Stories"),
  "prod_img_1_hover": svgPlaceholder("makeup", "CT • 38"),
  "prod_img_2_hover": svgPlaceholder("makeup", "NARS • 55"),
  "prod_img_3_hover": svgPlaceholder("makeup", "UD • 42"),
  "prod_img_4_hover": svgPlaceholder("makeup", "Fenty • 35"),
  "prod_img_5_hover": svgPlaceholder("makeup", "TO • 18"),
  "prod_img_6_hover": svgPlaceholder("makeup", "Morphe •65"),
  "prod_img_7_hover": svgPlaceholder("bags", "Polène•295"),
  "prod_img_8_hover": svgPlaceholder("bags", "Mango•79"),
  "prod_img_9_hover": svgPlaceholder("bags", "Aritzia•148"),
  "prod_img_10_hover": svgPlaceholder("clothes", "Ref•198"),
  "prod_img_11_hover": svgPlaceholder("clothes", "Burberry420"),
  "prod_img_12_hover": svgPlaceholder("clothes", "OS•125"),
};

function imgSrc(url: string): string {
  return productImgs[url] || svgPlaceholder("default", "GB");
}

function StarRating({ rating, reviews }: { rating: number; reviews?: number }) {
  const rounded = Math.round(rating);
  return (
    <motion.div className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex text-amber-400" style={{ fontSize: 9 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Star key={i} size={9} fill={i <= rounded ? "currentColor" : "none"} opacity={i <= rounded ? 1 : 0.3} />
          </motion.span>
        ))}
      </div>
      {reviews !== undefined && <span style={{ fontSize: 10, color: "#94a3b8" }}>({reviews})</span>}
    </motion.div>
  );
}

function ProductBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    Sale: "bg-red-600 text-white",
    New: "bg-pink-600 text-white",
    Bestseller: "bg-amber-600 text-white",
  };
  return (
    <motion.span
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`absolute top-3 left-3 z-10 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase ${colors[tag] || "bg-white text-black"}`}
    >
      {tag}
    </motion.span>
  );
}

function Navbar({ page, setPage, cartCount }: { page: Page; setPage: (p: Page) => void; cartCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { label: "Home", page: { name: "home" as const } },
    { label: "Beauty", page: { name: "makeup" as const } },
    { label: "Fashion", page: { name: "fashion" as const, tab: "bags" } },
  ];
  const isActive = (p: Page) => {
    if (p.name === page.name) {
      if (p.name === "fashion" && page.name === "fashion") return true;
      return true;
    }
    return false;
  };
  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
      style={{
        height: 64,
        background: "rgba(6,9,18,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${G.border}`,
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <div className="flex items-center gap-6">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setPage({ name: "home" })}
          style={{
            fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18,
            color: G.pink, background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.02em",
          }}
        >
          Girls<span style={{ color: "#6366f1" }}>.</span>
        </motion.button>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((l) => (
          <motion.button
            key={l.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(l.page)}
            style={{
              fontSize: 13, fontWeight: isActive(l.page) ? 600 : 500,
              color: isActive(l.page) ? G.text : G.muted,
              background: "none", border: "none", cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = G.text)}
            onMouseLeave={(e) => { if (!isActive(l.page)) e.currentTarget.style.color = G.muted; }}
          >
            {l.label}
            {isActive(l.page) && (
              <motion.div layoutId="navActive" style={{ height: 2, background: G.pink, borderRadius: 1, marginTop: 2 }} />
            )}
          </motion.button>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.85 }}
          onClick={() => setPage({ name: "wishlist" })}
          style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: G.muted, padding: 4 }}
        >
          <Heart size={18} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }}
          onClick={() => setPage({ name: "cart" })}
          style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: G.muted, padding: 4 }}
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              style={{
                position: "absolute", top: -4, right: -4,
                width: 16, height: 16, borderRadius: "50%",
                background: G.pink, color: "white",
                fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {cartCount}
            </motion.span>
          )}
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }}
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden"
          style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, padding: 4 }}
        >
          <Menu size={18} />
        </motion.button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "absolute", top: 64, left: 0, right: 0,
              background: "rgba(6,9,18,0.98)", borderBottom: `1px solid ${G.border}`,
              padding: 16, display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            {navLinks.map((l) => (
              <motion.button
                key={l.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setPage(l.page); setMenuOpen(false); }}
                style={{ background: "none", border: "none", color: G.text, fontSize: 14, textAlign: "left", cursor: "pointer", padding: "8px 0" }}
              >
                {l.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  const [slide, setSlide] = useState(0);
  const [trending, setTrending] = useState<Product[]>([]);
  const slides = [
    { tag: "THE BAG EDIT", title: ["Carry Your", "Story."], desc: "Artisan bags crafted for everyday elegance.", link: () => setPage({ name: "fashion", tab: "bags" }), linkText: "DISCOVER BAGS", symbol: "✦" },
    { tag: "BEAUTY EDIT", title: ["Beauty,", "Redefined."], desc: "Curated makeup and skincare for the modern woman.", link: () => setPage({ name: "makeup" }), linkText: "SHOP BEAUTY", symbol: "♡" },
    { tag: "NEW SEASON", title: ["New Season,", "New You."], desc: "Spring/Summer 2025 Collection has arrived.", link: () => setPage({ name: "fashion" }), linkText: "EXPLORE NOW", symbol: "◇" },
  ];

  useEffect(() => { setTrending(getTrendingProducts()); const interval = setInterval(() => setSlide((s) => (s + 1) % 3), 5000); return () => clearInterval(interval); }, []);

  return (
    <motion.div initial="initial" animate="animate" variants={stagger}>
      {/* Hero */}
      <motion.div variants={fadeUp} style={{ position: "relative", overflow: "hidden", height: "clamp(500px, 80vh, 700px)", width: "100%", background: G.bg, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ display: "flex", width: "300%", height: "100%", transform: `translateX(-${slide * 33.333}%)`, transition: "transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)" }}>
          {slides.map((s, i) => (
            <div key={i} style={{ width: "33.333%", height: "100%", flexShrink: 0, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: slide === i ? 1 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "48px 64px", height: "100%" }}
              >
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={slide === i ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  style={{ fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", color: G.pink, marginBottom: 16, fontWeight: 700 }}
                >
                  {s.tag}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={slide === i ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
                  style={{ fontFamily: "'Sora', serif", fontSize: "clamp(1.8rem, 4vw, 3.5rem)", fontWeight: 300, lineHeight: 1.15, marginBottom: 16, color: "#1c1917" }}
                >
                  {s.title.map((line, j) => (
                    <span key={j} style={{ display: "block" }}>{j === 1 ? <i style={{ fontWeight: 600 }}>{line}</i> : line}</span>
                  ))}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={slide === i ? { opacity: 1 } : {}}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  style={{ fontSize: 14, color: "#78716c", maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}
                >
                  {s.desc}
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={slide === i ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  whileHover={{ scale: 1.03, background: "#444" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={s.link}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 12, background: "#1c1917", color: "white",
                    padding: "12px 32px", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
                    border: "none", cursor: "pointer",
                  }}
                >
                  {s.linkText} →
                </motion.button>
              </motion.div>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={slide === i ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "linear-gradient(135deg, #fdf8f5 0%, #f5f0eb 100%)" }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  style={{ fontFamily: "Georgia,serif", fontSize: 80, color: "#d4a373", opacity: 0.3 }}
                >
                  {s.symbol}
                </motion.div>
              </motion.div>
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setSlide((slide - 1 + 3) % 3)}
          style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.8)",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
          }}
        >
          <ChevronLeft size={16} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setSlide((slide + 1) % 3)}
          style={{
            position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
            width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.8)",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
          }}
        >
          <ChevronRight size={16} />
        </motion.button>
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
          {[0, 1, 2].map((i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSlide(i)}
              animate={{ width: slide === i ? 20 : 8, background: slide === i ? G.pink : "rgba(0,0,0,0.2)" }}
              transition={{ duration: 0.3 }}
              style={{ height: 6, borderRadius: 4, border: "none", cursor: "pointer" }}
            />
          ))}
        </div>
      </motion.div>

      {/* Collections Grid */}
      <motion.section variants={fadeUp} style={{ maxWidth: 1440, margin: "0 auto", padding: "64px 24px" }}>
        <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, height: 500 }}>
          <motion.button
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage({ name: "makeup" })}
            style={{
              position: "relative", overflow: "hidden", cursor: "pointer", border: "none", padding: 0,
              background: "linear-gradient(135deg, #fae1dd 0%, #f0a6ca 100%)", borderRadius: 12,
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(236,72,153,0.3), transparent 70%)" }}
            />
            <div style={{ position: "relative", padding: "24px 32px", backdropFilter: "blur(8px)", background: "rgba(236,72,153,0.85)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "0 0 12px 12px" }}>
              <span style={{ fontFamily: "'Sora', serif", fontSize: 18, fontWeight: 600 }}>Makeup & Beauty</span>
              <motion.span initial={{ x: 0 }} whileHover={{ x: 4 }} style={{ fontSize: 10, letterSpacing: "0.25em", fontWeight: 600 }}>EXPLORE →</motion.span>
            </div>
          </motion.button>
          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 24 }}>
            <motion.button
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPage({ name: "fashion", tab: "bags" })}
              style={{
                position: "relative", overflow: "hidden", cursor: "pointer", border: "none", padding: "24px 32px",
                background: "linear-gradient(135deg, #fefae0 0%, #e8d5b7 100%)", borderRadius: 12,
                display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-start", textAlign: "left",
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 80%, rgba(212,163,115,0.3), transparent 70%)" }}
              />
              <div style={{ position: "relative" }}>
                <h3 style={{ fontFamily: "'Sora', serif", fontSize: 24, fontWeight: 300, color: "#1c1917", marginBottom: 8 }}>Bags</h3>
                <motion.span initial={{ x: 0 }} whileHover={{ x: 4 }} style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1c1917", borderBottom: "1px solid rgba(0,0,0,0.2)", paddingBottom: 4, display: "inline-block" }}>
                  Shop Bags →
                </motion.span>
              </div>
            </motion.button>
            <motion.button
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPage({ name: "fashion", tab: "clothes" })}
              style={{
                position: "relative", overflow: "hidden", cursor: "pointer", border: "none", padding: "24px 32px",
                background: "linear-gradient(135deg, #e8f4f8 0%, #b5d9ce 100%)", borderRadius: 12,
                display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-start", textAlign: "left",
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(122,179,161,0.3), transparent 70%)" }}
              />
              <div style={{ position: "relative" }}>
                <h3 style={{ fontFamily: "'Sora', serif", fontSize: 24, fontWeight: 300, color: "#1c1917", marginBottom: 8 }}>Clothes</h3>
                <motion.span initial={{ x: 0 }} whileHover={{ x: 4 }} style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1c1917", borderBottom: "1px solid rgba(0,0,0,0.2)", paddingBottom: 4, display: "inline-block" }}>
                  Shop Clothes →
                </motion.span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      {/* Trending */}
      <motion.section variants={fadeUp} style={{ background: "linear-gradient(180deg, #0f0a14 0%, #060912 100%)", borderTop: `1px solid ${G.border}`, padding: "64px 24px" }}>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={stagger} style={{ maxWidth: 1440, margin: "0 auto" }}>
          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32, borderBottom: `1px solid ${G.border}`, paddingBottom: 16 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: G.pink, marginBottom: 8, fontWeight: 700 }}>Right Now</p>
              <h2 style={{ fontFamily: "'Sora', serif", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 300, color: G.text }}>Trending</h2>
            </div>
            <motion.button whileHover={{ x: 4 }} onClick={() => setPage({ name: "makeup" })} style={{
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#94a3b8",
              background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            }}>View All →</motion.button>
          </motion.div>
          <motion.div initial="initial" animate="animate" variants={stagger} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} setPage={setPage} />
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Promo Strip */}
      <motion.div variants={fadeUp} style={{ background: G.pink, color: "white", padding: "12px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "gb-marquee 20s linear infinite" }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: "flex", flexShrink: 0 }}>
              {["Free shipping on orders over $150", "New arrivals every week", "Complimentary gift wrapping", "30-day free returns"].map((text, j) => (
                <span key={j} style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 40px", opacity: 0.8 }}>{text}</span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Newsletter */}
      <motion.section variants={fadeUp} style={{ padding: "80px 24px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", color: G.muted, marginBottom: 16 }}>Stay in the Loop</p>
          <h2 style={{ fontFamily: "'Sora', serif", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 600, color: G.text, marginBottom: 12 }}>Join the Community</h2>
          <p style={{ color: G.muted, fontSize: 14, marginBottom: 24, maxWidth: 300, margin: "0 auto 24px" }}>Early access, style edits, and member-only offers.</p>
          <motion.form
            whileHover={{ borderColor: G.pink }}
            onSubmit={(e) => { e.preventDefault(); alert("Thank you!"); }}
            style={{ display: "flex", maxWidth: 320, margin: "0 auto", border: "1px solid rgba(236,72,153,0.2)", transition: "border-color 0.3s" }}
          >
            <input type="email" required placeholder="your@email.com" style={{
              flex: 1, background: "transparent", padding: "12px 16px", fontSize: 14, border: "none", outline: "none", color: G.text,
            }} />
            <motion.button
              whileHover={{ background: "#db2777" }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              style={{
                background: G.pink, color: "white", padding: "12px 24px", fontSize: 10, fontWeight: 600,
                letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer",
              }}
            >
              Subscribe
            </motion.button>
          </motion.form>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

function ProductCard({ product, setPage }: { product: Product; setPage: (p: Page) => void }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      variants={scaleIn}
      animate={{ y: hovered ? -4 : 0 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => setPage({ name: "product", id: product.id })}
      style={{ cursor: "pointer" }}
    >
      <motion.div
        style={{ position: "relative", overflow: "hidden", background: "#1a1520", aspectRatio: "3/4", marginBottom: 12, borderRadius: 12 }}
      >
        <motion.div
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", height: "100%" }}
        >
          <img src={imgSrc(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
        </motion.div>
        {product.tag && <ProductBadge tag={product.tag} />}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute", top: 8, right: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", borderRadius: "50%", zIndex: 10,
          }}
        >
          <Heart size={12} fill={isWishlisted(product.id) ? G.pink : "none"} color={isWishlisted(product.id) ? G.pink : "#333"} />
        </motion.button>
        {product.stock > 0 ? (
          <motion.button
            onClick={handleAdd}
            animate={{ y: hovered ? 0 : "100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0, background: added ? "#10b981" : "#1c1917", color: "white",
              fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase",
              padding: 12, border: "none", cursor: "pointer", zIndex: 10,
            }}
          >
            <motion.span key={added ? "added" : "add"} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {added ? "✓ ADDED" : "ADD TO BAG"}
            </motion.span>
          </motion.button>
        ) : (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(100,50,50,0.8)", color: "white",
            fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase",
            padding: 12, textAlign: "center",
          }}>
            OUT OF STOCK
          </div>
        )}
      </motion.div>
      <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: G.muted, marginBottom: 4 }}>{product.brand}</p>
      <h3 style={{ fontSize: 13, fontWeight: 500, color: G.text, marginBottom: 4 }}>{product.name}</h3>
      <StarRating rating={product.rating} reviews={product.reviews} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: G.text }}>${product.price.toFixed(2)}</span>
        {product.original_price && (
          <span style={{ fontSize: 12, color: G.muted, textDecoration: "line-through" }}>${product.original_price.toFixed(2)}</span>
        )}
      </div>
    </motion.div>
  );
}

function ProductListing({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const isMakeup = page.name === "makeup";
  const tab = page.name === "fashion" ? (page as any).tab || "bags" : undefined;
  const [activeTab, setActiveTab] = useState(tab || "bags");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const slug = isMakeup ? "makeup" : activeTab;
    setProducts(getProductsByCategory(slug));
  }, [isMakeup, activeTab]);

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} style={{ paddingTop: 80, paddingBottom: 40, paddingLeft: 24, paddingRight: 24 }}>
      <motion.div variants={fadeUp} style={{ maxWidth: 1280, margin: "0 auto" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", color: G.pink, marginBottom: 8 }}>
          {isMakeup ? "Curated makeup and skincare for the modern woman." : "Collection"}
        </p>
        <h1 style={{ fontFamily: "'Sora', serif", fontSize: "clamp(1.5rem, 4vw, 3rem)", fontWeight: 600, color: G.text, marginBottom: 32 }}>
          {isMakeup ? "Makeup & Beauty" : "Fashion"}
        </h1>
        {!isMakeup && (
          <div style={{ display: "flex", gap: 4, marginBottom: 32, borderBottom: `1px solid ${G.border}` }}>
            {["bags", "clothes"].map((t) => (
              <motion.button
                key={t}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "10px 20px", fontSize: 12, fontWeight: activeTab === t ? 600 : 400,
                  color: activeTab === t ? G.pink : G.muted, background: "none", border: "none",
                  borderBottom: activeTab === t ? "2px solid #ec4899" : "2px solid transparent",
                  cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em",
                  transition: "all 0.2s",
                }}
              >
                {t}
                {activeTab === t && (
                  <motion.div layoutId="tabUnderline" style={{ height: 2, background: G.pink, borderRadius: 1, marginTop: 2 }} />
                )}
              </motion.button>
            ))}
          </div>
        )}
          <motion.div
            key={activeTab || "makeup"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}
          >
            {products.length === 0 ? (
              <motion.p variants={fadeUp} style={{ color: G.muted, fontSize: 14, gridColumn: "1/-1", textAlign: "center", padding: 40 }}>
                No products found in this category.
              </motion.p>
            ) : (
              products.map((p) => <ProductCard key={p.id} product={p} setPage={setPage} />)
            )}
          </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ProductDetail({ id, setPage }: { id: number; setPage: (p: Page) => void }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  useEffect(() => {
    const p = getProductById(id);
    setProduct(p || null);
    if (p) setRelated(getRelatedProducts(p.category_id, p.id));
    setQty(1); setMainImg(0);
  }, [id]);

  if (!product) {
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: 80, textAlign: "center", color: G.muted, padding: 24 }}>Product not found.</motion.div>;
  }

  const images = [product.image_url, product.hover_image_url];

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const catPage = product.category_slug === "makeup" ? { name: "makeup" as const } : { name: "fashion" as const, tab: product.category_slug === "clothes" ? "clothes" as const : "bags" as const };

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} style={{ paddingTop: 80, paddingBottom: 60, paddingLeft: 24, paddingRight: 24 }}>
      <motion.div variants={fadeUp} style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <motion.nav variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: G.muted, marginBottom: 24 }}>
          <motion.button whileHover={{ color: G.text }} onClick={() => setPage({ name: "home" })} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 11 }}>Home</motion.button>
          <span style={{ opacity: 0.4 }}>/</span>
          <motion.button whileHover={{ color: G.text }} onClick={() => setPage(catPage)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 11 }}>
            {product.category_name}
          </motion.button>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: G.text }}>{product.name}</span>
        </motion.nav>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          {/* Images */}
          <motion.div variants={scaleIn}>
            <motion.div
              style={{ position: "relative", background: "#1a1520", overflow: "hidden", aspectRatio: "3/4", marginBottom: 8, borderRadius: 12 }}
              whileHover={{ boxShadow: "0 20px 60px rgba(236,72,153,0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                key={mainImg}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={imgSrc(images[mainImg])}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.tag && <ProductBadge tag={product.tag} />}
            </motion.div>
            <div style={{ display: "flex", gap: 8 }}>
              {images.map((img, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMainImg(i)}
                  style={{
                    width: 64, height: 64, overflow: "hidden", background: "#1a1520", borderRadius: 8,
                    border: mainImg === i ? "2px solid #ec4899" : "2px solid transparent",
                    cursor: "pointer", padding: 0, opacity: mainImg === i ? 1 : 0.5,
                    transition: "opacity 0.3s",
                  }}
                >
                  <img src={imgSrc(img)} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: G.pink, fontWeight: 600 }}>{product.brand}</p>
            <h1 style={{ fontFamily: "'Sora', serif", fontSize: "clamp(1.3rem, 3vw, 2rem)", fontWeight: 600, color: G.text, lineHeight: 1.2 }}>{product.name}</h1>
            <StarRating rating={product.rating} reviews={product.reviews} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <motion.span key={product.price} initial={{ scale: 1.2, color: G.pink }} animate={{ scale: 1, color: G.text }} style={{ fontSize: 24, fontWeight: 600 }}>
                ${product.price.toFixed(2)}
              </motion.span>
              {product.original_price && (
                <>
                  <span style={{ fontSize: 16, color: G.muted, textDecoration: "line-through" }}>${product.original_price.toFixed(2)}</span>
                  <span style={{ fontSize: 11, color: G.pink, fontWeight: 600, background: "rgba(236,72,153,0.1)", padding: "2px 8px", borderRadius: 4 }}>
                    Save ${(product.original_price - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>{product.description}</p>

            {product.category_slug === "clothes" && (
              <motion.div variants={fadeUp}>
                <p style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 8 }}>Size</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {["XS", "S", "M", "L", "XL"].map((s) => (
                    <motion.button
                      key={s}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSize(s)}
                      style={{
                        width: 40, height: 36, fontSize: 12, fontWeight: 500,
                        border: `1px solid ${selectedSize === s ? G.pink : "rgba(255,255,255,0.15)"}`,
                        background: selectedSize === s ? "rgba(236,72,153,0.1)" : "transparent",
                        color: selectedSize === s ? G.pink : G.text, cursor: "pointer", borderRadius: 6,
                        transition: "all 0.2s",
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div variants={fadeUp}>
              <p style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 8 }}>Quantity</p>
              <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, overflow: "hidden" }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                  <Minus size={12} />
                </motion.button>
                <span style={{ width: 40, textAlign: "center", fontSize: 14, fontWeight: 600, color: G.text }}>{qty}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                  <Plus size={12} />
                </motion.button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} style={{ display: "flex", gap: 8, paddingTop: 8 }}>
              <motion.button
                whileHover={{ scale: 1.02, background: "#db2777" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                style={{
                  flex: 1, background: added ? "#10b981" : G.pink, color: "white", padding: "14px 24px", fontSize: 11,
                  fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer",
                  borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.3s",
                }}
              >
                <motion.span key={added ? "added-check" : "bag"} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  {added ? "✓" : "+"}
                </motion.span>
                {added ? "ADDED TO BAG" : "ADD TO BAG"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, borderColor: G.pink }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleWishlist(product.id)}
                style={{
                  width: 52, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)", background: "transparent", cursor: "pointer",
                }}
              >
                <Heart size={16} fill={isWishlisted(product.id) ? G.pink : "none"} color={isWishlisted(product.id) ? G.pink : "#94a3b8"} />
              </motion.button>
            </motion.div>

            <motion.div variants={fadeUp} style={{ borderTop: `1px solid ${G.border}`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Free delivery on orders over $150", "Free returns within 30 days", "Authenticity guaranteed on all items"].map((text) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: G.muted }}
                >
                  <motion.span whileHover={{ scale: 1.2 }} style={{ color: G.pink }}>✓</motion.span> {text}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <motion.div variants={fadeUp} style={{ marginTop: 60, borderTop: `1px solid ${G.border}`, paddingTop: 40 }}>
            <h2 style={{ fontFamily: "'Sora', serif", fontSize: 24, fontWeight: 600, color: G.text, marginBottom: 24 }}>You May Also Like</h2>
            <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>
              {related.map((p) => (
                <ProductCard key={p.id} product={p} setPage={setPage} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

function CartPage({ setPage }: { setPage: (p: Page) => void }) {
  const { cart, updateCartQty, removeFromCart } = useStore();
  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal === 0 ? 0 : (subtotal >= 150 ? 0 : 5.99);
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: 80, textAlign: "center", padding: "80px 24px" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>🛍</motion.div>
        <h2 style={{ fontFamily: "'Sora', serif", fontSize: 24, fontWeight: 600, color: G.text, marginBottom: 8 }}>Your Bag is Empty</h2>
        <p style={{ fontSize: 14, color: G.muted, marginBottom: 24 }}>You haven't added any products yet.</p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setPage({ name: "home" })}
          style={{
            background: G.pink, color: "white", padding: "12px 32px",
            fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
            border: "none", cursor: "pointer", borderRadius: 8,
          }}
        >
          Start Shopping
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} style={{ paddingTop: 80, paddingBottom: 40, paddingLeft: 24, paddingRight: 24 }}>
      <motion.div variants={fadeUp} style={{ maxWidth: 1024, margin: "0 auto" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", color: G.muted, marginBottom: 8 }}>Your Selection</p>
        <h1 style={{ fontFamily: "'Sora', serif", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 600, color: G.text, marginBottom: 32 }}>Shopping Bag</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }}>
          <motion.div variants={stagger} style={{ borderRadius: 12, backdropFilter: "blur(12px)", background: G.card, border: `1px solid ${G.border}`, padding: 24 }}>
            {cart.length === 0 ? (
              <p style={{ color: G.muted, fontSize: 14, textAlign: "center" }}>Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item, idx) => {
                  const p = item.product;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      layout
                      style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: `1px solid rgba(236,72,153,0.06)` }}
                    >
                      <motion.div whileHover={{ scale: 1.05 }} style={{ width: 60, height: 70, background: "#1a1520", flexShrink: 0, borderRadius: 8, overflow: "hidden" }}>
                        <img src={imgSrc(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                      </motion.div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: G.muted }}>{p.brand}</p>
                        <p style={{ fontSize: 13, fontWeight: 500, color: G.text }}>{p.name}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: G.text, marginTop: 4 }}>${(p.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden" }}>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateCartQty(p.id, item.quantity - 1)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                            <Minus size={10} />
                          </motion.button>
                          <motion.span key={item.quantity} initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ width: 28, textAlign: "center", fontSize: 12, fontWeight: 600, color: G.text }}>{item.quantity}</motion.span>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateCartQty(p.id, item.quantity + 1)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                            <Plus size={10} />
                          </motion.button>
                        </div>
                        <motion.button whileHover={{ scale: 1.15, color: "#ef4444" }} whileTap={{ scale: 0.85 }} onClick={() => removeFromCart(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, padding: 4 }}>
                          <X size={14} />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
                <div style={{ paddingTop: 16 }}>
                  <motion.button whileHover={{ x: -4 }} onClick={() => setPage({ name: "home" })} style={{
                    fontSize: 12, fontWeight: 600, color: G.muted, background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    ← Continue Shopping
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>

          <motion.div variants={fadeUp} style={{
            borderRadius: 12, backdropFilter: "blur(12px)", background: G.card, border: `1px solid ${G.border}`, padding: 24,
            position: "sticky", top: 80,
          }}>
            <h2 style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: G.text, borderBottom: `1px solid ${G.border}`, paddingBottom: 12, marginBottom: 16 }}>
              Order Summary
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <motion.div key={subtotal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#94a3b8" }}>
                <span>Subtotal</span>
                <span style={{ color: G.text }}>${subtotal.toFixed(2)}</span>
              </motion.div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#94a3b8" }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? "#10b981" : G.text }}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 14, color: G.text, borderTop: `1px solid ${G.border}`, paddingTop: 12 }}>
                <span>Total</span>
                <motion.span key={total} initial={{ scale: 1.2, color: G.pink }} animate={{ scale: 1, color: G.text }}>${total.toFixed(2)}</motion.span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, background: "#db2777" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPage({ name: "checkout" })}
              style={{
                width: "100%", marginTop: 20, background: G.pink, color: "white", padding: "14px 0",
                fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 8,
              }}
            >
              Proceed to Checkout
            </motion.button>
            {shipping > 0 && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 10, color: G.muted, textAlign: "center", marginTop: 8 }}>
                Add <strong style={{ color: G.text }}>${(150 - subtotal).toFixed(2)}</strong> more for free shipping!
              </motion.p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CheckoutPage({ setPage }: { setPage: (p: Page) => void }) {
  const { cart, clearCart } = useStore();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", address: "", city: "", postal: "", country: "Tunis", nameOnCard: "", cardNumber: "", expiry: "", cvv: "" });
  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 5.99;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.firstName || !form.lastName || !form.address || !form.city || !form.postal) {
      setError("Please fill in all contact and shipping fields.");
      return;
    }
    if (!form.nameOnCard || !form.cardNumber || !form.expiry || !form.cvv) {
      setError("Please fill in all payment details.");
      return;
    }
    try {
      createOrder({
        email: form.email, first_name: form.firstName, last_name: form.lastName,
        address: form.address, city: form.city, postal: form.postal, country: form.country,
        total_amount: total, items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity, unit_price: i.product.price })),
      });
      clearCart();
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ textAlign: "center", maxWidth: 320 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
            style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}
          >
            <motion.span
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              style={{ color: "#10b981", fontSize: 24 }}
            >
              ✓
            </motion.span>
          </motion.div>
          <h2 style={{ fontFamily: "'Sora', serif", fontSize: 24, fontWeight: 600, color: G.text, marginBottom: 8 }}>Order Confirmed!</h2>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
            Thank you for your purchase. A confirmation email will arrive at <strong style={{ color: G.text }}>{form.email}</strong> shortly.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPage({ name: "home" })}
            style={{
              marginTop: 24, background: G.pink, color: "white", padding: "12px 32px",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 8,
            }}
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (cart.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: 80, textAlign: "center", padding: 24 }}>
        <p style={{ color: G.muted, fontSize: 14 }}>Your cart is empty. Add items before checking out.</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setPage({ name: "home" })} style={{
            marginTop: 16, background: G.pink, color: "white", padding: "12px 32px",
            fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 8,
          }}
        >
          Shop Now
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} style={{ paddingTop: 80, paddingBottom: 40, paddingLeft: 24, paddingRight: 24 }}>
      <motion.div variants={fadeUp} style={{ maxWidth: 1024, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Sora', serif", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, color: G.text, marginBottom: 24 }}>Checkout</h1>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", padding: 12, fontSize: 13, marginBottom: 16, borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <motion.div variants={fadeUp}>
                <h3 style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: G.muted, marginBottom: 12 }}>Contact</h3>
                <input name="email" value={form.email} onChange={handleChange} placeholder="Email address" required style={inputStyle} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" required style={inputStyle} />
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" required style={inputStyle} />
                </div>
              </motion.div>
              <motion.div variants={fadeUp}>
                <h3 style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: G.muted, marginBottom: 12 }}>Shipping Address</h3>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Street address" required style={inputStyle} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="City" required style={inputStyle} />
                  <input name="postal" value={form.postal} onChange={handleChange} placeholder="Postal code" required style={inputStyle} />
                </div>
                <select name="country" value={form.country} onChange={handleChange} style={{ ...inputStyle, marginTop: 8 }}>
                  {["Tunis", "Sousse", "Hammamet", "Sfax", "Bizerte", "Nabeul", "Monastir", "Mahdia", "Gabes"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </motion.div>
              <motion.div variants={fadeUp}>
                <h3 style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: G.muted, marginBottom: 12 }}>Payment</h3>
                <input name="nameOnCard" value={form.nameOnCard} onChange={handleChange} placeholder="Name on card" required style={inputStyle} />
                <input name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="Card number" required maxLength={19} style={{ ...inputStyle, marginTop: 8 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                  <input name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM / YY" required maxLength={7} style={inputStyle} />
                  <input name="cvv" value={form.cvv} onChange={handleChange} placeholder="CVV" required maxLength={4} style={inputStyle} />
                </div>
              </motion.div>
            </div>
            <motion.div variants={fadeUp} style={{
              borderRadius: 12, backdropFilter: "blur(12px)", background: G.card, border: `1px solid ${G.border}`, padding: 24,
              position: "sticky", top: 80,
            }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: G.muted, marginBottom: 16 }}>Order Summary</h3>
              <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {cart.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    style={{ display: "flex", gap: 12 }}
                  >
                    <div style={{ width: 50, height: 60, background: "#1a1520", flexShrink: 0, borderRadius: 6, overflow: "hidden" }}>
                      <img src={imgSrc(item.product.image_url)} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 10, color: G.muted }}>{item.product.brand}</p>
                      <p style={{ fontSize: 12, fontWeight: 500, color: G.text }}>{item.product.name}</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: G.text }}>${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#94a3b8" }}>
                  <span>Subtotal</span><span style={{ color: G.text }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#94a3b8" }}>
                  <span>Shipping</span><span style={{ color: shipping === 0 ? "#10b981" : G.text }}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 14, color: G.text, borderTop: `1px solid ${G.border}`, paddingTop: 8 }}>
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02, background: "#db2777" }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                style={{
                  width: "100%", marginTop: 16, background: G.pink, color: "white", padding: "14px 0",
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 8,
                }}
              >
                Place Order · ${total.toFixed(2)}
              </motion.button>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function WishlistCard({ product, setPage, addedMap, handleAdd, toggleWishlist }: {
  product: Product; setPage: (p: Page) => void;
  addedMap: Record<number, boolean>;
  handleAdd: (p: Product, e: React.MouseEvent) => void;
  toggleWishlist: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      variants={scaleIn}
      animate={{ y: hovered ? -4 : 0 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => setPage({ name: "product", id: product.id })}
      style={{ cursor: "pointer" }}
    >
      <motion.div style={{ position: "relative", overflow: "hidden", background: "#1a1520", aspectRatio: "3/4", marginBottom: 12, borderRadius: 12 }}>
        <motion.div animate={{ scale: hovered ? 1.05 : 1 }} transition={{ duration: 0.5 }} style={{ width: "100%", height: "100%" }}>
          <img src={imgSrc(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          animate={{ opacity: hovered ? 1 : 0.85 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute", top: 8, right: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", borderRadius: "50%", zIndex: 10,
          }}
        >
          <Heart size={12} fill={G.pink} color={G.pink} />
        </motion.button>
        {product.stock > 0 ? (
          <motion.button
            onClick={(e) => handleAdd(product, e)}
            animate={{ y: hovered ? 0 : "100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0, background: addedMap[product.id] ? "#10b981" : "#1c1917", color: "white",
              fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase",
              padding: 12, border: "none", cursor: "pointer", zIndex: 10,
            }}
          >
            {addedMap[product.id] ? "✓ ADDED" : "ADD TO BAG"}
          </motion.button>
        ) : (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(100,50,50,0.8)", color: "white",
            fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase",
            padding: 12, textAlign: "center",
          }}>
            OUT OF STOCK
          </div>
        )}
      </motion.div>
      <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: G.muted, marginBottom: 4 }}>{product.brand}</p>
      <h3 style={{ fontSize: 13, fontWeight: 500, color: G.text, marginBottom: 4 }}>{product.name}</h3>
      <span style={{ fontSize: 14, fontWeight: 600, color: G.text }}>${product.price.toFixed(2)}</span>
    </motion.div>
  );
}

function WishlistPage({ setPage }: { setPage: (p: Page) => void }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (wishlist.length === 0) { setProducts([]); return; }
    const d = getDb();
    const placeholders = wishlist.map(() => "?").join(",");
    const r = d.exec(
      `SELECT p.*, c.slug as category_slug, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id IN (${placeholders})`,
      wishlist.map(String)
    );
    if (r[0]) {
      const idx: Record<string, number> = {};
      r[0].columns.forEach((col: string, i: number) => idx[col] = i);
      setProducts(r[0].values.map((row: any) => ({
        id: row[idx.id], category_id: row[idx.category_id], name: row[idx.name], brand: row[idx.brand],
        description: row[idx.description], price: row[idx.price], original_price: row[idx.original_price],
        stock: row[idx.stock], rating: row[idx.rating], reviews: row[idx.reviews], tag: row[idx.tag],
        image_url: row[idx.image_url], hover_image_url: row[idx.hover_image_url],
        category_slug: row[idx.category_slug], category_name: row[idx.category_name],
      })));
    } else setProducts([]);
  }, [wishlist]);

  const handleAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!addedMap[p.id]) {
      addToCart(p);
      setAddedMap((prev) => ({ ...prev, [p.id]: true }));
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [p.id]: false })), 1200);
    }
  };

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} style={{ paddingTop: 80, paddingBottom: 40, paddingLeft: 24, paddingRight: 24 }}>
      <motion.div variants={fadeUp} style={{ maxWidth: 1280, margin: "0 auto" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.45em", textTransform: "uppercase", color: G.muted, marginBottom: 8 }}>Your Saved Items</p>
        <h1 style={{ fontFamily: "'Sora', serif", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 600, color: G.text, marginBottom: 8 }}>Wishlist</h1>
        <p style={{ fontSize: 14, color: G.muted, marginBottom: 24 }}>{products.length} saved item{products.length !== 1 ? "s" : ""}</p>
        {products.length === 0 ? (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", padding: "60px 0" }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}
            >
              ♡
            </motion.div>
            <p style={{ color: G.muted, fontSize: 14 }}>Your wishlist is empty. Save items you love by clicking the heart icon.</p>
          </motion.div>
        ) : (
          <motion.div variants={stagger} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>
            {products.map((p) => (
              <WishlistCard key={p.id} product={p} setPage={setPage} addedMap={addedMap} handleAdd={handleAdd} toggleWishlist={toggleWishlist} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", fontSize: 14, background: "rgba(236,72,153,0.04)",
  border: `1px solid ${G.border}`, color: G.text, outline: "none",
  boxSizing: "border-box", borderRadius: 8, transition: "border-color 0.2s",
};

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      style={{ borderTop: `1px solid ${G.border}`, padding: "24px 0", textAlign: "center" }}
    >
      <p style={{ fontSize: 12, color: "#4a5568" }}>
        Girls Boutique — Built with React & SQL.js |
        <Link to="/" style={{ color: G.pink, textDecoration: "none" }}> Back to Portfolio</Link>
      </p>
    </motion.footer>
  );
}

export default function GirlsBoutique() {
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState<Page>({ name: "home" });
  const { cartCount } = useStore();

  useEffect(() => { initDb().then(() => setReady(true)); }, []);

  if (!ready) {
    return (
      <div style={{ background: G.bg, color: G.text, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <p style={{ fontSize: 14, color: G.muted }}>Loading Girls Boutique...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: G.bg, color: G.text, minHeight: "100vh" }}>
      <Navbar page={page} setPage={setPage} cartCount={cartCount} />
      <motion.main
        key={page.name + ("id" in page ? page.id : "") + ("tab" in page ? (page as any).tab || "" : "")}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }}
      >
        {page.name === "home" && <HomePage setPage={setPage} />}
        {(page.name === "makeup" || page.name === "fashion") && <ProductListing page={page} setPage={setPage} />}
        {page.name === "product" && <ProductDetail id={page.id} setPage={setPage} />}
        {page.name === "cart" && <CartPage setPage={setPage} />}
        {page.name === "checkout" && <CheckoutPage setPage={setPage} />}
        {page.name === "wishlist" && <WishlistPage setPage={setPage} />}
      </motion.main>
      <Footer />
    </div>
  );
}
