import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";

type FrameRow = {
  timestamp: number;             // bigint in DB; comes back as number in JS client
  suspicion_score: number | null;
  reasons: unknown;              // jsonb (array)
};

type Props = {
  sessionId?: string;
  assessmentId?: string;
  height?: number;
  threshold?: number;
};

function formatReasons(reasons: unknown) {
  const arr = Array.isArray(reasons) ? (reasons as unknown[]) : [];
  if (!arr.length) return "No suspicious behavior detected.";
  return arr.map((r) => `• ${String(r)}`).join("\n");
}

// Recharts tooltip content
function TooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  const time = p?.time instanceof Date ? p.time.toLocaleTimeString() : "";
  const score = p?.score ?? 0;
  const reasonsText = formatReasons(p?.reasons);
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.9)",
        border: "1px solid rgba(98, 0, 69, 0.5)",
        borderRadius: 8,
        padding: 10,
        color: "white",
        maxWidth: 360,
        whiteSpace: "pre-wrap",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{time}</div>
      <div style={{ marginBottom: 6 }}>Suspicion: {score}</div>
      <div>{reasonsText}</div>
    </div>
  );
}

export default function ProctoringSuspicionChart({
  sessionId,
  assessmentId,
  height = 350,
  threshold = 80,
}: Props) {
  const [rows, setRows] = useState<FrameRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      let q = supabase
        .from("proctoring_frames")
        .select<"timestamp,suspicion_score,reasons", FrameRow>("timestamp,suspicion_score,reasons")
        .order("timestamp", { ascending: true });

      if (sessionId) q = q.eq("session_id", sessionId);
      if (assessmentId) q = q.eq("assessment_id", assessmentId);

      const { data, error } = await q;

      if (error) {
        console.error("Failed to load proctoring_frames:", error);
        setRows([]);
      } else {
        // Optional: peek at a few rows during dev
        console.log("frames sample", data?.slice(0, 3));
        setRows(data ?? []);
      }
      setLoading(false);
    })();
  }, [sessionId, assessmentId]);

  const dataset = useMemo(
    () =>
      (rows ?? []).map((r) => ({
        time: new Date(Number(r.timestamp)), // from bigint (ms) to Date
        score: typeof r.suspicion_score === "number" ? r.suspicion_score : 0,
        reasons: r.reasons,
      })),
    [rows]
  );

  // Recharts expects primitive values for axis labels; we’ll format Dates in the tick formatter.
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={dataset} margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis
            dataKey="time"
            tickFormatter={(d: Date) => (d instanceof Date ? d.toLocaleTimeString() : String(d))}
            stroke="rgba(255,255,255,0.7)"
          />
          <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.7)" />
          <Tooltip content={<TooltipContent />} />
          {/* Shade above threshold */}
          <ReferenceArea y1={threshold} y2={100} fill="rgba(211,47,47,0.35)" strokeOpacity={0} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#90caf9"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}
