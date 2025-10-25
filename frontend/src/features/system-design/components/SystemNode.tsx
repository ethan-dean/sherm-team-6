import React, { useEffect, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { asSystemData } from "../utils";

/**
 * NOTE: we keep props as `any` to sidestep strict NodeProps width/height
 * differences across @xyflow/react versions. Inside, we safely narrow data.
 */
export const SystemNode: React.FC<any> = ({ id, data: rawData, selected }) => {
  const data = asSystemData(rawData);
  const [draft, setDraft] = useState<string>(data.label ?? "");

  useEffect(() => {
    setDraft(data.label ?? "");
  }, [data.label]);

  const commit = (value: string) => {
    const trimmed = value.trim();
    data.onCommitLabel?.(id, trimmed.length ? trimmed : data.label ?? "");
  };

  const cancel = () => {
    setDraft(data.label ?? "");
    data.onCancelEdit?.(id);
  };

  return (
    <div
      onDoubleClick={() => data.onStartEdit?.(id)}
      className={`rounded-xl border px-3 py-2 text-sm shadow-sm min-w-[160px] bg-neutral-900 ${
        selected ? "border-sky-400" : "border-neutral-700"
      }`}
    >
      {data.editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(draft);
            if (e.key === "Escape") cancel();
          }}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-100 outline-none"
          aria-label="Rename component"
        />
      ) : (
        <>
          <div className="text-neutral-100 font-medium leading-none">{data.label}</div>
          <div className="text-[11px] text-neutral-400">{data.kind}</div>
        </>
      )}

      {/* Sources */}
      <Handle id="source-top" type="source" position={Position.Top} className="!w-3 !h-3 rounded-full bg-zinc-300" />
      <Handle id="source-right" type="source" position={Position.Right} className="!w-3 !h-3 rounded-full bg-zinc-300" />
      <Handle id="source-bottom" type="source" position={Position.Bottom} className="!w-3 !h-3 rounded-full bg-zinc-300" />
      <Handle id="source-left" type="source" position={Position.Left} className="!w-3 !h-3 rounded-full bg-zinc-300" />

      {/* Targets */}
      <Handle id="target-top" type="target" position={Position.Top} className="!w-3 !h-3 rounded-full bg-sky-300" />
      <Handle id="target-right" type="target" position={Position.Right} className="!w-3 !h-3 rounded-full bg-sky-300" />
      <Handle id="target-bottom" type="target" position={Position.Bottom} className="!w-3 !h-3 rounded-full bg-sky-300" />
      <Handle id="target-left" type="target" position={Position.Left} className="!w-3 !h-3 rounded-full bg-sky-300" />
    </div>
  );
};
