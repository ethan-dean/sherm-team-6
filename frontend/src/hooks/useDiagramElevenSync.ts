// src/hooks/useDiagramElevenSync.ts
import { useCallback, useEffect, useRef } from "react";
import { useDiagramJSON } from "@/features/system-design";

// Options:
// - sendContextualUpdate: function from useConversation to send updates to the agent
// - debounceMs: interval for checking changes (default 800ms)
export function useDiagramElevenSync(opts: {
  sendContextualUpdate?: (message: string) => void;
  debounceMs?: number;
}) {
  const { sendContextualUpdate, debounceMs = 800 } = opts;
  const getDiagramJSON = useDiagramJSON();
  const tRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track last three states: two states ago, one state ago, current
  const twoStatesAgoRef = useRef<string>("");
  const oneStateAgoRef = useRef<string>("");
  const currentStateRef = useRef<string>("");

  const check = useCallback(() => {
    const diagram = getDiagramJSON();

    // Compare diagram without timestamp to detect actual changes
    const { timestamp, ...diagramWithoutTimestamp } = diagram;
    const snapshot = JSON.stringify(diagramWithoutTimestamp);

    // Shift states: two_ago <- one_ago <- current <- new
    twoStatesAgoRef.current = oneStateAgoRef.current;
    oneStateAgoRef.current = currentStateRef.current;
    currentStateRef.current = snapshot;

    // Calculate diffs
    const diff1HasChange = twoStatesAgoRef.current !== oneStateAgoRef.current;
    const diff2HasChange = oneStateAgoRef.current !== currentStateRef.current;

    // Send only when: there was a change (diff1) followed by stability (no diff2)
    // This means user stopped making changes
    if (diff1HasChange && !diff2HasChange && currentStateRef.current !== "" && sendContextualUpdate) {
      console.log('[DiagramSync] Changes detected then stabilized - sending update');

      // Send the full diagram with timestamp
      const fullDiagram = getDiagramJSON();
      const fullSnapshot = JSON.stringify(fullDiagram);
      const text = [
        "### Current diagram state (JSON)",
        "Use this as the authoritative UI state for the ongoing system design.",
        "",
        fullSnapshot,
      ].join("\n");

      sendContextualUpdate(text);
    }
  }, [getDiagramJSON, sendContextualUpdate]);

  // Start/stop the interval-based checking
  const start = useCallback(() => {
    if (tRef.current) return; // Already running
    console.log('[DiagramSync] Starting change detection');

    // Initialize with current state
    const diagram = getDiagramJSON();
    const { timestamp, ...diagramWithoutTimestamp } = diagram;
    currentStateRef.current = JSON.stringify(diagramWithoutTimestamp);

    tRef.current = setInterval(check, debounceMs);
  }, [check, debounceMs, getDiagramJSON]);

  const stop = useCallback(() => {
    if (tRef.current) {
      console.log('[DiagramSync] Stopping change detection');
      clearInterval(tRef.current);
      tRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Expose start/stop controls and manual push
  return {
    start,
    stop,
    pushNow: () => {
      if (!sendContextualUpdate) return;

      const diagram = getDiagramJSON();
      const fullSnapshot = JSON.stringify(diagram);
      const text = [
        "### Current diagram state (JSON)",
        "Use this as the authoritative UI state for the ongoing system design.",
        "",
        fullSnapshot,
      ].join("\n");
      sendContextualUpdate(text);
    }
  };
}
