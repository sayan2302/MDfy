"use client";

import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
}

export const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(
  ({ value, onChange, onScroll }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const [lineCount, setLineCount] = useState(1);

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    useEffect(() => {
      const count = value.split("\n").length;
      setLineCount(Math.max(count, 1));
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Insert 2 spaces
        const newValue = value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);

        // Put cursor in right position
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    };

    const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
      }
      if (onScroll) {
        onScroll(e);
      }
    };

    // Calculate metrics
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const chars = value.length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

    return (
      <div
        className="editor-pane"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-subtle)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Editor Body with Line Numbers */}
        <div
          style={{
            display: "flex",
            flex: 1,
            height: "calc(100% - 32px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Gutter / Line Numbers */}
          <div
            ref={lineNumbersRef}
            className="no-print"
            style={{
              width: "48px",
              padding: "1.25rem 0.5rem 1.25rem 0",
              textAlign: "right",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              lineHeight: "1.65",
              color: "var(--text-muted)",
              background: "var(--bg-secondary)",
              borderRight: "1px solid var(--border-subtle)",
              userSelect: "none",
              overflow: "hidden",
            }}
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Core Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleTextareaScroll}
            placeholder="Type or paste your markdown here..."
            spellCheck={false}
            style={{
              flex: 1,
              height: "100%",
              padding: "1.25rem 1.5rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.9rem",
              lineHeight: "1.65",
              color: "var(--text-primary)",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          />
        </div>

        {/* Bottom Status Bar */}
        <div
          className="status-bar no-print"
          style={{
            height: "32px",
            padding: "0 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-tertiary)",
            borderTop: "1px solid var(--border-subtle)",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span>{lineCount} lines</span>
            <span>{words} words</span>
            <span>{chars} characters</span>
            <span>~{readTimeMinutes} min read</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-primary)" }}>
            <CheckCircle2 size={13} style={{ color: "#10b981" }} />
            <span style={{ color: "var(--text-muted)" }}>Auto-saved</span>
          </div>
        </div>
      </div>
    );
  }
);

Editor.displayName = "Editor";
