import { Schema, model, Document } from "mongoose";

const ICON_COLOR_VALUES = ["primary", "danger", "success", "warning", "muted", "info"] as const;

export interface IWidget {
  type: "switch" | "slider" | "viewer";
  label: string;
  topicId: string;
  lastValue: string;
  min?: number;
  max?: number;
  icon?: string;
  iconColor?: string;    // system color: primary | danger | success | warning | muted | info
}

export interface IDevice extends Document {
  name: string;
  baseTopic: string;
  icon: string;
  iconColor?: string;    // system color for device icon
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
    icon: { type: String, default: "" },
    iconColor: { type: String, enum: ICON_COLOR_VALUES, default: "primary" },
  },
  { _id: true }
);

const deviceSchema = new Schema<IDevice>(
  {
    name: { type: String, required: true },
    baseTopic: { type: String, required: true, unique: true },
    icon: { type: String, default: "cpu" },
    iconColor: { type: String, enum: ICON_COLOR_VALUES, default: "primary" },
    widgets: [widgetSchema],
    online: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Device = model<IDevice>("Device", deviceSchema);
