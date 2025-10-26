// src/components/admin/ProctoringSuspicionChart.tsx
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { supabase } from "@/lib/supabase";

type FrameRow = {
  timestamp: number | string;
  suspicion_score: number | null;
  reasons: unknown;
};

type Props = {
  sessionId?: string;
  assessmentId?: string;
  height?: number;
  threshold?: number;
};

const customize = {
  height: 350,
  hideLegend: true,
  experimentalFeatures: { preferStrictDomainInLineCharts: true },
};

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
        .select("timestamp,suspicion_score,reasons")
        .order("timestamp", { ascending: true });

      if (sessionId) q = q.eq("session_id", sessionId);
      if (assessmentId) q = q.eq("assessment_id", assessmentId);

      const { data, error } = await q;

      if (error) {
        console.error("Failed to load proctoring_frames:", error);
        setRows([]);
      } else {
        setRows(data ?? []);
      }
      setLoading(false);
    })();
  }, [sessionId, assessmentId]);

  const dataset = useMemo(
    () =>
      (rows ?? []).map((r) => ({
        time: new Date(Number(r.timestamp)),
        score: typeof r.suspicion_score === "number" ? r.suspicion_score : 0,
        reasons: Array.isArray(r.reasons) ? (r.reasons as string[]) : [],
      })),
    [rows]
  );

  const valueFormatter = (_value: number | null, ctx: any) => {
    const idx = ctx?.dataIndex ?? 0;
    const entry = dataset[idx];
    const reasons = entry?.reasons ?? [];
    if (!reasons.length) return "No suspicious behavior detected.";
    return reasons.map((r) => `• ${r}`).join("\n");
  };

  return (
    <LineChart
      height={height}
      xAxis={[
        {
          dataKey: "time",
          scaleType: "time",
          valueFormatter: (d: Date) =>
            d instanceof Date ? d.toLocaleTimeString() : String(d),
        },
      ]}
      yAxis={[
        {
          min: 0,
          max: 100,
          width: 50,
          colorMap: {
            type: "piecewise",
            thresholds: [threshold],
            colors: ["rgba(25,118,210,0.25)", "rgba(211,47,47,0.35)"],
          },
        },
      ]}
      series={[
        {
          dataKey: "score",
          showMark: false,
          area: true,
          color: "#1976d2",
          valueFormatter,
        },
      ]}
      dataset={dataset}
      grid={{ vertical: true, horizontal: true }}
      slotProps={{
        tooltip: {
          trigger: "axis",
          sx: {
            maxWidth: 360,
            whiteSpace: "pre-wrap",
            overflow: "auto",
          },
        },
      }}
      {...customize}
    />
  );
}
