// SystemNode.tsx
import React from "react";
import { Handle, Position, type NodeProps, type Node as RFNode } from "@xyflow/react";
import type { SystemNodeData } from "../types";

type MyNode = RFNode<SystemNodeData>;

const DOT_SIZE = 12; // px

// Shared style used by BOTH the visible dot and the hidden handle for exact overlap
const posStyles = {
  top:   { top:   -DOT_SIZE / 2, left: "50%", transform: "translate(-50%, -50%)" },
  right: { right: -DOT_SIZE / 2, top:  "50%", transform: "translate(50%, -50%)" },
  bottom:{ bottom:-DOT_SIZE / 2, left: "50%", transform: "translate(-50%, 50%)" },
  left:  { left:  -DOT_SIZE / 2, top:  "50%", transform: "translate(-50%, -50%)" },
} as const;

const visibleDotBase: React.CSSProperties = {
  position: "absolute",
  width: DOT_SIZE,
  height: DOT_SIZE,
  borderRadius: DOT_SIZE / 2,
  background: "#94a3b8", // slate-300
  pointerEvents: "none",  // purely visual
  zIndex: 2,
};

const handleBase: React.CSSProperties = {
  position: "absolute",
  width: DOT_SIZE,
  height: DOT_SIZE,
  borderRadius: DOT_SIZE / 2,
  opacity: 0,             // invisible but clickable
  background: "transparent",
  border: 0,
  pointerEvents: "auto",
  zIndex: 3,              // on top of the dot
};

export const SystemNode: React.FC<NodeProps<MyNode>> = ({ id, data }) => {
  const { label, editing, onStartEdit, onCommitLabel, onCancelEdit } = data;

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm min-w-40 relative">
      {/* Label / Edit */}
      {!editing ? (
        <div
          className="font-medium cursor-text"
          onDoubleClick={() => onStartEdit?.(id)}
          title="Double-click to rename"
        >
          {label}
        </div>
      ) : (
        <input
          autoFocus
          className="w-full bg-neutral-900 border border-neutral-600 rounded px-2 py-1"
          defaultValue={label}
          onBlur={(e) => onCommitLabel?.(id, e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitLabel?.(id, (e.target as HTMLInputElement).value);
            if (e.key === "Escape") onCancelEdit?.(id);
          }}
        />
      )}

      {/* ---- TOP (exact overlap) ---- */}
      <div style={{ ...visibleDotBase, ...posStyles.top }} />
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        style={{ ...handleBase, ...posStyles.top }}
      />
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        style={{ ...handleBase, ...posStyles.top }}
      />

      {/* ---- RIGHT (exact overlap) ---- */}
      <div style={{ ...visibleDotBase, ...posStyles.right }} />
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        style={{ ...handleBase, ...posStyles.right }}
      />
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        style={{ ...handleBase, ...posStyles.right }}
      />

      {/* ---- BOTTOM (exact overlap) ---- */}
      <div style={{ ...visibleDotBase, ...posStyles.bottom }} />
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        style={{ ...handleBase, ...posStyles.bottom }}
      />
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        style={{ ...handleBase, ...posStyles.bottom }}
      />

      {/* ---- LEFT (exact overlap) ---- */}
      <div style={{ ...visibleDotBase, ...posStyles.left }} />
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        style={{ ...handleBase, ...posStyles.left }}
      />
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        style={{ ...handleBase, ...posStyles.left }}
      />
    </div>
  );
};
