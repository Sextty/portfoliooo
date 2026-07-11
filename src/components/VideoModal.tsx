import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string; // Path/URL or object URL from IndexedDB Blob
  projectTitle: string;
  projectColor?: string;
}

export function VideoModal({ isOpen, onClose, videoSrc, projectTitle, projectColor = "#ec4899" }: VideoModalProps) {
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
            background: "rgba(3,7,18,0.85)",
            backdropFilter: "blur(12px)",
            padding: 20,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 15, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 800,
              background: "rgba(15,23,42,0.6)",
              border: `1px solid ${projectColor}30`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: `0 24px 50px -12px ${projectColor}20`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(15,23,42,0.4)",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#f8fafc",
                  margin: 0,
                }}
              >
                Demo Recording — {projectTitle}
              </h3>
              <button
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f8fafc";
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#94a3b8";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Player */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#020617" }}>
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
