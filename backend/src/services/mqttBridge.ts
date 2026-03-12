import mqtt, { MqttClient } from "mqtt";
import { Server as SocketServer } from "socket.io";
import { Device, IDevice } from "../models/Device";

export class MqttBridge {
  private client!: MqttClient;
  private io: SocketServer;
  private url: string;
  private subscribedTopics = new Set<string>();

  constructor(url: string, io: SocketServer) {
    this.url = url;
    this.io = io;
  }

  async start() {
    this.client = mqtt.connect(this.url, {
      clientId: `emq-backend-${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    this.client.on("connect", async () => {
      console.log("[MQTT] Connected to broker");
      await this.syncSubscriptions();
    });

    this.client.on("message", async (topic, payload) => {
      const message = payload.toString();
      console.log(`[MQTT] ${topic} → ${message}`);

      // Parse: {baseTopic}/out/{topicId}
      const outIndex = topic.lastIndexOf("/out/");
      if (outIndex === -1) return;

      const baseTopic = topic.substring(0, outIndex);
      const topicId = topic.substring(outIndex + 5);

      // Persist last value
      await Device.findOneAndUpdate(
        { baseTopic, "widgets.topicId": topicId },
        { $set: { "widgets.$.lastValue": message, online: true } }
      );

      // Forward to all WebSocket clients
      this.io.emit("device:data", { baseTopic, topicId, value: message });
    });

    this.client.on("error", (err) => console.error("[MQTT] Error:", err));
  }

  /** Subscribe to `{baseTopic}/out/#` for every device in the DB */
  async syncSubscriptions() {
    const devices = await Device.find().lean<IDevice[]>();
    const desiredTopics = new Set(devices.map((d) => `${d.baseTopic}/out/#`));

    // Unsubscribe removed
    for (const t of this.subscribedTopics) {
      if (!desiredTopics.has(t)) {
        this.client.unsubscribe(t);
        this.subscribedTopics.delete(t);
      }
    }

    // Subscribe new
    for (const t of desiredTopics) {
      if (!this.subscribedTopics.has(t)) {
        this.client.subscribe(t, { qos: 1 });
        this.subscribedTopics.add(t);
        console.log(`[MQTT] Subscribed: ${t}`);
      }
    }
  }

  /** Publish a command to `{baseTopic}/in/{topicId}` */
  async publishCommand(deviceId: string, topicId: string, value: string) {
    const device = await Device.findById(deviceId).lean<IDevice>();
    if (!device) return;
    const topic = `${device.baseTopic}/in/${topicId}`;
    this.client.publish(topic, value, { qos: 1 });
    console.log(`[MQTT] Published ${topic} ← ${value}`);
  }
}
