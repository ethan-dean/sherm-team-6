// src/lib/eleven/wsClient.ts
// Minimal ElevenLabs Conversational AI WebSocket client (browser or Node)
// Requires a live conversation WS URL that your app obtains when starting the call.

let ws: WebSocket | null = null;
let isConnecting = false;
const pending: string[] = [];

// Callbacks for connection lifecycle
let onConnectCallback: (() => void) | null = null;
let onDisconnectCallback: (() => void) | null = null;

// Register callbacks for connection events
export function setWSCallbacks(callbacks: {
  onConnect?: () => void;
  onDisconnect?: () => void;
}) {
  onConnectCallback = callbacks.onConnect || null;
  onDisconnectCallback = callbacks.onDisconnect || null;
  console.log('[WS] Callbacks registered:', {
    hasConnect: !!onConnectCallback,
    hasDisconnect: !!onDisconnectCallback
  });
}

// Optional auth header is only available in Node (not browsers). For browsers,
// pass a WS URL that already encodes/authorizes the session.
export function initElevenWS(wsUrl: string) {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  if (isConnecting) return;
  isConnecting = true;

  ws = new WebSocket(wsUrl); // e.g. wss://api.elevenlabs.io/v1/convai/conversation?agent_id=...&token=...

  ws.onopen = () => {
    console.log('[WS] Connection opened');
    isConnecting = false;
    // flush any queued messages
    while (pending.length) {
      const msg = pending.shift()!;
      ws!.send(msg);
    }
    // Notify callback
    if (onConnectCallback) {
      onConnectCallback();
    }
  };

  ws.onclose = () => {
    console.log('[WS] Connection closed');
    isConnecting = false;
    // Notify callback
    if (onDisconnectCallback) {
      onDisconnectCallback();
    }
    // Optional: implement backoff reconnect if your session allows it
  };

  ws.onerror = (error) => {
    console.error('[WS] Error:', error);
    // swallow; rely on onclose for reconnect logic if desired
  };
}

export function elevenWSReady(): boolean {
  return !!ws && ws.readyState === WebSocket.OPEN;
}

// Send a contextual_update text blob mid-call
export function sendContextUpdate(text: string) {
  const payload = JSON.stringify({
    type: "contextual_update",
    text,
  });

    console.log("[WS →]", payload); // 👈 log outgoing data

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(payload);
  } else {
    pending.push(payload);
  }
}
