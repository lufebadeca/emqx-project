import type { Device } from "./types";

const BASE = "/api/devices";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    const msg = text.trim() ? text : `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  if (!text.trim()) {
    throw new Error("Respuesta vacía del servidor");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Respuesta inválida del servidor (no es JSON)");
  }
}

export async function fetchDevices(): Promise<Device[]> {
  const res = await fetch(BASE);
  return parseJsonOrThrow<Device[]>(res);
}

export async function fetchDevice(id: string): Promise<Device> {
  const res = await fetch(`${BASE}/${id}`);
  return parseJsonOrThrow<Device>(res);
}

export async function createDevice(data: Partial<Device>): Promise<Device> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJsonOrThrow<Device>(res);
}

export async function updateDevice(id: string, data: Partial<Device>): Promise<Device> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJsonOrThrow<Device>(res);
}

export async function deleteDevice(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text.trim() || `HTTP ${res.status} ${res.statusText}`);
  }
}
