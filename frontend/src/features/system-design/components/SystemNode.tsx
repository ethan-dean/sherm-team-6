// src/features/system-design/components/SystemNode.tsx
import React from "react";
import {
  Handle,
  Position,
  type NodeProps,
  type Node as RFNode,
} from "@xyflow/react";

/* =========================
   THEME — tweak freely
   ========================= */

// Node chrome (visible even with DEBUG_OUTLINE=false)
const NODE_CORNER_RADIUS = 12;
const NODE_BACKGROUND = "rgba(15, 23, 42, 0.7)"; // slate-900/70
const NODE_BORDER = "1px solid #334155"; // slate-700
const NODE_BOX_SHADOW =
  "0 1px 2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)";

// Min editor width when double-clicking label
const LABEL_MIN_EDITOR_PX = 140;

// Icon defaults (can be overridden per-kind below)
const ICON_DEFAULT_STROKE = "#cbd5e1"; // slate-300
const ICON_DEFAULT_STROKE_WIDTH: number | string = 1.75;

// Optional per-kind icon styles (stroke / strokeWidth)
const ICON_STYLE_BY_KIND: Partial<
  Record<ComponentKind, { stroke?: string; strokeWidth?: number | string }>
> = {
  "API Gateway": { stroke: "#a5b4fc", strokeWidth: 2 }, // indigo-300
  "SQL DB": { stroke: "#86efac" }, // green-300
  "NoSQL DB": { stroke: "#fca5a5" }, // red-300
  CDN: { stroke: "#67e8f9" }, // cyan-300
  Queue: { stroke: "#fde68a" }, // amber-300
  Service: { stroke: "#e9d5ff" }, // purple-200
  Cache: { stroke: "#f9a8d4" }, // pink-300
  "Object Storage": { stroke: "#fcd34d" }, // amber-300
};

/* =========================
   CONFIG — sizes & layout
   ========================= */

export type ComponentKind =
  | "API Gateway"
  | "SQL DB"
  | "NoSQL DB"
  | "CDN"
  | "Queue"
  | "Service"
  | "Cache"
  | "Object Storage";

type Side = "top" | "right" | "bottom" | "left";

// Toggle a dashed outline to visualize node bounds while tuning
const DEBUG_OUTLINE = false;

// Shared handle anchors for ALL kinds (use % so they follow node size)
type AnchorVal = string | number;
type Anchors = {
  top: { left: AnchorVal };
  right: { top: AnchorVal };
  bottom: { left: AnchorVal };
  left: { top: AnchorVal };
};
export const ANCHORS_DEFAULT: Anchors = {
  top: { left: "50%" },
  right: { top: "50%" },
  bottom: { left: "50%" },
  left: { top: "50%" },
};

// Node size per kind (outer box)
type Size = { w: number; h: number };
export const SHAPE_SIZE: { [K in ComponentKind]: Size } = {
  "API Gateway": { w: 200, h: 120 },
  "SQL DB": { w: 110, h: 120 },
  "NoSQL DB": { w: 110, h: 120 },
  CDN: { w: 160, h: 80 },
  Queue: { w: 200, h: 40 },
  Service: { w: 150, h: 70 },
  Cache: { w: 100, h: 100 },
  "Object Storage": { w: 70, h: 80 },
};

// Icon layout per kind (inside the node)
// - w/h: number (px) or string ("85%" / "120px")
// - x/y: number (px) or string ("-6%" / "10px")
type IconLayout = {
  w: number | string;
  h: number | string;
  x: number | string;
  y: number | string;
};
export const SHAPE_ICON_LAYOUT: { [K in ComponentKind]: IconLayout } = {
  "API Gateway": { w: 240, h: 150, x: 0, y: 0 },
  "SQL DB": { w: 140, h: 140, x: 0, y: 0 },
  "NoSQL DB": { w: 140, h: 140, x: 0, y: 0 },
  CDN: { w: 200, h: 150, x: 0, y: 0 },
  Queue: { w: 240, h: 80, x: 0, y: 0 },
  Service: { w: 180, h: 140, x: 0, y: 0 },
  Cache: { w: 120, h: 120, x: 0, y: 0 },
  "Object Storage": { w: 100, h: 100, x: 0, y: 0 },
};

/* =========================
   App types you likely have
   ========================= */
export type SystemNodeData = {
  label: string;
  kind: ComponentKind | string; // allow looser inputs; we’ll narrow below
  editing?: boolean;
  onStartEdit?: (id: string) => void;
  onCommitLabel?: (id: string, next: string) => void;
  onCancelEdit?: (id: string) => void;
};

