"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize, Download, Image as ImageIcon, FileText } from "lucide-react";
import { exportDiagramToPdf } from "@/utils/exportDiagramPdf";

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgHtml: string;
  diagramTitle?: string;
}

export const DiagramModal: React.FC<DiagramModalProps> = ({
  isOpen,
  onClose,
  svgHtml,
  diagramTitle = "Interactive Architecture Canvas",
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const positionRef = useRef(position);
  positionRef.current = position;

  const contentRef = useRef<HTMLDivElement>(null);

  const handleFitToScreen = useCallback(() => {
    if (!contentRef.current) return;
    const svgEl = contentRef.current.querySelector("svg");
    if (!svgEl) return;

    let svgW = 0;
    let svgH = 0;

    const viewBox = svgEl.getAttribute("viewBox");
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        svgW = parts[2];
        svgH = parts[3];
      }
    }

    if (!svgW || !svgH) {
      try {
        const bbox = svgEl.getBBox();
        svgW = bbox.width;
        svgH = bbox.height;
      } catch {
        svgW = parseFloat(svgEl.getAttribute("width") || "800") || 800;
        svgH = parseFloat(svgEl.getAttribute("height") || "600") || 600;
      }
    }

    // Explicitly set the SVG intrinsic dimensions so scaling works 1:1
    svgEl.style.width = `${svgW}px`;
    svgEl.style.height = `${svgH}px`;
    svgEl.style.maxWidth = "none";
    svgEl.style.maxHeight = "none";

    const containerRect = contentRef.current.getBoundingClientRect();
    const containerW = containerRect.width || window.innerWidth;
    const containerH = containerRect.height || (window.innerHeight - 60);

    if (containerW > 0 && containerH > 0 && svgW > 0 && svgH > 0) {
      const paddingRatio = 0.88;
      const scaleX = (containerW * paddingRatio) / svgW;
      const scaleY = (containerH * paddingRatio) / svgH;
      const fitScale = Math.min(scaleX, scaleY);
      // Uncapped lower bound so even massive diagrams fit completely inside the screen
      const optimalScale = Math.min(Math.max(fitScale, 0.05), 3);
      setScale(optimalScale);
      setPosition({ x: 0, y: 0 });
    }
  }, []);

  // When modal opens: auto-fit to screen by default across initial animation frames
  useEffect(() => {
    if (!isOpen) return;

    const frameId = requestAnimationFrame(() => {
      handleFitToScreen();
    });
    const timer1 = setTimeout(handleFitToScreen, 50);
    const timer2 = setTimeout(handleFitToScreen, 150);

    const handleResize = () => {
      handleFitToScreen();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, handleFitToScreen]);

  // Global window listeners when modal is open: Esc to close, keyboard shortcuts, prevent browser zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s * 1.2, 10));
      if (e.key === "-") setScale((s) => Math.max(s * 0.83, 0.05));
      if (e.key === "0") {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
      if (e.key.toLowerCase() === "f") handleFitToScreen();
    };

    // Prevent native browser zoom (Ctrl + Wheel) anywhere while modal is open
    const preventBrowserZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", preventBrowserZoom, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", preventBrowserZoom);
    };
  }, [isOpen, onClose, handleFitToScreen]);

  // Non-passive native wheel listener directly on the canvas viewport
  // This guarantees direct mousewheel zooming without triggering browser page zoom
  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      // PREVENT BROWSER ZOOMING AND PAGE SCROLL
      e.preventDefault();
      e.stopPropagation();

      const currentScale = scaleRef.current;
      const currentPos = positionRef.current;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newScale = Math.min(Math.max(currentScale * zoomFactor, 0.05), 10);

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const newX = mouseX - (mouseX - currentPos.x) * (newScale / currentScale);
      const newY = mouseY - (mouseY - currentPos.y) * (newScale / currentScale);

      setScale(newScale);
      setPosition({ x: newX, y: newY });
    };

    el.addEventListener("wheel", handleWheelNative, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheelNative);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.25, 10));
  const handleZoomOut = () => setScale((s) => Math.max(s * 0.8, 0.05));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDownloadSvg = () => {
    const blob = new Blob([svgHtml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mdfy-diagram-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgHtml, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (!svgEl) return;

    let width = 1200;
    let height = 800;
    const viewBox = svgEl.getAttribute("viewBox");
    if (viewBox) {
      const parts = viewBox.split(/\s+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    } else {
      width = parseInt(svgEl.getAttribute("width") || "1200", 10) || 1200;
      height = parseInt(svgEl.getAttribute("height") || "800", 10) || 800;
    }

    const canvas = document.createElement("canvas");
    const scaleFactor = 3; // Ultra-crisp 3x rasterization
    canvas.width = width * scaleFactor;
    canvas.height = height * scaleFactor;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgHtml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        ctx.fillStyle = document.documentElement.getAttribute("data-theme") === "light" ? "#ffffff" : "#0b0f17";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        const a = document.createElement("a");
        a.download = `mdfy-diagram-${Date.now()}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
      } catch (err) {
        console.warn("Canvas tainted by foreignObject, falling back to SVG export:", err);
        handleDownloadSvg();
      }
    };
    img.src = url;
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportDiagramToPdf(svgHtml, diagramTitle);
    } catch (err) {
      console.error("PDF Blueprint export failed:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.88)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onClick={onClose}
    >
      {/* Top Modal Navigation Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.8rem 1.4rem",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-strong)",
          zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
            {diagramTitle}
          </span>
          <button
            onClick={handleFitToScreen}
            title="Click to auto fit diagram to screen"
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.2rem 0.6rem",
              borderRadius: "5px",
              background: "var(--bg-tertiary)",
              color: "var(--accent-primary)",
              fontFamily: "var(--font-mono)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
            }}
          >
            {Math.round(scale * 100)}%
          </button>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <button className="diagram-btn" onClick={handleZoomIn} title="Zoom In (+)">
            <ZoomIn size={14} style={{ marginRight: 4 }} /> Zoom In
          </button>
          <button className="diagram-btn" onClick={handleZoomOut} title="Zoom Out (-)">
            <ZoomOut size={14} style={{ marginRight: 4 }} /> Zoom Out
          </button>
          <button className="diagram-btn" onClick={handleFitToScreen} title="Fit to Screen (F)">
            <Maximize size={14} style={{ marginRight: 4 }} /> Fit Screen
          </button>
          <button className="diagram-btn" onClick={handleReset} title="Reset to 100% (0)">
            <RotateCcw size={14} style={{ marginRight: 4 }} /> 100%
          </button>
          <div style={{ width: 1, height: 20, background: "var(--border-strong)", margin: "0 4px" }} />
          <button className="diagram-btn" onClick={handleDownloadSvg} title="Export Vector SVG">
            <Download size={14} style={{ marginRight: 4 }} /> SVG
          </button>
          <button className="diagram-btn" onClick={handleDownloadPng} title="Export 3x High-Res PNG">
            <ImageIcon size={14} style={{ marginRight: 4 }} /> PNG
          </button>
          <button
            className="diagram-btn"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            title="Export as Standalone Vector Blueprint PDF (Custom Size, No A4 Squeezing)"
            style={{
              background: "var(--accent-glow)",
              color: "var(--accent-primary)",
              borderColor: "var(--accent-primary)",
              fontWeight: 650,
            }}
          >
            <FileText size={14} style={{ marginRight: 4 }} />
            {isExportingPdf ? "Generating PDF..." : "PDF Blueprint"}
          </button>
          <button
            onClick={onClose}
            className="diagram-btn"
            style={{
              marginLeft: 8,
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.35)",
            }}
            title="Close Canvas (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Infinite Canvas Viewport with Dot-Grid Background */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: "var(--bg-primary)",
          backgroundImage: "radial-gradient(var(--border-strong) 1.2px, transparent 1.2px)",
          backgroundSize: `${Math.max(16, 24 * Math.min(scale, 1.8))}px ${Math.max(16, 24 * Math.min(scale, 1.8))}px`,
          backgroundPosition: `${position.x}px ${position.y}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={handleFitToScreen}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />

        {/* Floating Canvas Navigation Hints */}
        <div
          style={{
            position: "absolute",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-surface)",
            backdropFilter: "blur(8px)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "20px",
            padding: "0.4rem 1rem",
            fontSize: "0.76rem",
            color: "var(--text-secondary)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <span>🖱️ Click & Drag to pan</span>
          <span>•</span>
          <span>📜 Scroll wheel to zoom (Direct)</span>
          <span>•</span>
          <span>Double-click or [F] to Fit</span>
        </div>
      </div>
    </div>
  );
};
