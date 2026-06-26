const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = 8000;

const server = http.createServer((req, res) => {
  let filePath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath).toLowerCase();

  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".json": "application/json"
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("404 Not Found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });

    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("client connected");

  ws.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`p5 server running at http://localhost:${PORT}`);
  console.log(`WebSocket running at ws://localhost:${PORT}`);
});