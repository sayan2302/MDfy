import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MDfy — High-Fidelity Markdown & Mermaid Studio",
  description: "Professional Markdown editor and viewer with interactive Mermaid diagrams, KaTeX math, GFM callouts, and vector PDF export.",
  keywords: ["Markdown", "Mermaid", "Diagrams", "PDF Export", "KaTeX", "Flowchart", "Sequence Diagram"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
