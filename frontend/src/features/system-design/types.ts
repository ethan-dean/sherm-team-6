export type EdgeKind = "line" | "arrow"; // arrow = arrow to SOURCE (marker at start)

export type ComponentKind =
  | "API Gateway"
  | "SQL DB"
  | "NoSQL DB"
  | "Service"
  | "Object Storage"
  | "CDN"
  | "Queue"
  | "Cache";

export interface SystemNodeData {
  label: string;
  kind: ComponentKind;
  editing?: boolean;
  onStartEdit?: (id: string) => void;
  onCommitLabel?: (id: string, next: string) => void;
  onCancelEdit?: (id: string) => void;
}
