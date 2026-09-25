"use client";

import React, { useState } from "react";
import {
  FileText,
  Columns,
  Eye,
  Edit3,
  Copy,
  Check,
  Code2,
  Printer,
  Trash2,
  Sparkles,
  Sun,
  Moon,
  Link2,
  Link2Off,
} from "lucide-react";
import { Theme } from "@/hooks/useTheme";

export type ViewMode = "split" | "editor" | "preview";

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  syncScroll: boolean;
  onToggleSyncScroll: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  onCopyMarkdown: () => Promise<void>;
  onCopyHtml: () => Promise<void>;
  onPrint: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  syncScroll,
  onToggleSyncScroll,
  onLoadSample,
  onClear,
  onCopyMarkdown,
  onCopyHtml,
  onPrint,
  theme,
  onToggleTheme,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleCopyMd = async () => {
    await onCopyMarkdown();
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyHtml = async () => {
    await onCopyHtml();
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <header
      className="app-header no-print"
      style={{
        height: "56px",
        background: "var(--bg-surface)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.25rem",
        zIndex: 50,
        userSelect: "none",
      }}
    >
      {/* Brand & Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #0284c7 0%, #818cf8 100%)",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(2, 132, 199, 0.35)",
          }}
        >
          <FileText size={18} strokeWidth={2.5} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.2rem",
              letterSpacing: "-0.03em",
              background: "linear-gradient(90deg, var(--text-primary) 0%, var(--accent-primary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            MDfy
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "0.15rem 0.4rem",
              borderRadius: "4px",
              background: "var(--accent-glow)",
              color: "var(--accent-primary)",
              textTransform: "uppercase",
            }}
          >
            Studio
          </span>
        </div>
      </div>

      {/* Center: View Switcher Segmented Control */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--bg-tertiary)",
          padding: "3px",
          borderRadius: "8px",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <button
          onClick={() => onViewModeChange("editor")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: 600,
            border: "none",
            background: viewMode === "editor" ? "var(--bg-primary)" : "transparent",
            color: viewMode === "editor" ? "var(--accent-primary)" : "var(--text-secondary)",
            boxShadow: viewMode === "editor" ? "var(--shadow-sm)" : "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title="Editor Only View"
        >
          <Edit3 size={14} />
          <span>Editor</span>
        </button>

        <button
          onClick={() => onViewModeChange("split")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: 600,
            border: "none",
            background: viewMode === "split" ? "var(--bg-primary)" : "transparent",
            color: viewMode === "split" ? "var(--accent-primary)" : "var(--text-secondary)",
            boxShadow: viewMode === "split" ? "var(--shadow-sm)" : "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title="Side-by-Side Split View"
        >
          <Columns size={14} />
          <span>Split</span>
        </button>

        <button
          onClick={() => onViewModeChange("preview")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: 600,
            border: "none",
            background: viewMode === "preview" ? "var(--bg-primary)" : "transparent",
            color: viewMode === "preview" ? "var(--accent-primary)" : "var(--text-secondary)",
            boxShadow: viewMode === "preview" ? "var(--shadow-sm)" : "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title="Full Preview Reading Mode"
        >
          <Eye size={14} />
          <span>Preview</span>
        </button>
      </div>

      {/* Right: Quick Action Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {/* Sync Scroll Toggle */}
        {viewMode === "split" && (
          <button
            className="diagram-btn"
            onClick={onToggleSyncScroll}
            title={syncScroll ? "Synchronized Scrolling Enabled" : "Synchronized Scrolling Disabled"}
            style={{
              color: syncScroll ? "var(--accent-primary)" : "var(--text-muted)",
              borderColor: syncScroll ? "var(--accent-primary)" : "var(--border-subtle)",
            }}
          >
            {syncScroll ? <Link2 size={14} style={{ marginRight: 4 }} /> : <Link2Off size={14} style={{ marginRight: 4 }} />}
            <span>Sync</span>
          </button>
        )}

        {/* Load Showcase Sample */}
        <button
          className="diagram-btn"
          onClick={onLoadSample}
          title="Reload Demo Showcase Document"
        >
          <Sparkles size={14} style={{ marginRight: 4, color: "#eab308" }} />
          <span>Showcase</span>
        </button>

        {/* Clear Scratchpad */}
        <button
          className="diagram-btn"
          onClick={onClear}
          title="Clear Editor Canvas"
          style={{ color: "#f43f5e" }}
        >
          <Trash2 size={14} style={{ marginRight: 4 }} />
          <span>Clear</span>
        </button>

        <div style={{ width: 1, height: 22, background: "var(--border-subtle)", margin: "0 2px" }} />

        {/* Copy Raw Markdown */}
        <button
          className="diagram-btn"
          onClick={handleCopyMd}
          title="Copy Raw Markdown to Clipboard"
        >
          {copiedMd ? <Check size={14} style={{ color: "#10b981", marginRight: 4 }} /> : <Copy size={14} style={{ marginRight: 4 }} />}
          <span>{copiedMd ? "Copied!" : "Copy MD"}</span>
        </button>

        {/* Copy Rendered HTML */}
        <button
          className="diagram-btn"
          onClick={handleCopyHtml}
          title="Copy Rendered HTML"
        >
          {copiedHtml ? <Check size={14} style={{ color: "#10b981", marginRight: 4 }} /> : <Code2 size={14} style={{ marginRight: 4 }} />}
          <span>{copiedHtml ? "Copied!" : "HTML"}</span>
        </button>

        {/* Print / Export to PDF */}
        <button
          onClick={onPrint}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.4rem 0.85rem",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
            color: "#ffffff",
            fontSize: "0.82rem",
            fontWeight: 600,
            border: "none",
            boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title="Print or Save as Vector PDF (Ctrl + P)"
        >
          <Printer size={15} />
          <span>Print / PDF</span>
        </button>

        <div style={{ width: 1, height: 22, background: "var(--border-subtle)", margin: "0 2px" }} />

        {/* Theme Switcher Toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "7px",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={16} style={{ color: "#facc15" }} /> : <Moon size={16} style={{ color: "#818cf8" }} />}
        </button>
      </div>
    </header>
  );
};
