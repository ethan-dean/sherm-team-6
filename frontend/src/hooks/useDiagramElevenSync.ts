// src/hooks/useDiagramElevenSync.ts
import { useCallback, useEffect, useRef } from "react";
import { useDiagramJSON } from "@/features/system-design";
import { initElevenWS, sendContextUpdate } from "@/lib/eleven/wsClient";

// Options:
// - wsUrl: the live ElevenLabs conversation WebSocket URL for THIS call
// - debounceMs: avoid spamming the socket on rapid edits
export function useDiagramElevenSync(opts: { wsUrl: string; debounceMs?: number }) {
  const { wsUrl, debounceMs = 800 } = opts;
  const getDiagramJSON = useDiagramJSON();
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef<string>("");

  // init socket once for this component tree
  useEffect(() => {
    if (wsUrl) initElevenWS(wsUrl);
  }, [wsUrl]);

  const flush = useCallback(() => {
    const diagram = getDiagramJSON();
    const snapshot = JSON.stringify(diagram);

    // Skip if identical to last sent
    if (snapshot === lastSentRef.current) return;
    lastSentRef.current = snapshot;

    // Keep the text concise but clearly structured (as the docs show)
    const text = [
      "### Current diagram state (JSON)",
      "Use this as the authoritative UI state for the ongoing system design.",
      "",
      snapshot,
    ].join("\n");

    sendContextUpdate(text);
  }, [getDiagramJSON]);

  // Schedule a debounced push
  const schedule = useCallback(() => {
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(flush, debounceMs);
  }, [flush, debounceMs]);

  // Expose both manual and debounced triggers
  return { pushNow: flush, schedule };
}
