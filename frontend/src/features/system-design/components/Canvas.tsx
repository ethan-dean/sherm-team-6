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
  type Edge as RFEdge,
  type Node as RFNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@/styles/reactflow-dark.css";
import "@xyflow/react/dist/style.css";

import { Sidebar } from "./Sidebar";
import { SystemNode } from "./SystemNode";
import { COMPONENT_TYPES } from "../constants";
import { asSystemData, styleEdge } from "../utils";
import type { ComponentKind, EdgeKind } from "../types";

// keep node/edge loose to avoid version-specific type constraints
type MyNode = RFNode;
type MyEdge = RFEdge;

export const Canvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<MyNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<MyEdge>([]);
  const [edgeKind, setEdgeKind] = useState<EdgeKind>("arrow");

  const rf = useReactFlow(); // no generics

  // inject edit callbacks into node.data
  const withEditFns = useCallback(
    (node: MyNode): MyNode => {
      const onStartEdit = (id: string) =>
        setNodes((ns) =>
          ns.map((n) => (n.id === id ? { ...n, data: { ...asSystemData(n.data), editing: true } } : n))
        );

      const onCommitLabel = (id: string, next: string) =>
        setNodes((ns) =>
          ns.map((n) =>
            n.id === id
              ? { ...n, data: { ...asSystemData(n.data), label: next, editing: false } }
              : n
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

  // DnD: start + over + drop
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
      data: { label: COMPONENT_TYPES.labelFor(kind), kind, editing: false },
    } as MyNode);

    setNodes((ns) => [...ns, newNode]);
  };

  // Connect edges
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

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
            ...styleEdge(edgeKind),
          },
          es
        )
      );
    },
    [edgeKind, setEdges]
  );

  // Update existing edges when edgeKind changes
  useEffect(() => {
    setEdges((es) => es.map((e) => ({ ...e, ...styleEdge(edgeKind) })));
  }, [edgeKind, setEdges]);

  // Double-click via ReactFlow handler (in addition to node's own dblclick)
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

  // Ensure callbacks exist on all nodes (handles pasted/loaded nodes too)
  useEffect(() => {
    setNodes((ns) => ns.map((n) => withEditFns(n)));
  }, [withEditFns, setNodes]);

  // IMPORTANT: avoid NodeTypes to dodge width/height constraint issues
  const nodeTypes: Record<string, React.ComponentType<any>> = { system: SystemNode };

  return (
    <div className="w-full h-screen grid grid-cols-[260px_1fr] bg-neutral-950 text-neutral-100">
      <Sidebar edgeKind={edgeKind} setEdgeKind={setEdgeKind} onDragStart={onDragStart} />

      <div className="relative h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeDoubleClick={onNodeDoubleClick}
          connectionMode={ConnectionMode.Strict}
          connectionLineType={ConnectionLineType.SmoothStep}
          className="bg-neutral-900"
          style={{ width: "100%", height: "100%" }}
        >
          {/* 🌑 DARK THEME MINIMAP */}
          <MiniMap
            pannable
            zoomable
            style={{
              background: "#0b0f19",
              border: "1px solid #262b3a",
              borderRadius: "6px",
            }}
            maskColor="rgba(2, 6, 23, 0.6)"
            nodeColor={() => "#334155"} // slate-700
            nodeStrokeColor={() => "#94a3b8"} // slate-300
            nodeBorderRadius={2}
          />

          {/* 🌑 DARK THEME CONTROLS */}
          <Controls
            position="bottom-left"
            style={{
              background: "#111827",
              border: "1px solid #374151",
              borderRadius: "6px",
              boxShadow: "none",
            }}
          />

          <Background
            gap={24}
            variant={BackgroundVariant.Dots}
            color="#334155"
            size={1}
          />
        </ReactFlow>
      </div>
    </div>
  );
};
