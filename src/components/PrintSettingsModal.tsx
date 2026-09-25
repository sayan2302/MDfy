"use client";

import React, { useState } from "react";
import { Printer, X, Sliders, FileText, Layers, Maximize, Info } from "lucide-react";

export interface PrintSettings {
  fontSize: "compact" | "normal" | "comfortable";
  diagramScale: "compact" | "medium" | "full";
  margin: "slim" | "normal" | "none";
}

interface PrintSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (settings: PrintSettings) => void;
}

export const PrintSettingsModal: React.FC<PrintSettingsModalProps> = ({
  isOpen,
  onClose,
  onPrint,
}) => {
  const [settings, setSettings] = useState<PrintSettings>({
    fontSize: "compact",
    diagramScale: "full",
    margin: "slim",
  });

  if (!isOpen) return null;

  const handlePrintSubmit = () => {
    onPrint(settings);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--bg-secondary)",
          borderRadius: "14px",
          border: "1px solid var(--border-strong)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          animation: "modalFadeIn 0.15s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.1rem 1.4rem",
            background: "var(--bg-tertiary)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                color: "#ffffff",
              }}
            >
              <Printer size={16} />
            </div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
              Print / PDF Export Settings
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: "1.4rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Option 1: Document Density / Font Scale */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "0.85rem",
                fontWeight: 650,
                color: "var(--text-primary)",
                marginBottom: "0.6rem",
              }}
            >
              <FileText size={15} style={{ color: "var(--accent-primary)" }} />
              <span>Document Density & Font Size</span>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              {[
                { id: "compact", label: "Compact", desc: "8.5pt · Max content" },
                { id: "normal", label: "Normal", desc: "10pt · Standard" },
                { id: "comfortable", label: "Large", desc: "11.5pt · Relaxed" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, fontSize: opt.id as PrintSettings["fontSize"] }))}
                  style={{
                    padding: "0.6rem 0.5rem",
                    borderRadius: "8px",
                    border: `1.5px solid ${settings.fontSize === opt.id ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                    background: settings.fontSize === opt.id ? "var(--accent-glow)" : "var(--bg-primary)",
                    color: settings.fontSize === opt.id ? "var(--accent-primary)" : "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{opt.label}</div>
                  <div style={{ fontSize: "0.68rem", opacity: 0.75, marginTop: "2px" }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Option 2: Diagram Scaling */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "0.85rem",
                fontWeight: 650,
                color: "var(--text-primary)",
                marginBottom: "0.6rem",
              }}
            >
              <Layers size={15} style={{ color: "var(--accent-primary)" }} />
              <span>Mermaid Diagram Scaling</span>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              {[
                { id: "full", label: "Full (100%)", desc: "Uncapped · Sharp & clear" },
                { id: "medium", label: "Balanced (85%)", desc: "Slight margin · Clear font" },
                { id: "compact", label: "Compact (70%)", desc: "Max 480px · Space saver" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, diagramScale: opt.id as PrintSettings["diagramScale"] }))}
                  style={{
                    padding: "0.6rem 0.5rem",
                    borderRadius: "8px",
                    border: `1.5px solid ${settings.diagramScale === opt.id ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                    background: settings.diagramScale === opt.id ? "var(--accent-glow)" : "var(--bg-primary)",
                    color: settings.diagramScale === opt.id ? "var(--accent-primary)" : "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{opt.label}</div>
                  <div style={{ fontSize: "0.68rem", opacity: 0.75, marginTop: "2px" }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Option 3: Page Margins */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "0.85rem",
                fontWeight: 650,
                color: "var(--text-primary)",
                marginBottom: "0.6rem",
              }}
            >
              <Maximize size={15} style={{ color: "var(--accent-primary)" }} />
              <span>Page Margin</span>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              {[
                { id: "slim", label: "Slim Margin", desc: "8mm · Balanced" },
                { id: "normal", label: "Normal Margin", desc: "12mm · Formal" },
                { id: "none", label: "Edge-to-Edge", desc: "0mm · Maximum width" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, margin: opt.id as PrintSettings["margin"] }))}
                  style={{
                    padding: "0.6rem 0.5rem",
                    borderRadius: "8px",
                    border: `1.5px solid ${settings.margin === opt.id ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                    background: settings.margin === opt.id ? "var(--accent-glow)" : "var(--bg-primary)",
                    color: settings.margin === opt.id ? "var(--accent-primary)" : "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{opt.label}</div>
                  <div style={{ fontSize: "0.68rem", opacity: 0.75, marginTop: "2px" }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Helpful Pro-Tip Notice */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              padding: "0.75rem 0.9rem",
              borderRadius: "8px",
              background: "rgba(2, 132, 199, 0.08)",
              border: "1px solid rgba(2, 132, 199, 0.2)",
              color: "var(--text-secondary)",
              fontSize: "0.78rem",
              lineHeight: "1.45",
            }}
          >
            <Info size={16} style={{ color: "var(--accent-primary)", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ color: "var(--text-primary)" }}>Architecture Blueprint Tip:</strong> To export massive multi-tier Mermaid diagrams at 100% natural scale with zero A4 clipping or squishing, use the <strong style={{ color: "var(--accent-primary)" }}>PDF Blueprint</strong> button directly on any diagram toolbar.
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.6rem",
            padding: "0.9rem 1.4rem",
            background: "var(--bg-tertiary)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <button
            onClick={onClose}
            className="diagram-btn"
            style={{ padding: "0.45rem 0.9rem", fontSize: "0.82rem" }}
          >
            Cancel
          </button>

          <button
            onClick={handlePrintSubmit}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 1.15rem",
              borderRadius: "7px",
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              color: "#ffffff",
              fontSize: "0.84rem",
              fontWeight: 650,
              border: "none",
              boxShadow: "0 2px 8px rgba(2, 132, 199, 0.35)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Printer size={15} />
            <span>Print Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
