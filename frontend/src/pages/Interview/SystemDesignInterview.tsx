// src/pages/Interview/SystemDesignInterview.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
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
  type Node,
  type Edge,
  type Connection,
  MarkerType,
  type NodeTypes,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type EdgeKind = "line" | "arrow";

/** Custom node: four SOURCE handles only (top/right/bottom/left).
 *  With ConnectionMode.Loose, you can drop on the target node body.
 *  This ensures direction is always Start → Target (A → B). */
function FourSideSourceNode({
  id,
  data,
  selected,
}: {
  id: string;
  data: { label: string };
  selected?: boolean;
}) {
  const box = `rounded-xl border px-3 py-2 text-sm shadow-sm min-w-[140px]`;
  const theme = selected
    ? "border-sky-400 bg-neutral-800"
    : "border-neutral-700 bg-neutral-900";
  const knob = "!w-3 !h-3 rounded-full border border-neutral-500 !bg-zinc-300";

  return (
    <div className={`${box} ${theme}`}>
      <div className="text-neutral-100">{data.label}</div>

      {/* Top source */}
      <Handle id={`${id}-t-src`} type="source" position={Position.Top} className={knob} />
      {/* Right source */}
      <Handle id={`${id}-r-src`} type="source" position={Position.Right} className={knob} />
      {/* Bottom source */}
      <Handle id={`${id}-b-src`} type="source" position={Position.Bottom} className={knob} />
      {/* Left source */}
      <Handle id={`${id}-l-src`} type="source" position={Position.Left} className={knob} />
    </div>
  );
}

const nodeTypes: NodeTypes = { system: FourSideSourceNode };

const initialNodes: Node[] = [
  { id: "a", type: "system", position: { x: 180, y: 120 }, data: { label: "Component A" } },
  { id: "b", type: "system", position: { x: 520, y: 320 }, data: { label: "Component B" } },
];

const initialEdges: Edge[] = [];

const SystemDesignInterview: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [edgeKind, setEdgeKind] = useState<EdgeKind>("arrow");

  // Always creates A -> B; since we only render source handles,
  // user must start on A (source) and drop on B (node body).
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        if (!params.source || !params.target) return eds;

        const base: Edge = {
          id: crypto.randomUUID(),
          source: params.source,
          target: params.target,
          // Note: targetHandle may be undefined because we drop on node body; that's fine.
          sourceHandle: params.sourceHandle ?? null,
          targetHandle: params.targetHandle ?? null,
          style: { strokeWidth: 2 },
        };

        if (edgeKind === "line") {
          return addEdge(base, eds);
        }

        // One-sided arrow (points to target B)
        return addEdge(
          { ...base, markerEnd: { type: MarkerType.ArrowClosed } },
          eds
        );
      });
    },
    [edgeKind]
  );

  const addComponent = () => {
    const id = crypto.randomUUID();
    const n: Node = {
      id,
      type: "system",
      position: { x: 240 + Math.random() * 280, y: 140 + Math.random() * 280 },
      data: { label: `Component ${id.slice(0, 4)}` },
    };
    setNodes((ns) => [...ns, n]);
  };

  const edgeKindLabel = useMemo(
    () => ({ line: "Line", arrow: "→ Arrow (to target)" }[edgeKind]),
    [edgeKind]
  );

  return (
    <div className="w-full h-screen grid grid-rows-[56px_1fr] bg-neutral-950 text-neutral-100">
      {/* Toolbar */}
      <header className="flex items-center gap-3 px-3 border-b border-neutral-800">
        <div className="text-sm opacity-80">System Design Interview</div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={addComponent}
            className="px-3 py-1.5 rounded-md bg-neutral-200 text-neutral-900 text-sm"
          >
            + Add Component
          </button>

          <div className="flex items-center gap-1">
            <span className="text-xs opacity-70">Edge:</span>
            <select
              value={edgeKind}
              onChange={(e) => setEdgeKind(e.target.value as EdgeKind)}
              className="bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1 text-sm"
            >
              <option value="line">Line (no arrows)</option>
              <option value="arrow">Arrow (to target)</option>
            </select>
          </div>

          <span className="text-xs px-2 py-1 rounded bg-neutral-800 border border-neutral-700">
            {edgeKindLabel}
          </span>
        </div>
      </header>

      {/* Canvas */}
      <div className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}               // allow dropping on node body as target
          connectionLineType={ConnectionLineType.SmoothStep}  // built-in curved connectors
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="bg-neutral-900"
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default SystemDesignInterview;
