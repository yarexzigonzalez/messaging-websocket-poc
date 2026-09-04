import { useEffect, useRef, useState, useCallback } from "react";

type IncomingMessage = {
  from: string;
  message: string;
};

// Opens a WebSocket connection identified by clientId and keeps track
// of incoming messages. No reconnect logic and no auth check yet, both
// left out on purpose for this POC.
export function useWebSocket(clientId: string, serverUrl: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<IncomingMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`${serverUrl}/ws/${clientId}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = (err) => console.log("WebSocket error:", err);
    ws.onmessage = (event) => {
      const data: IncomingMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => ws.close();
  }, [clientId, serverUrl]);

  const sendMessage = useCallback((to: string, message: string) => {
    wsRef.current?.send(JSON.stringify({ to, message }));
  }, []);

  return { connected, messages, sendMessage };
}
