"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, Download, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { DiagramModal } from "./DiagramModal";

interface MermaidBlockProps {
  chart: string;
  theme?: string;
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCtrlHint, setShowCtrlHint] = useState(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const positionRef = useRef(position);
  positionRef.current = position;

  const [isMounted, setIsMounted] = useState(false);
  const reactId = useId().replace(/:/g, "_");
  const uniqueIdRef = useRef<string>("mermaid_" + reactId);
  const uniqueId = uniqueIdRef.current;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let isCurrent = true;

    const renderDiagram = async () => {
      try {
        setError(null);
        const activeTheme = theme || document.documentElement.getAttribute("data-theme") || "dark";
        const mermaidTheme = activeTheme === "light" ? "default" : "dark";

        mermaid.initialize({
          startOnLoad: false,
          theme: mermaidTheme,
          securityLevel: "loose",
          fontFamily: "var(--font-sans)",
          flowchart: { htmlLabels: true, curve: "basis" },
          sequence: { useMaxWidth: true },
          gantt: { useMaxWidth: true },
        });

        const cleanChart = chart.trim();
        if (!cleanChart) {
          setSvgHtml("");
          return;
        }

        const { svg } = await mermaid.render(uniqueId, cleanChart);
        if (isCurrent) {
          setSvgHtml(svg);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const errorElement = document.getElementById("d" + uniqueId);
          if (errorElement) errorElement.remove();
          setError(errMsg);
        }
      }
    };

    renderDiagram();

    return () => {
      isCurrent = false;
    };
  }, [chart, isMounted, theme]);

  // Non-passive wheel event listener to strictly block native browser zoom on Ctrl+Wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // PREVENT NATIVE BROWSER ZOOM COMPLETELY!
        e.preventDefault();
        e.stopPropagation();

        const currentScale = scaleRef.current;
        const currentPos = positionRef.current;

        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
        const newScale = Math.min(Math.max(currentScale * zoomFactor, 0.2), 6);

        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        const newX = mouseX - (mouseX - currentPos.x) * (newScale / currentScale);
        const newY = mouseY - (mouseY - currentPos.y) * (newScale / currentScale);

        setScale(newScale);
        setPosition({ x: newX, y: newY });
      } else {
        // User is scrolling the document through the diagram: show the helper hint
        setShowCtrlHint(true);
        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = setTimeout(() => setShowCtrlHint(false), 1500);
      }
    };

    el.addEventListener("wheel", handleWheelNative, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheelNative);
    };
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.25, 6));
  const handleZoomOut = () => setScale((s) => Math.max(s * 0.8, 0.2));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
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
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mermaid-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!svgHtml) return;
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
    canvas.width = width * 2;
    canvas.height = height * 2;
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
        a.download = `mermaid-${Date.now()}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
      } catch (err) {
        console.warn("Canvas tainted by foreignObject, falling back to SVG export:", err);
        handleDownloadSvg();
      }
    };
    img.src = url;
  };

  if (error) {
    return (
      <div className="mermaid-wrapper">
        <div className="mermaid-header-bar">
          <span className="mermaid-badge">Mermaid Syntax Error</span>
        </div>
        <div className="diagram-error">
          <div className="diagram-error-title">
            <AlertTriangle size={16} /> Syntax could not be parsed
          </div>
          <p style={{ margin: 0, opacity: 0.9 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mermaid-wrapper">
        <div className="mermaid-header-bar no-print">
          <span className="mermaid-badge">Mermaid Diagram</span>
          <div className="mermaid-actions">
            <button className="diagram-btn" onClick={handleDownloadSvg} title="Export as SVG">
              <Download size={13} style={{ marginRight: 4 }} /> SVG
            </button>
            <button className="diagram-btn" onClick={handleDownloadPng} title="Export as PNG">
              <ImageIcon size={13} style={{ marginRight: 4 }} /> PNG
            </button>
            <button
              className="diagram-btn"
              onClick={() => setIsModalOpen(true)}
              title="Open Infinite Canvas Studio"
              style={{
                background: "var(--accent-glow)",
                borderColor: "var(--accent-primary)",
                color: "var(--accent-primary)",
                fontWeight: 600,
              }}
            >
              <Maximize2 size={13} style={{ marginRight: 4 }} /> Infinite Canvas
            </button>
          </div>
        </div>

        <div
          className="mermaid-viewport"
          ref={containerRef}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            position: "relative",
            overflow: "hidden",
          }}
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
              width: "100%",
              display: "flex",
              justifyContent: "center",
              userSelect: "none",
            }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />

          {/* Quick Smart-Scroll Hint Toast */}
          {showCtrlHint && (
            <div
              style={{
                position: "absolute",
                top: "1rem",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(15, 23, 42, 0.92)",
                color: "#ffffff",
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 600,
                pointerEvents: "none",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
                zIndex: 20,
                animation: "modalFadeIn 0.15s ease-out",
              }}
            >
              💡 Hold <kbd style={{ background: "rgba(255,255,255,0.2)", padding: "2px 5px", borderRadius: "4px" }}>Ctrl</kbd> + Scroll to zoom diagram
            </div>
          )}

          {/* Floating Pan/Zoom Control HUD */}
          <div className="floating-controls no-print">
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 650,
                color: "var(--text-secondary)",
                padding: "0 0.35rem",
                fontFamily: "var(--font-mono)",
              }}
            >
              {Math.round(scale * 100)}%
            </span>
            <button className="ctrl-btn" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn size={14} />
            </button>
            <button className="ctrl-btn" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut size={14} />
            </button>
            <button className="ctrl-btn" onClick={handleResetZoom} title="Reset Pan & Zoom">
              <RotateCcw size={14} />
            </button>
            <button
              className="ctrl-btn"
              onClick={() => setIsModalOpen(true)}
              title="Open Fullscreen Infinite Canvas Studio"
              style={{ color: "var(--accent-primary)" }}
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <DiagramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        svgHtml={svgHtml}
      />
    </>
  );
};
