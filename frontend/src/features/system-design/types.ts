// types.ts
export type EdgeKind = "line" | "arrow"; // "arrow" = arrow pointing to target

export type ComponentKind =
  | "API Gateway"
  | "SQL DB"
  | "NoSQL DB"
  | "Service"
  | "Object Storage"
  | "CDN"
  | "Queue"
  | "Cache";

// ✅ Extend Record<string, unknown> to satisfy React Flow's Node<Data> constraint
export interface SystemNodeData extends Record<string, unknown> {
  label: string;
  kind: ComponentKind;
  editing?: boolean;
  onStartEdit?: (id: string) => void;
  onCommitLabel?: (id: string, next: string) => void;
  onCancelEdit?: (id: string) => void;
}
