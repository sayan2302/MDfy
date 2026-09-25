"use client";

import React, { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import Prism from "prismjs";

// Import common language definitions
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = "text", value }) => {
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  useEffect(() => {
    const lang = language.toLowerCase();
    const grammar = Prism.languages[lang] || Prism.languages.markup || Prism.languages.text;
    if (grammar) {
      try {
        const html = Prism.highlight(value, grammar, lang);
        setHighlightedHtml(html);
        return;
      } catch (e) {
        console.warn("Prism highlight error:", e);
      }
    }
    // Fallback: escaped raw text
    setHighlightedHtml(
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    );
  }, [value, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const lines = value.split("\n");

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <span className="code-lang">{language}</span>
        <button
          className="copy-btn"
          onClick={handleCopy}
          title="Copy code to clipboard"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} style={{ color: "#10b981" }} />
              <span style={{ color: "#10b981" }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="code-pre">
        <code
          dangerouslySetInnerHTML={{
            __html: highlightedHtml || value,
          }}
        />
      </pre>
    </div>
  );
};
