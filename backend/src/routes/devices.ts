import { Router, Request, Response } from "express";
import { Device } from "../models/Device";
import { MqttBridge } from "../services/mqttBridge";

export const deviceRouter = Router();

// GET all devices
deviceRouter.get("/", async (_req: Request, res: Response) => {
  const devices = await Device.find().sort({ createdAt: -1 });
  res.json(devices);
});

// GET single device
deviceRouter.get("/:id", async (req: Request, res: Response) => {
  const device = await Device.findById(req.params.id);
  if (!device) return res.status(404).json({ error: "Not found" });
  res.json(device);
});

// POST create device
deviceRouter.post("/", async (req: Request, res: Response) => {
  const device = await Device.create(req.body);
  // Refresh MQTT subscriptions
  const bridge: MqttBridge = req.app.get("mqttBridge");
  await bridge.syncSubscriptions();
  res.status(201).json(device);
});

// PUT update device
deviceRouter.put("/:id", async (req: Request, res: Response) => {
  const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!device) return res.status(404).json({ error: "Not found" });
  const bridge: MqttBridge = req.app.get("mqttBridge");
  await bridge.syncSubscriptions();
  res.json(device);
});

// DELETE device
deviceRouter.delete("/:id", async (req: Request, res: Response) => {
  await Device.findByIdAndDelete(req.params.id);
  const bridge: MqttBridge = req.app.get("mqttBridge");
  await bridge.syncSubscriptions();
  res.status(204).end();
});
