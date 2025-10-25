// src/pages/Interview/SystemDesignInterview.tsx
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  ConnectionMode,
  useReactFlow,
  type Node as RFNode,
  type Edge as RFEdge,
  type Connection,
  MarkerType,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
type EdgeKind = "line" | "arrow"; // arrow = arrow to SOURCE (fixed)

type ComponentKind =
  | "API Gateway"
  | "SQL DB"
  | "NoSQL DB"
  | "Service"
  | "Object Storage"
  | "CDN"
  | "Queue"
  | "Cache";

interface SystemNodeData extends Record<string, unknown> {
  label: string;
  kind: ComponentKind;
}

type MyNode = RFNode<SystemNodeData>;
type MyEdge = RFEdge;

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
const COMPONENT_TYPES: ComponentKind[] = [
  "API Gateway",
  "SQL DB",
  "NoSQL DB",
  "Service",
  "Object Storage",
  "CDN",
  "Queue",
  "Cache",
];

const DEFAULT_LABEL: Record<ComponentKind, string> = {
  "API Gateway": "API Gateway",
  "SQL DB": "SQL Database",
  "NoSQL DB": "NoSQL Database",
  Service: "Service",
  "Object Storage": "Object Storage",
  CDN: "CDN",
  Queue: "Queue",
  Cache: "Cache",
};

