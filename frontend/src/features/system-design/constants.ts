import { MarkerType } from "@xyflow/react";
import type { ComponentKind } from "./types";

const ALL: ComponentKind[] = [
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

export const COMPONENT_TYPES = {
  all: ALL,
  labelFor: (kind: ComponentKind) => DEFAULT_LABEL[kind],
};
