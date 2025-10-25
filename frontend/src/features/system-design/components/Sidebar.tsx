// Sidebar.tsx
import React from "react";
import { COMPONENT_TYPES } from "../constants";
import type { ComponentKind, EdgeKind } from "../types";

const LineIcon = () => (
  <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden>
    <line x1="2" y1="6" x2="26" y2="6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Arrow pointing right (i.e., toward target)
const ArrowToTargetIcon = () => (
  <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden>
    <line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="2" />
    <polygon points="22,2 26,6 22,10" fill="currentColor" />
  </svg>
);

export const Sidebar: React.FC<{
  edgeKind: EdgeKind;
  setEdgeKind: (k: EdgeKind) => void;
  onDragStart: (e: React.DragEvent, kind: ComponentKind) => void;
}> = ({ edgeKind, setEdgeKind, onDragStart }) => {
  return (
    <aside className="border-r border-neutral-800 p-3 flex flex-col gap-3 h-full">
      <div className="text-sm font-semibold mb-1">Components</div>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {COMPONENT_TYPES.all.map((kind) => (
          <div
            key={kind}
            draggable
            onDragStart={(e) => onDragStart(e, kind)}
            className="px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 cursor-grab active:cursor-grabbing select-none text-sm text-center"
            title="Drag to canvas"
          >
            {kind}
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm font-semibold">Edge Style</div>

      <div className="flex w-full rounded-md overflow-hidden border border-neutral-700">
        <button
          onClick={() => setEdgeKind("line")}
          className={`flex-1 flex items-center justify-center py-2 transition-colors ${
            edgeKind === "line"
              ? "bg-neutral-700 text-white"
              : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
          }`}
        >
          <LineIcon />
        </button>

        <button
          onClick={() => setEdgeKind("arrow")}
          className={`flex-1 flex items-center justify-center py-2 border-l border-neutral-700 transition-colors ${
            edgeKind === "arrow"
              ? "bg-neutral-700 text-white"
              : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
          }`}
        >
          <ArrowToTargetIcon />
        </button>
      </div>

      <div className="mt-auto text-xs text-neutral-500 pt-3 border-t border-neutral-800">
        Drag a component onto the canvas.<br />
        Double-click a component to rename it.<br />
        Connect by dragging from any side handle (source) to any side handle (target).
      </div>
    </aside>
  );
};
