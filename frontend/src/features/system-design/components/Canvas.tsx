import React, { useCallback, useEffect, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  ConnectionMode,
  ConnectionLineType,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type NodeTypes,
} from "@xyflow/react";
import { useDiagramJSON, asSystemData, styleEdge, type MyNode, type MyEdge } from "../utils";
import "@xyflow/react/dist/style.css";
import "@/styles/reactflow-dark.css";

import { Sidebar } from "./Sidebar";
import { SystemNode } from "./SystemNode";
import { COMPONENT_TYPES } from "../constants";
import type { ComponentKind, EdgeKind } from "../types";

// 🔌 ElevenLabs live sync (contextual_update)
import { useDiagramElevenSync } from "@/hooks/useDiagramElevenSync";

export const Canvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<MyNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<MyEdge>([]);
  const [edgeKind, setEdgeKind] = useState<EdgeKind>("arrow");

  const rf = useReactFlow<MyNode, MyEdge>();
  const getDiagramJSON = useDiagramJSON();
  (window as any).getDiagramJSON = getDiagramJSON;

  // Provide your active ElevenLabs conversation WebSocket URL here.
  // You can inject it via env var (Next.js inlines this at build) or set window.__ELEVEN_WS_URL at runtime.
  const elevenWsUrl =
    (typeof window !== "undefined" && (window as any).__ELEVEN_WS_URL) ||
    (import.meta.env.VITE_ELEVEN_WS_URL as string) || "";

  // Initializes WS and pushes debounced contextual_update messages when scheduled.
  const { schedule, pushNow } = useDiagramElevenSync({ wsUrl: elevenWsUrl, debounceMs: 800 });

  const withEditFns = useCallback(
    (node: MyNode): MyNode => {
      const onStartEdit = (id: string) =>
        setNodes((ns) =>
          ns.map((n) => (n.id === id ? { ...n, data: { ...asSystemData(n.data), editing: true } } : n))
        );

      const onCommitLabel = (id: string, next: string) =>
        setNodes((ns) =>
          ns.map((n) =>
            n.id === id ? { ...n, data: { ...asSystemData(n.data), label: next, editing: false } } : n
          )
        );

      const onCancelEdit = (id: string) =>
        setNodes((ns) =>
          ns.map((n) => (n.id === id ? { ...n, data: { ...asSystemData(n.data), editing: false } } : n))
        );

      return {
        ...node,
        data: {
          ...asSystemData(node.data),
          onStartEdit,
          onCommitLabel,
          onCancelEdit,
        },
      };
    },
    [setNodes]
  );

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

    const position = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const id = crypto.randomUUID();

    const newNode: MyNode = withEditFns({
      id,
      type: "system",
      position,
      dragHandle: ".drag-surface",
      data: { label: COMPONENT_TYPES.labelFor(kind), kind, editing: false },
    } as MyNode);

    setNodes((ns) => [...ns, newNode]);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      setEdges((es) =>
        addEdge(
          {
            id: crypto.randomUUID(),
            source: params.source,
            target: params.target,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
            ...styleEdge(edgeKind),
          },
          es
        )
      );
    },
    [edgeKind, setEdges]
  );

  useEffect(() => {
    setEdges((es) => es.map((e) => ({ ...e, ...styleEdge(edgeKind) })));
  }, [edgeKind, setEdges]);

  const onNodeDoubleClick = useCallback(
    (_evt: React.MouseEvent, node: MyNode) => {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === node.id ? { ...withEditFns(n), data: { ...asSystemData(n.data), editing: true } } : n
        )
      );
    },
    [setNodes, withEditFns]
  );

  useEffect(() => {
    setNodes((ns) => ns.map((n) => withEditFns(n)));
  }, [withEditFns, setNodes]);

  // 🔁 Push to ElevenLabs whenever nodes/edges change (debounced)
  useEffect(() => {
    if (!elevenWsUrl) return; // no-op if WS URL not provided
    schedule();
  }, [nodes, edges, schedule, elevenWsUrl]);

  const nodeTypes = { system: SystemNode } satisfies NodeTypes;

  return (
    <div className="w-full h-screen grid grid-cols-[260px_1fr] bg-neutral-950 text-neutral-100">
      <Sidebar edgeKind={edgeKind} setEdgeKind={setEdgeKind} onDragStart={onDragStart} />

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
          onNodeDoubleClick={onNodeDoubleClick}
          connectionMode={ConnectionMode.Loose}
          connectionLineType={ConnectionLineType.SmoothStep}
          isValidConnection={(c) =>
            !!c.source && !!c.target && c.source !== c.target && !!c.sourceHandle && !!c.targetHandle
          }
          className="bg-neutral-900"
          style={{ width: "100%", height: "100%" }}
        >
          <MiniMap
            pannable
            zoomable
            style={{ background: "#0b0f19", border: "1px solid #262b3a", borderRadius: "6px" }}
            maskColor="rgba(2, 6, 23, 0.6)"
            nodeColor={() => "#334155"}
            nodeStrokeColor={() => "#94a3b8"}
            nodeBorderRadius={2}
          />
          <Controls
            position="bottom-left"
            style={{ background: "#111827", border: "1px solid #374151", borderRadius: "6px", boxShadow: "none" }}
          />
          <Background gap={24} variant={BackgroundVariant.Dots} color="#334155" size={1} />
        </ReactFlow>

        {/* Optional: manual "sync now" button for testing */}
        {/* <button
          onClick={pushNow}
          className="absolute bottom-4 right-4 px-3 py-2 rounded bg-neutral-700 hover:bg-neutral-600"
        >
          Sync to ElevenLabs
        </button> */}
      </div>
    </div>
  );
};
