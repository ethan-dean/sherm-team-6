// utils.ts
import {
  MarkerType,
  type Edge as RFEdge,
  type Node as RFNode,
  useReactFlow,
} from "@xyflow/react";
import type { EdgeKind, SystemNodeData } from "./types";

// Strong app-level aliases used everywhere
export type MyNode = RFNode<SystemNodeData>;
export type MyEdge = RFEdge;

/** Edge styling helper */
export function styleEdge(kind: EdgeKind): Partial<MyEdge> {
  if (kind === "line") return { style: { strokeWidth: 2 } };
  return { style: { strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed } };
}

/** Narrow unknown node.data to our shape (safe fallback) */
export function asSystemData(data: unknown): SystemNodeData {
  const d = (data ?? {}) as Partial<SystemNodeData>;
  return {
    label: d.label ?? "Component",
    kind: d.kind ?? "Service",
    editing: d.editing ?? false,
    onStartEdit: d.onStartEdit,
    onCommitLabel: d.onCommitLabel,
    onCancelEdit: d.onCancelEdit,
  };
}

/**
 * React hook that returns a function to get the current diagram JSON
 * directly from the ReactFlow instance (no parameters needed).
 */
export function useDiagramJSON() {
  // ✅ type the instance so getNodes/getEdges are strongly typed
  const rf = useReactFlow<MyNode, MyEdge>();

  const getDiagramJSON = () => {
    const nodes = rf.getNodes();
    const edges = rf.getEdges();

    return {
      version: 1,
      timestamp: new Date().toISOString(),
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        label: e.label,
        style: e.style,
        markerStart: e.markerStart,
        markerEnd: e.markerEnd,
      })),
    };
  };

  return getDiagramJSON;
}
