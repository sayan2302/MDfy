"use client";

import React, { forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { CodeBlock } from "./CodeBlock";
import { CalloutBlock } from "./CalloutBlock";
import { MermaidBlock } from "./MermaidBlock";

interface MarkdownPreviewProps {
  content: string;
  theme?: string;
}

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ content, theme }, ref) => {
    return (
      <div
        ref={ref}
        className="preview-pane markdown-body"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match && !String(children).includes("\n");

              if (!isInline && match && match[1].toLowerCase() === "mermaid") {
                return <MermaidBlock chart={String(children).replace(/\n$/, "")} theme={theme} />;
              }

              if (!isInline) {
                const lang = match ? match[1] : "text";
                return (
                  <CodeBlock
                    language={lang}
                    value={String(children).replace(/\n$/, "")}
                  />
                );
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            blockquote({ children }) {
              return <CalloutBlock>{children}</CalloutBlock>;
            },
            table({ children }) {
              return (
                <div className="table-wrapper">
                  <table>{children}</table>
                </div>
              );
            },
            a({ href, children, ...props }) {
              const isExternal = href?.startsWith("http");
              return (
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  {...props}
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

MarkdownPreview.displayName = "MarkdownPreview";
