export type IconColorKey = "primary" | "danger" | "success" | "warning" | "muted" | "info";

export interface Widget {
  _id: string;
  type: "switch" | "slider" | "viewer";
  label: string;
  topicId: string;
  lastValue: string;
  min?: number;
  max?: number;
  icon?: string;
  iconColor?: IconColorKey;
}

export interface Device {
  _id: string;
  name: string;
  baseTopic: string;
  icon: string;
  iconColor?: IconColorKey;
  widgets: Widget[];
  online: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetFormData {
  type: "switch" | "slider" | "viewer";
  label: string;
  topicId: string;
  min?: number;
  max?: number;
  icon?: string;
  iconColor?: IconColorKey;
}