type MyNode = RFNode<SystemNodeData>;

/* =========================
   Icons (Lucide) + helpers
   ========================= */
import {
  Diamond as LucideDiamond,
  Database as LucideDatabase, // cylinder-like
  Cloud as LucideCloud,
  RectangleHorizontal as LucideRectangleHorizontal,
  Layers as LucideLayers,
} from "lucide-react";

type LucideIcon = React.ComponentType<{
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
}>;

type ShapeProps = {
  width: number;
  height: number;
  stroke?: string;
  strokeWidth?: number | string;
  className?: string;
  kind: ComponentKind;
};

/* ---------- Type guard to avoid TS7053 ---------- */
const DEFAULT_KIND: ComponentKind = "Service";
function isComponentKind(x: any): x is ComponentKind {
  return typeof x === "string" && x in SHAPE_SIZE;
}
function getKindSafe(x: any): ComponentKind {
  return isComponentKind(x) ? x : DEFAULT_KIND;
}
/* ----------------------------------------------- */

function IconAsShape({
  Icon,
  width,
  height,
  stroke,
  strokeWidth,
  className,
  kind,
}: ShapeProps & { Icon: LucideIcon }) {
  const layout = SHAPE_ICON_LAYOUT[kind];
  const iconW = layout?.w ?? "100%";
  const iconH = layout?.h ?? "100%";
  const x = layout?.x ?? 0;
  const y = layout?.y ?? 0;

  // Per-kind icon style override
  const kindIconStyle = ICON_STYLE_BY_KIND[kind] ?? {};
  const finalStroke = stroke ?? kindIconStyle.stroke ?? ICON_DEFAULT_STROKE;
  const finalStrokeWidth =
    strokeWidth ?? kindIconStyle.strokeWidth ?? ICON_DEFAULT_STROKE_WIDTH;

  // Props that must hit the inner <svg> to allow non-uniform scaling.
  // We cast to `any` so TS doesn't reject them on lucide's component,
  // but they still forward to <svg> via {...rest}.
  const svgProps = {
    width: "100%",
    height: "100%",
    preserveAspectRatio: "none",
    style: { display: "block" }, // avoid baseline gap
  } as any;

  return (
    <div
      className={className}
      style={{
        width,
        height,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: NODE_CORNER_RADIUS,
        background: "transparent", // no fill
        border: "none", // no border box
        boxShadow: "none", // remove shadow
      }}
      aria-hidden
    >
      <div
        style={{
          position: "absolute",
          width: typeof iconW === "number" ? `${iconW}px` : iconW,
          height: typeof iconH === "number" ? `${iconH}px` : iconH,
          transform: `translate(${typeof x === "number" ? `${x}px` : x}, ${
            typeof y === "number" ? `${y}px` : y
          })`,
          transformOrigin: "center",
        }}
      >
        {/* DO NOT use `size` (it forces square). Spread our svgProps instead. */}
        <Icon
          {...svgProps}
          color={finalStroke}
          strokeWidth={finalStrokeWidth}
          className="w-full h-full"
        />
      </div>

      {/* Keep strokes consistent under React Flow zoom */}
      <style>{`
        .w-full.h-full svg, .w-full.h-full { display: block; }
        .w-full.h-full * { vector-effect: non-scaling-stroke; }
      `}</style>
    </div>
  );
}

// Map kinds → icons (all premade)
function ShapeForKind(kind: ComponentKind, w: number, h: number) {
  const base: ShapeProps = { width: w, height: h, kind };

  switch (kind) {
    case "API Gateway":
      return <IconAsShape {...base} Icon={LucideDiamond} />;
    case "SQL DB":
      return <IconAsShape {...base} Icon={LucideDatabase} />;
    case "NoSQL DB":
      return <IconAsShape {...base} Icon={LucideDatabase} />;
    case "CDN":
      return <IconAsShape {...base} Icon={LucideCloud} />;
    case "Queue":
      return <IconAsShape {...base} Icon={LucideRectangleHorizontal} />;
    case "Service":
      return <IconAsShape {...base} Icon={LucideRectangleHorizontal} />;
    case "Cache":
      return <IconAsShape {...base} Icon={LucideLayers} />;
    case "Object Storage":
      return <IconAsShape {...base} Icon={LucideDatabase} />;
  }
}

