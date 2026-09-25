"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ViewMode } from "./Header";

interface SplitPaneProps {
  viewMode: ViewMode;
  children: [React.ReactNode, React.ReactNode];
}

export const SplitPane: React.FC<SplitPaneProps> = ({ viewMode, children }) => {
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [editorChild, previewChild] = children;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const newRatio = (pointerX / rect.width) * 100;
      // Clamp between 20% and 80%
      if (newRatio >= 20 && newRatio <= 80) {
        setSplitRatio(newRatio);
      }
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = () => {
    setSplitRatio(50);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    } else {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={containerRef}
      className="split-container"
      style={{
        display: "flex",
        width: "100%",
        height: "calc(100vh - 56px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Editor Pane (Left) */}
      <div
        className="split-pane-editor no-print"
        style={{
          width:
            viewMode === "editor"
              ? "100%"
              : viewMode === "preview"
              ? "0%"
              : `${splitRatio}%`,
          height: "100%",
          display: viewMode === "preview" ? "none" : "block",
          overflow: "hidden",
          transition: isDragging ? "none" : "width 0.1s ease-out",
        }}
      >
        {editorChild}
      </div>

      {/* Draggable Splitter Handle (Only in Split View) */}
      {viewMode === "split" && (
        <div
          className="split-resizer no-print"
          onPointerDown={handlePointerDown}
          onDoubleClick={handleDoubleClick}
          title="Drag to resize, double click to reset 50/50"
          style={{
            width: "8px",
            height: "100%",
            cursor: "col-resize",
            backgroundColor: isDragging ? "var(--splitter-hover)" : "var(--splitter-bg)",
            position: "relative",
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.15s ease",
            userSelect: "none",
          }}
        >
          {/* Subtle grab pill */}
          <div
            style={{
              width: "3px",
              height: "28px",
              borderRadius: "2px",
              backgroundColor: isDragging ? "#ffffff" : "var(--text-muted)",
              opacity: 0.6,
            }}
          />
        </div>
      )}

      {/* Preview Pane (Right) */}
      <div
        className="split-pane-preview"
        style={{
          width:
            viewMode === "preview"
              ? "100%"
              : viewMode === "editor"
              ? "0%"
              : `${100 - splitRatio}%`,
          height: "100%",
          display: viewMode === "editor" ? "none" : "block",
          overflow: "hidden",
          transition: isDragging ? "none" : "width 0.1s ease-out",
        }}
      >
        {previewChild}
      </div>
    </div>
  );
};
