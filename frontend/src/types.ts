export interface Widget {
  _id: string;
  type: "switch" | "slider" | "viewer";
  label: string;
  topicId: string;
  lastValue: string;
  min?: number;
  max?: number;
}

export interface Device {
  _id: string;
  name: string;
  baseTopic: string;
  icon: string;
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
}
