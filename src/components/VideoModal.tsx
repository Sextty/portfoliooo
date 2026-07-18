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

export function VideoModal({ isOpen, onClose, videoSrc, projectTitle, projectColor = "#2B50E0" }: VideoModalProps) {
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
            background: "rgba(15,18,34,0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            padding: 20,
          }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Demo video: ${projectTitle}`}
            initial={{ scale: 0.94, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 15, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 840,
              background: "#ffffff",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 40px 100px -20px rgba(15,18,34,0.45)",
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
                borderBottom: "1px solid #EFF1F6",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 14.5,
                  color: "#0F1222",
                  margin: 0,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: projectColor,
                    display: "inline-block",
                  }}
                />
                {projectTitle} — demo video
              </h3>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close video"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: "#ffffff",
                  border: "1px solid #E6E8F0",
                  color: "#566070",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#2B50E0";
                  e.currentTarget.style.borderColor = "#2B50E0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#566070";
                  e.currentTarget.style.borderColor = "#E6E8F0";
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Player */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#0F1222" }}>
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
