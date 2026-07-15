import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string; // Path/URL or object URL from IndexedDB Blob
  projectTitle: string;
  projectColor?: string;
}

export function VideoModal({ isOpen, onClose, videoSrc, projectTitle, projectColor = "#FF5C39" }: VideoModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent background scroll when video is playing
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape closes the modal; move focus to the close button on open
  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(7,21,39,0.92)",
            padding: 20,
          }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Demo video: ${projectTitle}`}
            initial={{ scale: 0.92, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 15, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 800,
              background: "#0b1e36",
              border: `1px solid ${projectColor}`,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: `0 24px 60px -12px rgba(3,10,20,0.7)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(127,163,201,0.18)",
                background: "rgba(7,21,39,0.6)",
              }}
            >
              <h3
                className="mono"
                style={{
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#e6eef7",
                  margin: 0,
                }}
              >
                <span style={{ color: projectColor }}>DEMO</span> — {projectTitle}
              </h3>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close video"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: "transparent",
                  border: "1px solid rgba(127,163,201,0.28)",
                  color: "#7fa3c9",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#ff5c39";
                  e.currentTarget.style.borderColor = "#ff5c39";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#7fa3c9";
                  e.currentTarget.style.borderColor = "rgba(127,163,201,0.28)";
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Player */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#071527" }}>
              <video
                src={videoSrc}
                controls
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
