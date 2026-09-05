import { useEffect, useRef, useState, useCallback } from "react";

// shape of a message coming back from the server
type IncomingMessage = {
  from: string;
  message: string;
};

export function useWebSocket(clientId: string, serverUrl: string) {
  // holds the live connection so we can send through it later
  const wsRef = useRef<WebSocket | null>(null);
  // list of every message received so far
  const [messages, setMessages] = useState<IncomingMessage[]>([]);
  // true/false for showing online vs connecting on screen
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // connects to something like ws://192.168.1.23:8000/ws/alice
    const ws = new WebSocket(`${serverUrl}/ws/${clientId}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = (err) => console.log("WebSocket error:", err);
    ws.onmessage = (event) => {
      // new message came in, parse it and add it to the list
      const data: IncomingMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    // close the connection if this screen ever unmounts
    return () => ws.close();
  }, [clientId, serverUrl]);

  // sends a message to a specific recipient through the open connection
  const sendMessage = useCallback((to: string, message: string) => {
    wsRef.current?.send(JSON.stringify({ to, message }));
  }, []);

  // hand back what the screen needs: status, messages, and a way to send
  return { connected, messages, sendMessage };
}