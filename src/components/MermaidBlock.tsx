"use client";

import React, { useEffect, useRef, useState, useId, useMemo } from "react";
import mermaid from "mermaid";
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  AlertTriangle,
  Image as ImageIcon,
  FileText,
  Layers,
  BookOpen,
  Globe,
} from "lucide-react";
import { DiagramModal } from "./DiagramModal";
import { exportDiagramToPdf } from "@/utils/exportDiagramPdf";
import { exportDiagramToHtml } from "@/utils/exportDiagramHtml";
import { deconstructMermaid } from "@/utils/deconstructMermaid";
import { RenderedMermaidPlate } from "./RenderedMermaidPlate";

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
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<"canvas" | "chapters">("canvas");
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const positionRef = useRef(position);
  positionRef.current = position;

  const [isMounted, setIsMounted] = useState(false);
  const reactId = useId().replace(/:/g, "_");
  const uniqueIdRef = useRef<string>("mermaid_" + reactId);
  const uniqueId = uniqueIdRef.current;

  // Compute Subgraph Deconstruction ("Executive Map + Detailed Tier Chapters")
  const deconstructed = useMemo(() => deconstructMermaid(chart), [chart]);

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
  }, [chart, isMounted, theme, uniqueId]);

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

  const handleDownloadPdf = () => {
    try {
      setIsExportingPdf(true);
      exportDiagramToPdf(svgHtml, "mermaid-architecture");
    } catch (err) {
      console.error("PDF Blueprint export failed:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    try {
      exportDiagramToHtml(svgHtml, "mermaid-architecture", theme === "light" ? "light" : "dark");
    } catch (err) {
      console.error("HTML Canvas export failed:", err);
    }
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
      <div className={`mermaid-wrapper ${deconstructed.isDeconstructible ? "mermaid-has-deconstruction" : ""}`}>
        {/* Header Toolbar */}
        <div className="mermaid-header-bar no-print">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="mermaid-badge">Mermaid Diagram</span>

            {/* Approach 1: Subgraph Deconstruction Switcher (for multi-tier diagrams) */}
            {deconstructed.isDeconstructible && (
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  background: "var(--bg-tertiary)",
                  padding: "2px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("canvas")}
                  title="Interactive Pan & Zoom Canvas"
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    background: activeTab === "canvas" ? "var(--bg-primary)" : "transparent",
                    color: activeTab === "canvas" ? "var(--accent-primary)" : "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Layers size={12} /> Canvas View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("chapters")}
                  title="Preview Executive Map & Detailed Tier Chapters"
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    background: activeTab === "chapters" ? "var(--bg-primary)" : "transparent",
                    color: activeTab === "chapters" ? "var(--accent-primary)" : "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <BookOpen size={12} /> Tier Chapters ({deconstructed.chapters.length})
                </button>
              </div>
            )}
          </div>

          <div className="mermaid-actions">
            <button className="diagram-btn" onClick={handleDownloadSvg} title="Export as SVG">
              <Download size={13} style={{ marginRight: 4 }} /> SVG
            </button>
            <button className="diagram-btn" onClick={handleDownloadPng} title="Export as PNG">
              <ImageIcon size={13} style={{ marginRight: 4 }} /> PNG
            </button>
            <button
              className="diagram-btn"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              title="Export as Standalone Vector Blueprint PDF (420x297mm A3 Blueprint Canvas)"
              style={{
                background: "var(--accent-glow)",
                borderColor: "var(--accent-primary)",
                color: "var(--accent-primary)",
                fontWeight: 650,
              }}
            >
              <FileText size={13} style={{ marginRight: 4 }} /> {isExportingPdf ? "PDF..." : "PDF Blueprint"}
            </button>
            <button
              className="diagram-btn"
              onClick={handleDownloadHtml}
              title="Export as Standalone Interactive HTML Canvas (Zero Dependencies, Offline Pan, Zoom & Search)"
              style={{
                background: "rgba(14, 165, 233, 0.12)",
                borderColor: "rgba(14, 165, 233, 0.4)",
                color: "var(--accent-primary)",
                fontWeight: 650,
              }}
            >
              <Globe size={13} style={{ marginRight: 4 }} /> HTML Canvas
            </button>
            <button
              className="diagram-btn"
              onClick={() => setIsModalOpen(true)}
              title="Open Infinite Canvas Studio"
              style={{
                background: "var(--bg-primary)",
                fontWeight: 600,
              }}
            >
              <Maximize2 size={13} style={{ marginRight: 4 }} /> Infinite Canvas
            </button>
          </div>
        </div>

        {/* 1. On-Screen Interactive View */}
        {activeTab === "canvas" ? (
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
        ) : (
          /* Interactive Chapters Screen View */
          <div
            className="mermaid-chapters-screen-view no-print"
            style={{
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              background: "var(--bg-primary)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.6rem 0.85rem",
                background: "rgba(2, 132, 199, 0.08)",
                borderRadius: "8px",
                border: "1px solid rgba(2, 132, 199, 0.2)",
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                🏛️ <strong style={{ color: "var(--accent-primary)" }}>Approach 1 (Active):</strong> In PDF document export, this multi-tier architecture automatically prints as an Executive Overview Map followed by dedicated 100% vector scale tier chapters.
              </div>
            </div>

            {/* Executive Map Plate */}
            <RenderedMermaidPlate
              plateId={`${reactId}_exec_screen`}
              code={deconstructed.executiveMapCode}
              theme={theme}
              title="🏛️ System Architecture — Executive Overview Map"
              subtitle="Abstracted high-level topology connecting all primary architectural domains and subgraphs"
              badge="Executive Map"
            />

            {/* Each Chapter Plate */}
            {deconstructed.chapters.map((ch, idx) => (
              <RenderedMermaidPlate
                key={ch.id}
                plateId={`${reactId}_ch_${idx}_screen`}
                code={ch.code}
                theme={theme}
                title={`📖 Chapter ${idx + 1}: ${ch.title}`}
                subtitle="Dedicated Architecture Subgraph Deep-Dive · Full 100% Vector Scale"
                badge={`Layer ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* 2. Deconstructed Print Suite (Cleanly formatted for @media print) */}
        {deconstructed.isDeconstructible && (
          <div className="mermaid-deconstructed-print-suite">
            {/* Executive Overview Map Plate */}
            <div className="executive-map-plate">
              <div className="tier-chapter-header">
                <span className="tier-chapter-title">🏛️ System Architecture — Executive Overview Map</span>
                <span className="tier-chapter-badge">Executive Map</span>
              </div>
              <div className="tier-chapter-subtitle" style={{ marginBottom: "0.75rem", fontSize: "8.5pt", color: "#64748b" }}>
                High-level multi-tier schematic. Detailed deep-dive chapters for Layers 1 through {deconstructed.chapters.length} follow on subsequent pages at 100% vector scale.
              </div>
              <RenderedMermaidPlate
                plateId={`${reactId}_exec_print`}
                code={deconstructed.executiveMapCode}
                theme="light"
                title="System Architecture — Executive Overview Map"
                showExportButton={false}
              />
            </div>

            {/* Detailed Tier Chapters */}
            {deconstructed.chapters.map((ch, idx) => (
              <div key={ch.id} className="tier-chapter-plate">
                <div className="tier-chapter-header">
                  <span className="tier-chapter-title">📖 Chapter {idx + 1}: {ch.title}</span>
                  <span className="tier-chapter-badge">Layer {idx + 1} Deep-Dive</span>
                </div>
                <div className="tier-chapter-subtitle" style={{ marginBottom: "0.75rem", fontSize: "8.5pt", color: "#64748b" }}>
                  Dedicated Architecture Subgraph Plate · Rendered at 100% Vector Resolution
                </div>
                <RenderedMermaidPlate
                  plateId={`${reactId}_ch_${idx}_print`}
                  code={ch.code}
                  theme="light"
                  title={`Chapter ${idx + 1}: ${ch.title}`}
                  showExportButton={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <DiagramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        svgHtml={svgHtml}
      />
    </>
  );
};
