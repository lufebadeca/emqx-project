import { Schema, model, Document } from "mongoose";

export interface IWidget {
  type: "switch" | "slider" | "viewer";
  label: string;
  topicId: string;      // unique suffix — full topic = `{baseTopic}/out/{topicId}`
  lastValue: string;
  min?: number;          // for slider
  max?: number;          // for slider
}

export interface IDevice extends Document {
  name: string;
  baseTopic: string;     // e.g. "home/esp32-01"
  icon: string;          // Lucide icon name e.g. "cpu", "lightbulb"
  widgets: IWidget[];
  online: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const widgetSchema = new Schema<IWidget>(
  {
    type: { type: String, enum: ["switch", "slider", "viewer"], required: true },
    label: { type: String, required: true },
    topicId: { type: String, required: true },
    lastValue: { type: String, default: "0" },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
  },
  { _id: true }
);

const deviceSchema = new Schema<IDevice>(
  {
    name: { type: String, required: true },
    baseTopic: { type: String, required: true, unique: true },
    icon: { type: String, default: "cpu" },
    widgets: [widgetSchema],
    online: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Device = model<IDevice>("Device", deviceSchema);
