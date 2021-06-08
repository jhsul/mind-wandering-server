import WebSocket from "ws";

const port = 8080;
const wss = new WebSocket.Server({ port });

// This can be changed for a more convenient format
const timestamp = () => new Date().toISOString();

const clients = {};

console.log(`[${timestamp()}] Websocket server started on port ${port}`);

wss.on("connection", (ws, req) => {
  console.log(
    `[${timestamp()}] New connection established (${wss.clients.size} clients)`
  );
  ws.on("message", (msg) => {
    // Because the c# websocket client puts non ascii shit in this for some reason
    msg = msg.replace(/[^\x00-\x7F]/g, "");
    msg = msg.replace(/[\u0000-\u0019]+/g, "");
    console.log(`[${timestamp()}] Received: ${msg}`);
    switch (JSON.parse(msg).content) {
      // Register the dashboard client connection
      case "dashboardHandshake":
        clients.dashboard = ws;
        break;

      // Forward these two messages straight to the dashboard
      case "currentWord":
      case "fullText":
        console.log(`[${timestamp()}] Forwarding message to dashboard`);
        clients.dashboard.send(msg);
        break;
    }
  });
});
