import { MarkerType, type Edge as RFEdge } from "@xyflow/react";
import type { EdgeKind, SystemNodeData } from "./types";

type MyEdge = RFEdge;

/** Edge styling helper */
export function styleEdge(kind: EdgeKind): Partial<MyEdge> {
  if (kind === "line") return { markerStart: undefined, markerEnd: undefined, style: { strokeWidth: 2 } };
  return { style: { strokeWidth: 2 }, markerStart: { type: MarkerType.ArrowClosed }, markerEnd: undefined };
}

/** Narrow unknown node.data to our shape */
export function asSystemData(data: unknown): SystemNodeData {
  return (data ?? {}) as SystemNodeData;
}
