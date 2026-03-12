import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketServer } from "socket.io";
import mongoose from "mongoose";
import { deviceRouter } from "./routes/devices";
import { MqttBridge } from "./services/mqttBridge";

const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" },
});

app.use(cors());
app.use(express.json());
app.use("/api/devices", deviceRouter);

const PORT = Number(process.env.PORT) || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/emq-iot";
const MQTT_URL = process.env.MQTT_URL || "mqtt://localhost:1883";

async function bootstrap() {
  await mongoose.connect(MONGO_URI);
  console.log("[DB] MongoDB connected");

  const bridge = new MqttBridge(MQTT_URL, io);
  await bridge.start();

  // Expose bridge so routes can trigger re-subscription after CRUD
  app.set("mqttBridge", bridge);

  io.on("connection", (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Client sends a command: { deviceId, topicId, value }
    socket.on("command", (payload: { deviceId: string; topicId: string; value: string }) => {
      bridge.publishCommand(payload.deviceId, payload.topicId, payload.value);
    });

    socket.on("disconnect", () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => console.log(`[API] Listening on :${PORT}`));
}

bootstrap().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
