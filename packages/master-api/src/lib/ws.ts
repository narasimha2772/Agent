import { Server as HttpServer } from "http";
import WebSocket, { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;

export function initWsServer(server: HttpServer) {
  wss = new WebSocketServer({ server, path: "/ws/events" });
  wss.on("connection", (ws: WebSocket) => {
    ws.send(JSON.stringify({ event: "connected", ts: new Date().toISOString() }));
  });
}

export function publishEvent(event: string, payload: any) {
  if (!wss) return;
  const msg = JSON.stringify({ event, payload, ts: new Date().toISOString() });
  wss.clients.forEach((c) => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}

