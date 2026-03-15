import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export type WidgetType = "switch" | "slider" | "viewer";

const OPTIONS: { value: WidgetType; label: string }[] = [
  { value: "switch", label: "Switch (ON/OFF)" },
  { value: "slider", label: "Slider (Nivel)" },
  { value: "viewer", label: "Viewer (Solo lectura)" },
];

const PANEL_MAX_HEIGHT = 160;

interface WidgetTypeSelectProps {
  value: WidgetType;
  onChange: (value: WidgetType) => void;
  className?: string;
}

export default function WidgetTypeSelect({ value, onChange, className = "" }: WidgetTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentLabel = OPTIONS.find((o) => o.value === value)?.label ?? OPTIONS[0].label;

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpward(spaceBelow < PANEL_MAX_HEIGHT);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:border-emerald-500 hover:border-gray-600 transition flex items-center justify-between"
      >
        <span>{currentLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={panelRef}
          className={`absolute left-0 right-0 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 ${
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex w-full px-3 py-2 text-left text-sm transition ${
                value === opt.value ? "bg-gray-800 text-emerald-400" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