/* =========================
   SystemNode component
   ========================= */

const DOT = 12;

const dotStyle: React.CSSProperties = {
  position: "absolute",
  width: DOT,
  height: DOT,
  borderRadius: DOT / 2,
  background: "#94a3b8",
  pointerEvents: "none",
  zIndex: 2,
};

const handleBase: React.CSSProperties = {
  position: "absolute",
  width: DOT,
  height: DOT,
  borderRadius: DOT / 2,
  opacity: 0,
  pointerEvents: "auto",
  zIndex: 3,
};

const OUTLINE_STYLE: React.CSSProperties = {
  border: "1px dashed rgba(56, 189, 248, 0.75)",
  borderRadius: NODE_CORNER_RADIUS,
};

// CSS length helper
function asLen(v: string | number): string {
  return typeof v === "number" ? `${v}px` : v;
}

function styleForSide(side: Side): React.CSSProperties {
  if (side === "top")
    return {
      top: -DOT / 2,
      left: asLen(ANCHORS_DEFAULT.top.left),
      transform: "translate(-50%, -50%)",
    };
  if (side === "bottom")
    return {
      bottom: -DOT / 2,
      left: asLen(ANCHORS_DEFAULT.bottom.left),
      transform: "translate(-50%, 50%)",
    };
  if (side === "right")
    return {
      right: -DOT / 2,
      top: asLen(ANCHORS_DEFAULT.right.top),
      transform: "translate(50%, -50%)",
    };
  return {
    left: -DOT / 2,
    top: asLen(ANCHORS_DEFAULT.left.top),
    transform: "translate(-50%, -50%)",
  };
}

export const SystemNode: React.FC<NodeProps<MyNode>> = ({ id, data }) => {
  // Narrow 'data.kind' from unknown/any/string → ComponentKind safely
  const kindKey = getKindSafe((data as SystemNodeData).kind);

  const { w, h } = SHAPE_SIZE[kindKey];

  const topPos = styleForSide("top");
  const rightPos = styleForSide("right");
  const bottomPos = styleForSide("bottom");
  const leftPos = styleForSide("left");

  return (
    <div className="relative" style={{ width: w, height: h }}>
      {DEBUG_OUTLINE && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ ...OUTLINE_STYLE, zIndex: 1 }}
        />
      )}

      {/* Icon surface */}
      <div
        className="drag-surface absolute inset-0 cursor-move select-none"
        style={{ zIndex: 0 }}
      >
        {ShapeForKind(kindKey, w, h)}
      </div>

      {/* Centered label/editor */}
      <div
        className="absolute inset-0 grid place-items-center pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {!data.editing ? (
          <div
            className="pointer-events-auto font-semibold text-neutral-200 text-center px-3 drag-surface select-none cursor-move"
            onDoubleClick={() => data.onStartEdit?.(id)}
            title="Double-click to rename"
            style={{
              textShadow: "0 1px 0 rgba(0,0,0,0.4)",
            }}
          >
            {data.label}
          </div>
        ) : (
          <input
            autoFocus
            className="pointer-events-auto bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-neutral-100 text-center nodrag"
            defaultValue={data.label}
            style={{
              // Maintain a sensible minimum width while editing
              minWidth: LABEL_MIN_EDITOR_PX,
              width: "85%", // keep your % behavior
              maxWidth: 420, // optional cap
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={(e) => data.onCommitLabel?.(id, e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                data.onCommitLabel?.(id, (e.target as HTMLInputElement).value);
              if (e.key === "Escape") data.onCancelEdit?.(id);
            }}
          />
        )}
      </div>

      {/* Handles — shared anchors for all kinds */}
      <div style={{ ...dotStyle, ...topPos }} />
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        style={{ ...handleBase, ...topPos }}
      />
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        style={{ ...handleBase, ...topPos }}
      />

      <div style={{ ...dotStyle, ...rightPos }} />
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        style={{ ...handleBase, ...rightPos }}
      />
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        style={{ ...handleBase, ...rightPos }}
      />

      <div style={{ ...dotStyle, ...bottomPos }} />
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        style={{ ...handleBase, ...bottomPos }}
      />
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        style={{ ...handleBase, ...bottomPos }}
      />

      <div style={{ ...dotStyle, ...leftPos }} />
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        style={{ ...handleBase, ...leftPos }}
      />
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        style={{ ...handleBase, ...leftPos }}
      />
    </div>
  );
};

// export default SystemNode; // uncomment if you prefer default import
