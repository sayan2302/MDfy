"use client";

import React, { useEffect, useState } from "react";
import mermaid from "mermaid";
import { FileText, Download, AlertTriangle } from "lucide-react";
import { exportDiagramToPdf } from "@/utils/exportDiagramPdf";

interface RenderedMermaidPlateProps {
  plateId: string;
  code: string;
  theme?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  showExportButton?: boolean;
}

export const RenderedMermaidPlate: React.FC<RenderedMermaidPlateProps> = ({
  plateId,
  code,
  theme,
  title,
  subtitle,
  badge,
  className = "",
  showExportButton = true,
}) => {
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    const renderCode = async () => {
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
        });

        const safeId = "plate_" + plateId.replace(/[^a-zA-Z0-9_-]/g, "_");
        const { svg } = await mermaid.render(safeId, code.trim());
        if (isCurrent) {
          setSvgHtml(svg);
        }
      } catch (err: unknown) {
        if (isCurrent) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const safeId = "plate_" + plateId.replace(/[^a-zA-Z0-9_-]/g, "_");
          const errorElement = document.getElementById("d" + safeId);
          if (errorElement) errorElement.remove();
          setError(errMsg);
        }
      }
    };

    renderCode();

    return () => {
      isCurrent = false;
    };
  }, [plateId, code, theme]);

  const handleExportPlatePdf = () => {
    if (!svgHtml) return;
    try {
      setIsExporting(true);
      exportDiagramToPdf(svgHtml, title);
    } catch (e) {
      console.error("Plate PDF export error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`architecture-plate-card ${className}`}>
      {/* Plate Header Bar */}
      <div className="plate-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="plate-title">{title}</span>
            {badge && <span className="plate-badge">{badge}</span>}
          </div>
          {subtitle && <div className="plate-subtitle">{subtitle}</div>}
        </div>

        {showExportButton && (
          <div className="plate-actions no-print">
            <button
              onClick={handleDownloadSvg}
              className="diagram-btn"
              title="Download SVG for this plate"
              style={{ padding: "0.25rem 0.55rem", fontSize: "0.72rem" }}
            >
              <Download size={12} style={{ marginRight: 3 }} /> SVG
            </button>
            <button
              onClick={handleExportPlatePdf}
              disabled={isExporting || !svgHtml}
              className="diagram-btn"
              title="Download standalone A3 Blueprint PDF for this tier plate"
              style={{
                padding: "0.25rem 0.55rem",
                fontSize: "0.72rem",
                background: "var(--accent-glow)",
                borderColor: "var(--accent-primary)",
                color: "var(--accent-primary)",
                fontWeight: 600,
              }}
            >
              <FileText size={12} style={{ marginRight: 3 }} />
              {isExporting ? "PDF..." : "PDF Blueprint"}
            </button>
          </div>
        )}
      </div>

      {/* Plate Body SVG */}
      <div className="plate-content">
        {error ? (
          <div className="diagram-error" style={{ margin: "1rem" }}>
            <div className="diagram-error-title">
              <AlertTriangle size={15} /> Plate syntax error
            </div>
            <p style={{ margin: 0, fontSize: "0.75rem" }}>{error}</p>
          </div>
        ) : svgHtml ? (
          <div
            className="plate-svg-wrapper"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", opacity: 0.6, fontSize: "0.8rem" }}>
            Rendering architecture plate...
          </div>
        )}
      </div>
    </div>
  );
};
