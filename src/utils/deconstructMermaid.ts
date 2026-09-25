/**
 * Subgraph Deconstruction Utility ("Executive Map + Detailed Tier Chapters")
 *
 * Slices complex, deeply nested multi-tier Mermaid flowcharts into:
 * 1. An Executive Overview Map (abstracted high-level tier map with large, legible fonts)
 * 2. Dedicated Detailed Tier Chapters (deep-dive plates for each layer, rendered at 100% vector scale)
 */

export interface DeconstructedChapter {
  id: string;
  title: string;
  code: string;
}

export interface DeconstructedDiagram {
  isDeconstructible: boolean;
  executiveMapTitle: string;
  executiveMapCode: string;
  chapters: DeconstructedChapter[];
  originalCode: string;
}

interface InternalSubgraph {
  id: string;
  title: string;
  depth: number;
  lines: string[];
  nodeIds: Set<string>;
}

export function deconstructMermaid(code: string): DeconstructedDiagram {
  const cleanCode = code.trim();
  const emptyResult: DeconstructedDiagram = {
    isDeconstructible: false,
    executiveMapTitle: "",
    executiveMapCode: cleanCode,
    chapters: [],
    originalCode: cleanCode,
  };

  // Only flowchart and graph support subgraph deconstruction
  if (!cleanCode.startsWith("flowchart") && !cleanCode.startsWith("graph")) {
    return emptyResult;
  }

  const lines = cleanCode.split("\n");
  const firstLine = lines[0].trim();
  const orientationMatch = firstLine.match(/^(?:flowchart|graph)\s+([A-Za-z]+)/);
  const baseOrientation = orientationMatch ? orientationMatch[1] : "TB";

  const subgraphs: InternalSubgraph[] = [];
  const stack: number[] = [];
  const classDefs: string[] = [];
  const classAssignments: string[] = [];
  const rawConnections: Array<{ from: string; to: string; label: string }> = [];
  const nodeDefinitions = new Map<string, string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("%%")) {
      continue;
    }

    if (trimmed.startsWith("classDef ")) {
      classDefs.push(trimmed);
      continue;
    }
    if (trimmed.startsWith("class ")) {
      classAssignments.push(trimmed);
      continue;
    }

    // Check subgraph start
    const subMatch = trimmed.match(/^subgraph\s+([A-Za-z0-9_-]+)?\s*(?:\["([^"]*)"\]|\[([^\]]*)\])?/);
    if (subMatch && !trimmed.startsWith("end")) {
      const rawId = subMatch[1] || "";
      const rawTitle = subMatch[2] || subMatch[3] || rawId || `Tier_${subgraphs.length + 1}`;
      const sg: InternalSubgraph = {
        id: rawId || `tier_${subgraphs.length + 1}`,
        title: rawTitle,
        depth: stack.length,
        lines: [],
        nodeIds: new Set<string>(),
      };

      // Record this line in all parent subgraphs
      for (const parentIdx of stack) {
        subgraphs[parentIdx].lines.push(line);
      }

      const newIdx = subgraphs.push(sg) - 1;
      stack.push(newIdx);
      continue;
    }

    // Check subgraph end
    if (trimmed === "end") {
      if (stack.length > 0) {
        stack.pop();
        // Record this end in remaining parent subgraphs
        for (const parentIdx of stack) {
          subgraphs[parentIdx].lines.push(line);
        }
      }
      continue;
    }

    // Capture line for all enclosing subgraphs
    if (stack.length > 0) {
      for (const parentIdx of stack) {
        subgraphs[parentIdx].lines.push(line);
      }
    }

    // Extract node definitions e.g. NodeId["Label"]
    const nodeDefMatches = line.matchAll(/\b([A-Za-z0-9_-]+)\s*(\(\[[^\]]+\]\)|\(\([^)]+\)\)|\[\([^)]+\)\]|\{\{[^}]+\}\}|\["[^"]*"\]|\[[^\]]+\]|\([^)]+\)|\{[^}]+\})/g);
    for (const m of nodeDefMatches) {
      const nodeId = m[1];
      const fullDef = m[0];
      if (!nodeDefinitions.has(nodeId)) {
        nodeDefinitions.set(nodeId, fullDef);
      }
    }

    // Record node membership
    const nodeMatches = line.matchAll(/\b([A-Za-z0-9_-]+)\s*(?:\[|\(|\{|\>)/g);
    for (const m of nodeMatches) {
      const nodeId = m[1];
      if (stack.length > 0) {
        for (const idx of stack) {
          subgraphs[idx].nodeIds.add(nodeId);
        }
      }
    }

    // Extract connections/arrows
    const connMatch = trimmed.match(/^([A-Za-z0-9_-]+)\s*(?:-->|-\.->|==>|<-->|<-\.->)\s*(?:\|"([^"]*)"\||\|([^|]*)\|)?\s*([A-Za-z0-9_-]+)/);
    if (connMatch) {
      rawConnections.push({
        from: connMatch[1],
        to: connMatch[4],
        label: connMatch[2] || connMatch[3] || "",
      });
    }
  }

  // Determine Tiers
  let tiers: InternalSubgraph[] = [];
  const depth0 = subgraphs.filter((s) => s.depth === 0);
  const depth1 = subgraphs.filter((s) => s.depth === 1);

  if (depth0.length === 1 && depth1.length >= 2) {
    // Outer VPC/System wrapper containing depth 1 tiers
    tiers = depth1;
  } else if (depth0.length >= 2) {
    tiers = depth0;
  } else {
    // Fewer than 2 subgraphs: diagram does not benefit from deconstruction
    return emptyResult;
  }

  // Deduplicate and aggregate inter-tier connections for the Executive Map
  const interTierMap = new Map<string, { from: string; to: string; labels: Set<string> }>();

  for (const conn of rawConnections) {
    const fromTier = tiers.find((t) => t.id === conn.from || t.nodeIds.has(conn.from));
    const toTier = tiers.find((t) => t.id === conn.to || t.nodeIds.has(conn.to));

    if (fromTier && toTier && fromTier.id !== toTier.id) {
      const key = `${fromTier.id}->${toTier.id}`;
      if (!interTierMap.has(key)) {
        interTierMap.set(key, {
          from: fromTier.id,
          to: toTier.id,
          labels: new Set<string>(),
        });
      }
      if (conn.label) {
        interTierMap.get(key)!.labels.add(conn.label);
      }
    }
  }

  // 1. Generate Executive Overview Map Code
  const execLines: string[] = [];
  execLines.push(`flowchart ${baseOrientation === "LR" ? "LR" : "TB"}`);
  execLines.push('    subgraph ExecOverview ["📋 System Architecture — Executive Overview Map"]');
  execLines.push(`        direction ${baseOrientation === "LR" ? "LR" : "TB"}`);

  for (const tier of tiers) {
    const safeTitle = tier.title.replace(/"/g, "'");
    execLines.push(`        T_${tier.id}["${safeTitle}"]`);
  }

  execLines.push("");

  // Add inter-tier links
  if (interTierMap.size > 0) {
    for (const link of interTierMap.values()) {
      const labelArr = Array.from(link.labels).slice(0, 2);
      const labelStr = labelArr.length > 0 ? `|"${labelArr.join(" · ")}"|` : "";
      execLines.push(`        T_${link.from} -->${labelStr} T_${link.to}`);
    }
  } else {
    // Fallback: sequential tier flow if no direct inter-tier links parsed
    for (let i = 0; i < tiers.length - 1; i++) {
      execLines.push(`        T_${tiers[i].id} --> T_${tiers[i + 1].id}`);
    }
  }

  execLines.push("    end");
  execLines.push("");
  execLines.push("    classDef execTier fill:#1e293b,stroke:#0284c7,stroke-width:2.5px,color:#f8fafc;");
  execLines.push(`    class ${tiers.map((t) => "T_" + t.id).join(",")} execTier;`);

  const executiveMapCode = execLines.join("\n");

  // 2. Generate Detailed Tier Chapters
  const chapters: DeconstructedChapter[] = tiers.map((tier) => {
    const chapterLines: string[] = [];
    chapterLines.push(`flowchart ${baseOrientation === "LR" ? "LR" : "TB"}`);
    chapterLines.push(`    subgraph ${tier.id} ["${tier.title.replace(/"/g, "'")}"]`);
    chapterLines.push(tier.lines.map((l) => "    " + l).join("\n"));
    chapterLines.push("    end");

    // Re-attach classDefs
    if (classDefs.length > 0) {
      chapterLines.push("");
      chapterLines.push(...classDefs);
    }

    // Re-attach class assignments for nodes inside this tier
    if (classAssignments.length > 0) {
      chapterLines.push("");
      for (const ca of classAssignments) {
        const m = ca.match(/^class\s+([^;]+)\s+([A-Za-z0-9_-]+);?$/);
        if (m) {
          const nodes = m[1]
            .split(",")
            .map((n) => n.trim())
            .filter((n) => tier.nodeIds.has(n));
          if (nodes.length > 0) {
            chapterLines.push(`    class ${nodes.join(",")} ${m[2]};`);
          }
        }
      }
    }

    return {
      id: tier.id,
      title: tier.title,
      code: chapterLines.join("\n"),
    };
  });

  return {
    isDeconstructible: true,
    executiveMapTitle: "System Architecture — Executive Overview Map",
    executiveMapCode,
    chapters,
    originalCode: cleanCode,
  };
}
