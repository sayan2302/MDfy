"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header, ViewMode } from "@/components/Header";
import { SplitPane } from "@/components/SplitPane";
import { Editor } from "@/components/Editor";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTheme } from "@/hooks/useTheme";
import { SHOWCASE_MARKDOWN } from "@/constants/sampleMarkdown";

import { PrintSettingsModal, PrintSettings } from "@/components/PrintSettingsModal";

export default function Home() {
  const [content, setContent] = useLocalStorage<string>("mdfy_scratchpad", SHOWCASE_MARKDOWN);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [syncScroll, setSyncScroll] = useState<boolean>(true);
  const [theme, toggleTheme] = useTheme();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<"editor" | "preview" | null>(null);

  // Synchronized scrolling between editor and preview
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!syncScroll || isScrollingRef.current === "preview") return;

    isScrollingRef.current = "editor";
    const target = e.currentTarget;
    const maxEditorScroll = target.scrollHeight - target.clientHeight;

    if (maxEditorScroll > 0 && previewRef.current) {
      const percentage = target.scrollTop / maxEditorScroll;
      const maxPreviewScroll = previewRef.current.scrollHeight - previewRef.current.clientHeight;
      previewRef.current.scrollTop = percentage * maxPreviewScroll;
    }

    setTimeout(() => {
      isScrollingRef.current = null;
    }, 50);
  };

  // Keyboard shortcut: Ctrl/Cmd + P triggers print settings modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsPrintModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Failed to copy markdown:", err);
    }
  };

  const handleCopyHtml = async () => {
    if (previewRef.current) {
      try {
        await navigator.clipboard.writeText(previewRef.current.innerHTML);
      } catch (err) {
        console.error("Failed to copy HTML:", err);
      }
    }
  };

  const handleLoadSample = () => {
    if (window.confirm("Reload the sample showcase document? Your current edits will be replaced.")) {
      setContent(SHOWCASE_MARKDOWN);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the canvas?")) {
      setContent("");
    }
  };

  // Ensure theme and print variables are restored after print dialog closes
  useEffect(() => {
    const handleAfterPrint = () => {
      document.documentElement.setAttribute("data-theme", theme);
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [theme]);

  const handleExecutePrint = (settings: PrintSettings) => {
    // 1. Calculate dynamic CSS variables from user's settings
    const fontSizeMap = {
      compact: "8.5pt",
      normal: "10pt",
      comfortable: "11.5pt",
    };
    const diagramScaleMap = {
      compact: "0.75",
      medium: "0.88",
      full: "1.0",
    };
    const diagramHeightMap = {
      compact: "480px",
      medium: "none",
      full: "none",
    };
    const marginMap = {
      slim: "8mm",
      normal: "12mm",
      none: "0mm",
    };

    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--print-font-size", fontSizeMap[settings.fontSize]);
    rootStyle.setProperty("--print-diagram-scale", diagramScaleMap[settings.diagramScale]);
    rootStyle.setProperty("--print-diagram-max-height", diagramHeightMap[settings.diagramScale]);
    rootStyle.setProperty("--print-page-margin", marginMap[settings.margin]);

    // Give browser a frame to commit CSS variables, then open print dialog
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 50);
    });
  };

  return (
    <main
      className="app-main"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        syncScroll={syncScroll}
        onToggleSyncScroll={() => setSyncScroll(!syncScroll)}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
        onCopyMarkdown={handleCopyMarkdown}
        onCopyHtml={handleCopyHtml}
        onPrint={() => setIsPrintModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <SplitPane viewMode={viewMode}>
        <Editor
          ref={editorRef}
          value={content}
          onChange={setContent}
          onScroll={handleEditorScroll}
        />
        <MarkdownPreview ref={previewRef} content={content} theme={theme} />
      </SplitPane>

      <PrintSettingsModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onPrint={handleExecutePrint}
      />
    </main>
  );
}
