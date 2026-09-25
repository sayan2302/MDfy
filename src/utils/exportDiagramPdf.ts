"use client";

/**
 * High-fidelity Architecture Blueprint PDF Exporter.
 * Uses native browser print engine configured with @page { size: A3 landscape }
 * to render complete SVGs including all foreignObject HTML text, fonts, colors,
 * and badges on a spacious 420mm x 297mm A3 canvas with zero clipping or text loss.
 */

export function exportDiagramToPdf(
  svgHtml: string,
  diagramTitle = "architecture-blueprint",
  paperFormat: "A3 landscape" | "A3 portrait" | "A4 landscape" = "A3 landscape"
): void {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Popup blocked by browser. Please allow popups for localhost to export Blueprint PDF.");
    return;
  }

  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const bgColor = isLight ? "#ffffff" : "#0b0f17";
  const fgColor = isLight ? "#0f172a" : "#f8fafc";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${diagramTitle} - Architecture Blueprint</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
          @page {
            size: ${paperFormat};
            margin: 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            width: 100%;
            height: 100%;
            background-color: ${bgColor} !important;
            color: ${fgColor} !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .blueprint-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6mm;
          }
          svg {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: 100% !important;
            margin: auto !important;
            overflow: visible !important;
          }
          foreignObject div {
            font-family: 'Inter', system-ui, sans-serif !important;
            color: inherit;
          }
        </style>
      </head>
      <body>
        <div class="blueprint-container">
          ${svgHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
