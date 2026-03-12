import type { Device } from "./types";

const BASE = "/api/devices";

export async function fetchDevices(): Promise<Device[]> {
  const res = await fetch(BASE);
  return res.json();
}

export async function fetchDevice(id: string): Promise<Device> {
  const res = await fetch(`${BASE}/${id}`);
  return res.json();
}

export async function createDevice(data: Partial<Device>): Promise<Device> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateDevice(id: string, data: Partial<Device>): Promise<Device> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteDevice(id: string): Promise<void> {
  await fetch(`${BASE}/${id}`, { method: "DELETE" });
}
