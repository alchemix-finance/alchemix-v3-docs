import React, { useRef, useState } from "react";
// import styles from './VisualizerFrame.module.css';

export default function VisualizerFrame({ url, title }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: isFullscreen ? "100vh" : "650px",
        border: "1px solid var(--ifm-color-emphasis-200)",
        borderRadius: isFullscreen ? "0" : "8px",
        overflow: "hidden",
        marginBottom: "2rem",
        backgroundColor: "#000",
      }}
    >
      {/* The Fullscreen Toggle Button */}
      <button
        onClick={toggleFullScreen}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 10,
          padding: "8px 12px",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "0.9rem",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor = "rgba(0, 0, 0, 0.8)")
        }
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor = "rgba(0, 0, 0, 0.6)")
        }
      >
        {isFullscreen ? "Exit Fullscreen" : "⛶ Fullscreen"}
      </button>

      <iframe
        src={url}
        title={title}
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      />
    </div>
  );
}
