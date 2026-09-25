"use client";

import React from "react";
import { Info, Lightbulb, AlertCircle, AlertTriangle, ShieldAlert } from "lucide-react";

interface CalloutProps {
  children: React.ReactNode;
}

type CalloutType = "note" | "tip" | "important" | "warning" | "caution";

export const CalloutBlock: React.FC<CalloutProps> = ({ children }) => {
  // Inspect children to detect if this is a GitHub alert: [!NOTE], [!TIP], etc.
  let calloutType: CalloutType | null = null;
  let cleanChildren: React.ReactNode = children;

  const extractAlert = () => {
    // Filter out leading/trailing whitespace text nodes that react-markdown includes
    const validChildren = React.Children.toArray(children).filter(
      (c) => typeof c !== "string" || c.trim() !== ""
    );
    if (validChildren.length === 0) return null;

    const firstChild = validChildren[0];
    if (React.isValidElement<{ children?: React.ReactNode }>(firstChild) && firstChild.props.children) {
      const pChildren = React.Children.toArray(firstChild.props.children);
      if (pChildren.length > 0 && typeof pChildren[0] === "string") {
        const text = pChildren[0];
        const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*\n|\s+)?([\s\S]*)/i);
        if (match) {
          const type = match[1].toLowerCase() as CalloutType;
          const remainingText = match[2];

          const newPChildren = [...pChildren];
          if (remainingText.trim()) {
            newPChildren[0] = remainingText;
          } else {
            newPChildren.shift();
          }

          const newFirstChild = React.cloneElement(
            firstChild as React.ReactElement<{ children: React.ReactNode }>,
            {},
            newPChildren.length > 0 ? newPChildren : null
          );

          return {
            type,
            renderedChildren: [newFirstChild, ...validChildren.slice(1)],
          };
        }
      }
    }
    return null;
  };

  const detected = extractAlert();
  if (detected) {
    calloutType = detected.type;
    cleanChildren = detected.renderedChildren;
  }

  if (!calloutType) {
    return <blockquote>{children}</blockquote>;
  }

  const icons: Record<CalloutType, React.ReactNode> = {
    note: <Info size={18} strokeWidth={2.5} />,
    tip: <Lightbulb size={18} strokeWidth={2.5} />,
    important: <AlertCircle size={18} strokeWidth={2.5} />,
    warning: <AlertTriangle size={18} strokeWidth={2.5} />,
    caution: <ShieldAlert size={18} strokeWidth={2.5} />,
  };

  const labels: Record<CalloutType, string> = {
    note: "Note",
    tip: "Tip",
    important: "Important",
    warning: "Warning",
    caution: "Caution",
  };

  return (
    <div className={`callout callout-${calloutType}`}>
      <div className="callout-header">
        {icons[calloutType]}
        <span>{labels[calloutType]}</span>
      </div>
      <div className="callout-body">{cleanChildren}</div>
    </div>
  );
};
