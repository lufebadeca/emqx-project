import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import * as icons from "lucide-react";
import { fetchDevices, deleteDevice } from "../api";
import { useSocket } from "../context/SocketContext";
import SwitchWidget from "../components/SwitchWidget";
import SliderWidget from "../components/SliderWidget";
import LevelViewer from "../components/LevelViewer";
import type { Device } from "../types";

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const { connected, lastMessages, sendCommand } = useSocket();

  useEffect(() => {
    fetchDevices().then(setDevices);
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDevice(id);
    setDevices((prev) => prev.filter((d) => d._id !== id));
  };

  const getIcon = (name: string) => {
    const Icon = (icons as Record<string, React.FC<{ className?: string }>>)[
      name.charAt(0).toUpperCase() + name.slice(1)
    ];
    return Icon ? <Icon className="w-6 h-6 text-emerald-400" /> : null;
  };

  const getWidgetValue = (device: Device, topicId: string, lastValue: string) => {
    const key = `${device.baseTopic}/${topicId}`;
    return lastMessages.get(key) ?? lastValue;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dispositivos</h1>

      {devices.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No hay dispositivos registrados.</p>
          <Link to="/devices/new" className="text-emerald-400 underline mt-2 inline-block">
            Crear el primero
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <div key={device._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getIcon(device.icon)}
                <div>
                  <h2 className="font-semibold">{device.name}</h2>
                  <p className="text-xs text-gray-500 font-mono">{device.baseTopic}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Link
                  to={`/devices/${device._id}/edit`}
                  className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(device._id)}
                  className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Widgets */}
            <div className="space-y-3">
              {device.widgets.map((w) => {
                const value = getWidgetValue(device, w.topicId, w.lastValue);

                if (w.type === "switch") {
                  return (
                    <SwitchWidget
                      key={w._id}
                      label={w.label}
                      value={value === "1" || value.toLowerCase() === "on"}
                      onChange={(v) => sendCommand(device._id, device.baseTopic, w.topicId, v ? "1" : "0")}
                      disabled={!connected}
                    />
                  );
                }

                if (w.type === "slider") {
                  return (
                    <SliderWidget
                      key={w._id}
                      label={w.label}
                      value={Number(value) || 0}
                      min={w.min ?? 0}
                      max={w.max ?? 100}
                      onChange={(v) => sendCommand(device._id, device.baseTopic, w.topicId, String(v))}
                      disabled={!connected}
                    />
                  );
                }

                if (w.type === "viewer") {
                  return (
                    <LevelViewer
                      key={w._id}
                      label={w.label}
                      value={Number(value) || 0}
                      min={w.min ?? 0}
                      max={w.max ?? 100}
                    />
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
