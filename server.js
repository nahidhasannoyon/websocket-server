const WebSocket = require("ws");
const { URL } = require("url");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws, req) => {
  // Client IP
  console.log("Connected from:", req.socket.remoteAddress);

  // All HTTP headers
  console.log("Headers:", req.headers);

  // Parse query parameters
  // req.url might be like "/?token=XYZ&foo=bar"
  const params = new URL(req.url, `ws://${req.headers.host}`).searchParams;
  console.log("token:", params.get("token"));
  console.log("all query params:", Object.fromEntries(params));

  ws.on("message", (message) => {
    try {
      const msg = JSON.parse(message);
      if (msg.type === "ping") {
        console.log("→ received ping");
        return ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch (_) {}
    console.log("→ received:", message);
    // echo back as text
    const text = message.toString();
    wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) c.send(text);
    });
  });

  ws.on("close", () => console.log("Client disconnected"));
});

console.log("WebSocket server listening on ws://localhost:8080");
