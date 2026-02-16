const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const app = require("./app");
require("dotenv").config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

global.io = io;

// -----------------------------
// MongoDB Connection State
// -----------------------------
let isMongoConnected = false;

const uri = "mongodb+srv://rajen:Ckjdz6k9ylnU85Bc@cluster0.qnsjbe8.mongodb.net/?appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    isMongoConnected = true;
    console.log("MongoDB Connected");
  })
  .catch(err => {
    isMongoConnected = false;
    console.error("MongoDB Connection Error:", err);
  });

mongoose.connection.on("disconnected", () => {
  isMongoConnected = false;
  console.log("MongoDB Disconnected");
});

mongoose.connection.on("connected", () => {
  isMongoConnected = true;
});

// -----------------------------
// Health Check Routes
// -----------------------------

// Liveness Probe
app.get("/health/live", (req, res) => {
  res.status(200).json({
    status: "UP",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Readiness Probe
app.get("/health/ready", (req, res) => {
  if (isMongoConnected) {
    return res.status(200).json({
      status: "READY",
      mongo: "connected"
    });
  } else {
    return res.status(503).json({
      status: "NOT_READY",
      mongo: "disconnected"
    });
  }
});

// -----------------------------
// Socket.IO
// -----------------------------
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// -----------------------------
// Graceful Shutdown (Important for K8s)
// -----------------------------
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});
