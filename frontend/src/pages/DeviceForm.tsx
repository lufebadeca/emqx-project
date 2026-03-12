import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { createDevice, fetchDevice, updateDevice } from "../api";
import type { WidgetFormData } from "../types";

const EMPTY_WIDGET: WidgetFormData = { type: "switch", label: "", topicId: "", min: 0, max: 100 };

export default function DeviceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [baseTopic, setBaseTopic] = useState("");
  const [icon, setIcon] = useState("cpu");
  const [widgets, setWidgets] = useState<WidgetFormData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDevice(id).then((d) => {
        setName(d.name);
        setBaseTopic(d.baseTopic);
        setIcon(d.icon);
        setWidgets(d.widgets.map((w) => ({ type: w.type, label: w.label, topicId: w.topicId, min: w.min, max: w.max })));
      });
    }
  }, [id]);

  const addWidget = () => setWidgets([...widgets, { ...EMPTY_WIDGET }]);

  const removeWidget = (i: number) => setWidgets(widgets.filter((_, idx) => idx !== i));

  const updateWidget = (i: number, field: keyof WidgetFormData, value: string | number) => {
    setWidgets(widgets.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = { name, baseTopic, icon, widgets };

    try {
      if (isEdit && id) {
        await updateDevice(id, payload);
      } else {
        await createDevice(payload);
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el dispositivo");
    }
  };

  const inputCls = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500";
  const labelCls = "block text-sm text-gray-400 mb-1";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar" : "Nuevo"} Dispositivo</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {/* Device info */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className={labelCls}>Nombre</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>Base Topic</label>
            <input className={inputCls} value={baseTopic} onChange={(e) => setBaseTopic(e.target.value)} placeholder="home/esp32-01" required />
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>Icono (Lucide)</label>
            <input className={inputCls} value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="cpu" />
          </div>
        </div>

        {/* Widgets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Widgets</h2>
            <button type="button" onClick={addWidget} className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300">
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>

          {widgets.length === 0 && <p className="text-sm text-gray-600">Sin widgets. Agrega al menos uno.</p>}

          <div className="space-y-3">
            {widgets.map((w, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 relative">
                <button
                  type="button"
                  onClick={() => removeWidget(i)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="grid sm:grid-cols-4 gap-3">
                  <div>
                    <label className={labelCls}>Tipo</label>
                    <select className={inputCls} value={w.type} onChange={(e) => updateWidget(i, "type", e.target.value)}>
                      <option value="switch">Switch (ON/OFF)</option>
                      <option value="slider">Slider (Nivel)</option>
                      <option value="viewer">Viewer (Solo lectura)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Label</label>
                    <input className={inputCls} value={w.label} onChange={(e) => updateWidget(i, "label", e.target.value)} placeholder="LED" required />
                  </div>
                  <div>
                    <label className={labelCls}>Topic ID</label>
                    <input className={inputCls} value={w.topicId} onChange={(e) => updateWidget(i, "topicId", e.target.value)} placeholder="led1" required />
                  </div>
                  {(w.type === "slider" || w.type === "viewer") && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className={labelCls}>Min</label>
                        <input type="number" className={inputCls} value={w.min} onChange={(e) => updateWidget(i, "min", Number(e.target.value))} />
                      </div>
                      <div className="flex-1">
                        <label className={labelCls}>Max</label>
                        <input type="number" className={inputCls} value={w.max} onChange={(e) => updateWidget(i, "max", Number(e.target.value))} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg transition font-medium">
            {isEdit ? "Guardar" : "Crear Dispositivo"}
          </button>
          <button type="button" onClick={() => navigate("/")} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-lg transition">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
