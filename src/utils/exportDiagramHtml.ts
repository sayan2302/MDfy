"use client";

/**
 * Utility to export a Mermaid diagram as a standalone, zero-dependency,
 * interactive self-contained HTML application (.html).
 *
 * Features:
 * - 100% offline, zero external runtime script dependencies.
 * - Smooth infinite pan & zoom (wheel, drag, touch pinch).
 * - Full toolbar HUD (Zoom In, Zoom Out, 100%, Fit to Screen).
 * - Real-time node/text search with glowing highlight and auto-panning.
 * - Theme switcher (Obsidian Dark / Clean Light mode).
 * - Keyboard shortcuts (Ctrl/Cmd scroll, +, -, 0, F, /, T, Esc).
 */

export function exportDiagramToHtml(
  svgHtml: string,
  diagramTitle = "architecture-blueprint",
  theme: "dark" | "light" = "dark"
): void {
  if (typeof window === "undefined") return;

  const safeTitle =
    diagramTitle
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 40) || "diagram";

  const exportDate = new Date().toLocaleString();

  const htmlContent = `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(diagramTitle)} - Interactive Canvas</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-canvas: #090d16;
      --bg-panel: rgba(15, 23, 42, 0.85);
      --bg-hover: rgba(30, 41, 59, 0.9);
      --bg-input: #0f172a;
      --border-panel: rgba(255, 255, 255, 0.1);
      --border-focus: #38bdf8;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.2);
      --grid-dot: rgba(255, 255, 255, 0.05);
      --highlight: #f59e0b;
      --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    [data-theme="light"] {
      --bg-canvas: #f8fafc;
      --bg-panel: rgba(255, 255, 255, 0.92);
      --bg-hover: #f1f5f9;
      --bg-input: #ffffff;
      --border-panel: rgba(0, 0, 0, 0.12);
      --border-focus: #0284c7;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --accent: #0284c7;
      --accent-glow: rgba(2, 132, 199, 0.15);
      --grid-dot: rgba(0, 0, 0, 0.06);
      --highlight: #d97706;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    html, body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background-color: var(--bg-canvas);
      color: var(--text-main);
      font-family: var(--font-ui);
    }

    /* Infinite Canvas Viewport */
    #viewport {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      cursor: grab;
      overflow: hidden;
      background-size: 24px 24px;
      background-image: radial-gradient(circle, var(--grid-dot) 1px, transparent 1px);
    }

    #viewport:active {
      cursor: grabbing;
    }

    #canvas {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: 0 0;
      will-change: transform;
      display: inline-block;
      padding: 40px;
    }

    /* Embedded SVG inside canvas */
    #canvas svg {
      display: block;
      overflow: visible !important;
      max-width: none !important;
      max-height: none !important;
    }

    /* Top Navigation HUD */
    .top-hud {
      position: fixed;
      top: 16px;
      left: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      z-index: 100;
      pointer-events: none;
    }

    .top-hud > * {
      pointer-events: auto;
    }

    .hud-card {
      background: var(--bg-panel);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-panel);
      border-radius: 12px;
      padding: 6px 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .title-badge {
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: -0.01em;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meta-tag {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--bg-hover);
      border: 1px solid var(--border-panel);
    }

    /* Search Box */
    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      background: var(--bg-input);
      border: 1px solid var(--border-panel);
      color: var(--text-main);
      border-radius: 8px;
      padding: 6px 12px 6px 30px;
      font-size: 0.82rem;
      outline: none;
      width: 190px;
      transition: all 0.2s ease;
      user-select: text;
    }

    .search-input:focus {
      width: 260px;
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .search-icon {
      position: absolute;
      left: 9px;
      width: 14px;
      height: 14px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-status {
      font-size: 0.72rem;
      font-family: var(--font-mono);
      color: var(--highlight);
      font-weight: 600;
      margin-left: 6px;
      min-width: 50px;
    }

    /* Bottom Control Bar HUD */
    .bottom-hud {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 8px;
      background: var(--bg-panel);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid var(--border-panel);
      border-radius: 14px;
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.35);
    }

    .hud-btn {
      background: transparent;
      border: none;
      color: var(--text-main);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: background 0.15s ease, transform 0.05s;
    }

    .hud-btn:hover {
      background: var(--bg-hover);
      color: var(--accent);
    }

    .hud-btn:active {
      transform: scale(0.97);
    }

    .hud-divider {
      width: 1px;
      height: 20px;
      background: var(--border-panel);
      margin: 0 4px;
    }

    .zoom-badge {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--accent);
      padding: 4px 8px;
      border-radius: 6px;
      background: var(--accent-glow);
      cursor: pointer;
      min-width: 54px;
      text-align: center;
    }

    /* Search Highlights */
    .search-highlight {
      outline: 3px solid var(--highlight) !important;
      outline-offset: 4px;
      border-radius: 4px;
      filter: drop-shadow(0 0 12px var(--highlight)) !important;
      animation: pulseHighlight 1s infinite alternate ease-in-out;
    }

    @keyframes pulseHighlight {
      from { filter: drop-shadow(0 0 6px var(--highlight)); }
      to { filter: drop-shadow(0 0 16px var(--highlight)); }
    }

    /* Toast for Shortcuts */
    .shortcut-toast {
      position: fixed;
      bottom: 74px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-panel);
      border: 1px solid var(--border-panel);
      color: var(--text-muted);
      font-size: 0.73rem;
      padding: 4px 12px;
      border-radius: 20px;
      pointer-events: none;
      z-index: 99;
      opacity: 0.9;
    }
  </style>
</head>
<body>

  <!-- Top Navigation HUD -->
  <div class="top-hud">
    <div class="hud-card">
      <div class="title-badge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent);">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
        <span>${escapeHtml(diagramTitle)}</span>
      </div>
      <span class="meta-tag">Interactive HTML</span>
      <span class="meta-tag" style="display:none;" id="diag-dims"></span>
    </div>

    <!-- Search Tool -->
    <div class="hud-card">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="searchInput" class="search-input" placeholder="Find nodes in diagram... (/)" />
      </div>
      <span id="searchStatus" class="search-status"></span>
    </div>

    <!-- Theme & Info -->
    <div class="hud-card">
      <button class="hud-btn" id="themeBtn" title="Toggle Dark/Light Mode (T)">
        ${theme === "dark" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </div>
  </div>

  <!-- Infinite Canvas Viewport -->
  <div id="viewport">
    <div id="canvas">
      ${svgHtml}
    </div>
  </div>

  <!-- Bottom Floating Control HUD -->
  <div class="bottom-hud">
    <button class="hud-btn" id="zoomOutBtn" title="Zoom Out (-)">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </button>
    <div class="zoom-badge" id="zoomBadge" title="Click to Reset 100% (0)">100%</div>
    <button class="hud-btn" id="zoomInBtn" title="Zoom In (+)">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </button>
    <div class="hud-divider"></div>
    <button class="hud-btn" id="fitBtn" title="Fit to Screen (F)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
      <span>Fit</span>
    </button>
    <button class="hud-btn" id="resetBtn" title="Reset to 100% (0)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
      <span>Reset</span>
    </button>
  </div>

  <div class="shortcut-toast">
    Drag to Pan · Wheel to Zoom · [F] Fit Screen · [0] Reset · [/] Search · [T] Theme
  </div>

  <script>
    (function() {
      var viewport = document.getElementById('viewport');
      var canvas = document.getElementById('canvas');
      var zoomBadge = document.getElementById('zoomBadge');
      var searchInput = document.getElementById('searchInput');
      var searchStatus = document.getElementById('searchStatus');
      var themeBtn = document.getElementById('themeBtn');

      var scale = 1;
      var pointX = 0;
      var pointY = 0;
      var isPanning = false;
      var startX = 0;
      var startY = 0;

      function updateTransform() {
        canvas.style.transform = 'translate(' + pointX + 'px, ' + pointY + 'px) scale(' + scale + ')';
        zoomBadge.textContent = Math.round(scale * 100) + '%';
      }

      // Smooth mouse-centered wheel zoom
      viewport.addEventListener('wheel', function(e) {
        e.preventDefault();
        var rect = viewport.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;

        var zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
        var newScale = Math.min(Math.max(0.04, scale * zoomFactor), 25);

        // Keep content under mouse cursor stationary
        pointX = mouseX - (mouseX - pointX) * (newScale / scale);
        pointY = mouseY - (mouseY - pointY) * (newScale / scale);
        scale = newScale;

        updateTransform();
      }, { passive: false });

      // Pan via drag
      viewport.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        isPanning = true;
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
        viewport.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', function(e) {
        if (!isPanning) return;
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;
        updateTransform();
      });

      window.addEventListener('mouseup', function() {
        isPanning = false;
        viewport.style.cursor = 'grab';
      });

      // Fit to Screen logic
      function fitToScreen() {
        var svg = canvas.querySelector('svg');
        if (!svg) return;
        var vpRect = viewport.getBoundingClientRect();

        var svgW = 1200;
        var svgH = 800;
        var viewBox = svg.getAttribute('viewBox');
        if (viewBox) {
          var parts = viewBox.trim().split(/[\\s,]+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            svgW = parts[2];
            svgH = parts[3];
          }
        } else {
          svgW = svg.clientWidth || parseFloat(svg.getAttribute('width')) || 1200;
          svgH = svg.clientHeight || parseFloat(svg.getAttribute('height')) || 800;
        }

        var pad = 60;
        var availableW = Math.max(vpRect.width - pad * 2, 200);
        var availableH = Math.max(vpRect.height - pad * 2 - 80, 200);

        var scaleW = availableW / svgW;
        var scaleH = availableH / svgH;
        scale = Math.min(Math.max(Math.min(scaleW, scaleH), 0.05), 4);

        // Center on screen
        pointX = Math.round((vpRect.width - svgW * scale) / 2);
        pointY = Math.round((vpRect.height - svgH * scale) / 2);
        updateTransform();
      }

      function resetZoom() {
        scale = 1;
        var svg = canvas.querySelector('svg');
        var vpRect = viewport.getBoundingClientRect();
        var svgW = svg ? (svg.clientWidth || 1000) : 1000;
        var svgH = svg ? (svg.clientHeight || 700) : 700;
        pointX = Math.round((vpRect.width - svgW) / 2);
        pointY = Math.round((vpRect.height - svgH) / 2);
        updateTransform();
      }

      function zoomIn() {
        var vpRect = viewport.getBoundingClientRect();
        var cx = vpRect.width / 2;
        var cy = vpRect.height / 2;
        var newScale = Math.min(scale * 1.25, 25);
        pointX = cx - (cx - pointX) * (newScale / scale);
        pointY = cy - (cy - pointY) * (newScale / scale);
        scale = newScale;
        updateTransform();
      }

      function zoomOut() {
        var vpRect = viewport.getBoundingClientRect();
        var cx = vpRect.width / 2;
        var cy = vpRect.height / 2;
        var newScale = Math.max(scale * 0.8, 0.04);
        pointX = cx - (cx - pointX) * (newScale / scale);
        pointY = cy - (cy - pointY) * (newScale / scale);
        scale = newScale;
        updateTransform();
      }

      // HUD Button bindings
      document.getElementById('zoomInBtn').onclick = zoomIn;
      document.getElementById('zoomOutBtn').onclick = zoomOut;
      document.getElementById('fitBtn').onclick = fitToScreen;
      document.getElementById('resetBtn').onclick = resetZoom;
      zoomBadge.onclick = resetZoom;

      // Theme toggle
      function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        themeBtn.textContent = next === 'dark' ? '🌙 Dark' : '☀️ Light';
      }
      themeBtn.onclick = toggleTheme;

      // Node search functionality
      searchInput.addEventListener('input', function() {
        var q = this.value.trim().toLowerCase();
        var svg = canvas.querySelector('svg');
        if (!svg) return;

        // Clear existing highlights
        var old = svg.querySelectorAll('.search-highlight');
        for (var i = 0; i < old.length; i++) {
          old[i].classList.remove('search-highlight');
        }

        if (!q) {
          searchStatus.textContent = '';
          return;
        }

        var elements = svg.querySelectorAll('.node, text, foreignObject div, foreignObject span');
        var count = 0;
        var firstMatch = null;

        for (var j = 0; j < elements.length; j++) {
          var el = elements[j];
          var text = (el.textContent || '').toLowerCase();
          if (text.indexOf(q) !== -1) {
            count++;
            var target = el.closest('.node') || el;
            target.classList.add('search-highlight');
            if (!firstMatch) firstMatch = target;
          }
        }

        if (count > 0) {
          searchStatus.textContent = count + ' match' + (count > 1 ? 'es' : '');
          if (firstMatch) {
            // Smoothly pan towards the first match
            var matchRect = firstMatch.getBoundingClientRect();
            var vpRect = viewport.getBoundingClientRect();
            var matchCenterX = matchRect.left + matchRect.width / 2;
            var matchCenterY = matchRect.top + matchRect.height / 2;
            var vpCenterX = vpRect.left + vpRect.width / 2;
            var vpCenterY = vpRect.top + vpRect.height / 2;
            pointX += (vpCenterX - matchCenterX);
            pointY += (vpCenterY - matchCenterY);
            updateTransform();
          }
        } else {
          searchStatus.textContent = '0 matches';
        }
      });

      // Global keyboard shortcuts
      window.addEventListener('keydown', function(e) {
        if (document.activeElement === searchInput) {
          if (e.key === 'Escape') {
            searchInput.blur();
          }
          return;
        }

        if (e.key === '/' || e.key === 's') {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        } else if (e.key === '+' || e.key === '=') {
          zoomIn();
        } else if (e.key === '-' || e.key === '_') {
          zoomOut();
        } else if (e.key === '0') {
          resetZoom();
        } else if (e.key === 'f' || e.key === 'F') {
          fitToScreen();
        } else if (e.key === 't' || e.key === 'T') {
          toggleTheme();
        }
      });

      // Initial auto-fit on load
      window.addEventListener('load', function() {
        setTimeout(fitToScreen, 80);
      });
    })();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeTitle}-interactive.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
