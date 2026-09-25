# 🚀 MDfy — Markdown & Mermaid Document Studio

> A high-fidelity, split-pane Markdown editor and interactive Mermaid diagram studio built with Next.js, React 19, and TypeScript. Featuring an interactive Infinite Canvas, KaTeX mathematical typesetting, GitHub alert callouts, and vector-perfect PDF export.

---

## ✨ Features

- 📑 **Live Split-Pane Markdown Editor**: Real-time synchronized dual-pane scrolling with draggable splitter (20% to 80% with double-click 50/50 reset).
- 📊 **Full Mermaid Interactive Suite**:
  - Supports all Mermaid diagram types (Flowcharts, Sequence Diagrams, Architecture Meshes, Git Graphs, Mindmaps, Class Diagrams, State Diagrams, Timelines).
  - Inline drag-to-pan and smart mousewheel zoom (<kbd>Ctrl</kbd> + Scroll) with zero page-zoom hijacking.
  - **Infinite Canvas Studio**: Fullscreen dot-grid canvas with cursor-centered mousewheel zooming (up to 1000%), auto **Fit-to-Screen** on open, keyboard shortcuts (<kbd>+</kbd>, <kbd>-</kbd>, <kbd>0</kbd>, <kbd>F</kbd>, <kbd>Esc</kbd>), and 1-click Vector SVG / High-Res PNG exports.
- 🖨️ **Vector Print & PDF Engine**:
  - Crisp, unclipped `@media print` layout that leaves interactive UI behind and preserves vector SVGs.
  - Configurable **Print / PDF Export Modal**:
    - **Document Density**: Compact (8.5pt), Normal (10pt), Comfortable (11.5pt).
    - **Diagram Scaling**: Full (100% uncapped natural flow across pages), Balanced (85%), Compact (70%).
    - **Page Margins**: Slim (8mm), Normal (12mm), Edge-to-Edge (0mm).
- 🧮 **KaTeX Mathematical Typesetting**: Fast inline (`$e^{i\pi} + 1 = 0$`) and display (`$$\sum...$$`) LaTeX equations.
- 💡 **GitHub Alert Callouts**: Styled blockquotes for `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, and `[!CAUTION]`.
- 🌓 **Synchronized Dark & Light Themes**: Obsidian Dark and Paper Light modes with smooth CSS variable transitions.
- 💾 **Realtime LocalStorage Persistence**: Auto-saves your work in real-time so your notes persist across browser reloads.
- 📋 **1-Click Export Suite**: Copy Raw Markdown, Copy Rendered HTML, Print to PDF, and export individual diagram SVGs or PNGs.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Vanilla CSS with modern CSS variables, glassmorphism, and responsive layout
- **Diagramming**: [Mermaid.js](https://mermaid.js.org/) v11
- **Markdown & Math**: `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, `katex`
- **Syntax Highlighting**: `prismjs`
- **Icons**: `lucide-react`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm

### Installation

```bash
git clone https://github.com/sayan2302/MDfy.git
cd MDfy
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## ⌨️ Shortcuts & Navigation

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Open Print / PDF Export Settings |
| <kbd>Ctrl</kbd> + Scroll (Inline) | Zoom Mermaid Diagram without zooming browser |
| <kbd>Mouse Scroll</kbd> (Canvas) | Zoom Infinite Canvas centered on cursor |
| <kbd>F</kbd> or Double-Click | Auto Fit Diagram to Screen in Infinite Canvas |
| <kbd>0</kbd> | Reset Diagram Zoom to 100% |
| <kbd>Esc</kbd> | Close Fullscreen Infinite Canvas |

---

## 📄 License

MIT License. Crafted with precision for high-productivity technical writing.