// ------------------------------------------------------------
// Custom Node (with uniquely-ID'd handles on all sides)
// ------------------------------------------------------------
const SystemNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm shadow-sm min-w-[160px] bg-neutral-900 ${
        selected ? "border-sky-400" : "border-neutral-700"
      }`}
    >
      <div className="text-neutral-100 font-medium leading-none">{data.label}</div>
      <div className="text-[11px] text-neutral-400">{data.kind}</div>

      {/* 4 Source handles with unique ids */}
      <Handle id="source-top" type="source" position={Position.Top} className="!w-3 !h-3 rounded-full bg-zinc-300" />
      <Handle id="source-right" type="source" position={Position.Right} className="!w-3 !h-3 rounded-full bg-zinc-300" />
      <Handle id="source-bottom" type="source" position={Position.Bottom} className="!w-3 !h-3 rounded-full bg-zinc-300" />
      <Handle id="source-left" type="source" position={Position.Left} className="!w-3 !h-3 rounded-full bg-zinc-300" />

      {/* 4 Target handles with unique ids */}
      <Handle id="target-top" type="target" position={Position.Top} className="!w-3 !h-3 rounded-full bg-sky-300" />
      <Handle id="target-right" type="target" position={Position.Right} className="!w-3 !h-3 rounded-full bg-sky-300" />
      <Handle id="target-bottom" type="target" position={Position.Bottom} className="!w-3 !h-3 rounded-full bg-sky-300" />
      <Handle id="target-left" type="target" position={Position.Left} className="!w-3 !h-3 rounded-full bg-sky-300" />
    </div>
  );
};

const nodeTypes: Record<string, React.ComponentType<any>> = { system: SystemNode };

// ------------------------------------------------------------
// Edge style helper (arrow fixed "toSource")
// ------------------------------------------------------------
function styleEdge(kind: EdgeKind): Partial<MyEdge> {
  if (kind === "line") return { markerStart: undefined, markerEnd: undefined, style: { strokeWidth: 2 } };
  // Arrow to SOURCE: arrowhead at the start of the edge
  return { style: { strokeWidth: 2 }, markerStart: { type: MarkerType.ArrowClosed }, markerEnd: undefined };
}

// Tiny inline icons for the segmented control
const LineIcon = () => (
  <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden>
    <line x1="2" y1="6" x2="26" y2="6" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const ArrowToSourceIcon = () => (
  <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden>
    <line x1="6" y1="6" x2="26" y2="6" stroke="currentColor" strokeWidth="2" />
    <polygon points="6,2 2,6 6,10" fill="currentColor" />
  </svg>
);

// ------------------------------------------------------------
// Sidebar (Line vs Arrow-to-Source segmented control)
// ------------------------------------------------------------
function Sidebar({
  edgeKind,
  setEdgeKind,
  onDragStart,
}: {
  edgeKind: EdgeKind;
  setEdgeKind: (k: EdgeKind) => void;
  onDragStart: (e: React.DragEvent, kind: ComponentKind) => void;
}) {
  const edgeLabel = edgeKind === "line" ? "Line" : "Arrow ← source";

  return (
    <aside className="border-r border-neutral-800 p-3 flex flex-col gap-3 h-full">
      <div className="text-sm font-semibold mb-1">Components</div>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {COMPONENT_TYPES.map((kind) => (
          <div
            key={kind}
            draggable
            onDragStart={(e) => onDragStart(e, kind)}
            className="px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 cursor-grab active:cursor-grabbing select-none text-sm"
          >
            {kind}
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm font-semibold">Edge Style</div>
      <div className="inline-flex rounded-md overflow-hidden border border-neutral-700">
        <button
          onClick={() => setEdgeKind("line")}
          className={`px-3 py-1 text-sm flex items-center gap-2 ${
            edgeKind === "line" ? "bg-neutral-700 text-white" : "bg-neutral-900 text-neutral-300"
          }`}
        >
          <LineIcon /> Line
        </button>
        <button
          onClick={() => setEdgeKind("arrow")}
          className={`px-3 py-1 text-sm flex items-center gap-2 border-l border-neutral-700 ${
            edgeKind === "arrow" ? "bg-neutral-700 text-white" : "bg-neutral-900 text-neutral-300"
          }`}
        >
          <ArrowToSourceIcon /> Arrow
        </button>
      </div>

      <div className="mt-auto text-xs text-neutral-500 pt-3 border-t border-neutral-800">
        Drag a component onto the canvas.<br />
        Connect by dragging from any side handle to any side handle.
      </div>
    </aside>
  );
}

// ------------------------------------------------------------
// Inner canvas: ALL RF logic lives here (inside Provider)
// ------------------------------------------------------------
function InnerCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<MyNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<MyEdge>([]);
  const [edgeKind, setEdgeKind] = useState<EdgeKind>("arrow");

  const rf = useReactFlow<MyNode, MyEdge>();

  // DnD
  const onDragStart = (e: React.DragEvent, kind: ComponentKind) => {
    e.dataTransfer.setData("component-kind", kind);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData("component-kind") as ComponentKind | "";
    if (!kind) return;

    // Keep current viewport/zoom stable: no auto-fit here
    const position = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const id = crypto.randomUUID();

    const newNode: MyNode = {
      id,
      type: "system",
      position,
      data: { label: DEFAULT_LABEL[kind as ComponentKind], kind: kind as ComponentKind },
    };

    setNodes((ns) => [...ns, newNode]);
  };

  // Connect
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      // Preserve the side handles (must have unique ids on handles)
      const newConnection: Connection = {
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      };

      setEdges((es) =>
        addEdge(
          {
            id: crypto.randomUUID(),
            ...newConnection,
            ...styleEdge(edgeKind), // arrow points to SOURCE when "arrow" is selected
          },
          es
        )
      );
    },
    [edgeKind, setEdges]
  );

  // Update existing edges when the style changes
  useEffect(() => {
    setEdges((es) => es.map((e) => ({ ...e, ...styleEdge(edgeKind) })));
  }, [edgeKind, setEdges]);

  const edgeLabel = useMemo(() => (edgeKind === "line" ? "Line" : "Arrow ← source"), [edgeKind]);

  return (
    <div className="w-full h-screen grid grid-cols-[260px_1fr] bg-neutral-950 text-neutral-100">
      <Sidebar edgeKind={edgeKind} setEdgeKind={setEdgeKind} onDragStart={onDragStart} />

      {/* Canvas */}
      <div className="relative h-full">
        <ReactFlow<MyNode, MyEdge>
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          // STRICT: must connect handle-to-handle; all side handles will work now that they have ids
          connectionMode={ConnectionMode.Strict}
          // Smooth preview while dragging
          connectionLineType={ConnectionLineType.SmoothStep}
          className="bg-neutral-900"
          style={{ width: "100%", height: "100%" }}
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>

        {/* Current style label */}
        <div className="absolute bottom-3 right-3 text-xs text-neutral-400 bg-neutral-800/70 px-2 py-1 rounded">
          Edge: {edgeLabel}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Page: Provider wrapper
// ------------------------------------------------------------
const SystemDesignInterview: React.FC = () => {
  return (
    <ReactFlowProvider>
      <InnerCanvas />
    </ReactFlowProvider>
  );
};

export default SystemDesignInterview;
