"use client";

/**
 * Utility to export a Mermaid diagram as a standalone, custom-sized Architecture Blueprint PDF.
 * Uses jsPDF and svg2pdf.js for client-side vector PDF generation that matches the diagram's
 * exact intrinsic dimensions (no A4 squeezing, no micro-fonts, zero clipping).
 */

export async function exportDiagramToPdf(
  svgHtml: string,
  diagramTitle = "architecture-blueprint"
): Promise<void> {
  if (typeof window === "undefined") return;

  const parser = new DOMParser();
  const docParsed = parser.parseFromString(svgHtml, "image/svg+xml");
  const svgEl = docParsed.querySelector("svg");
  if (!svgEl) {
    throw new Error("No SVG element found in the provided HTML");
  }

  // Calculate intrinsic dimensions from viewBox or attributes
  let width = 1200;
  let height = 800;
  const viewBox = svgEl.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      width = parts[2];
      height = parts[3];
    }
  } else {
    width = parseFloat(svgEl.getAttribute("width") || "1200") || 1200;
    height = parseFloat(svgEl.getAttribute("height") || "800") || 800;
  }

  // Add blueprint padding around the diagram
  const padding = 36; // 36pt (~0.5 in)
  const pageWidth = Math.ceil(width + padding * 2);
  const pageHeight = Math.ceil(height + padding * 2);

  // Set explicit width and height on SVG
  svgEl.setAttribute("width", `${width}`);
  svgEl.setAttribute("height", `${height}`);
  svgEl.style.width = `${width}px`;
  svgEl.style.height = `${height}px`;
  svgEl.style.maxWidth = "none";
  svgEl.style.maxHeight = "none";

  // Temporary DOM container so svg2pdf can compute styles
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "fixed";
  tempContainer.style.left = "-99999px";
  tempContainer.style.top = "-99999px";
  tempContainer.style.width = `${pageWidth}px`;
  tempContainer.style.height = `${pageHeight}px`;
  tempContainer.style.visibility = "hidden";
  tempContainer.style.zIndex = "-1";
  tempContainer.appendChild(svgEl);
  document.body.appendChild(tempContainer);

  try {
    const { jsPDF } = await import("jspdf");
    await import("svg2pdf.js");

    const pdf = new jsPDF({
      orientation: pageWidth >= pageHeight ? "landscape" : "portrait",
      unit: "pt",
      format: [pageWidth, pageHeight],
      compress: true,
    });

    // Theme-aware blueprint background
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      pdf.setFillColor(255, 255, 255);
    } else {
      pdf.setFillColor(11, 15, 23); // Obsidian dark
    }
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Render pure vector SVG directly into PDF
    await pdf.svg(svgEl, {
      x: padding,
      y: padding,
      width: width,
      height: height,
    });

    const safeTitle = diagramTitle
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 40) || "diagram";

    pdf.save(`${safeTitle}-blueprint.pdf`);
  } catch (err) {
    console.warn("Direct vector pdf conversion had a warning, trying fallback renderer:", err);
    openIsolatedBlueprintWindow(svgHtml, width, height, diagramTitle);
  } finally {
    if (tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
}

/**
 * Fallback: Opens a standalone, isolated blueprint window matching the diagram's exact size,
 * styled with @page { size: custom } and triggers print-to-PDF.
 */
function openIsolatedBlueprintWindow(
  svgHtml: string,
  width: number,
  height: number,
  title: string
): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups to export the Blueprint PDF.");
    return;
  }

  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const bgColor = isLight ? "#ffffff" : "#0b0f17";
  const fgColor = isLight ? "#0f172a" : "#f8fafc";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Blueprint PDF</title>
        <style>
          @page {
            size: ${width + 80}px ${height + 80}px;
            margin: 40px;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            background-color: ${bgColor};
            color: ${fgColor};
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
          svg {
            display: block;
            width: ${width}px !important;
            height: ${height}px !important;
            max-width: none !important;
            max-height: none !important;
          }
        </style>
      </head>
      <body>
        ${svgHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 100);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
