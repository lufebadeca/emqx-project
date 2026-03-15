import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { IconColorKey } from "../types";
import { ICON_COLORS, ICON_COLOR_KEYS, DEFAULT_ICON_COLOR } from "../lib/iconColors";

interface IconColorPickerProps {
  value: IconColorKey | string | undefined;
  onChange: (color: IconColorKey) => void;
  id?: string;
  compact?: boolean;
  disabled?: boolean;
}

const COLOR_PANEL_MAX_HEIGHT = 280;

export default function IconColorPicker({
  value,
  onChange,
  compact = false,
  disabled = false,
}: IconColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const current = (value && value in ICON_COLORS ? value : DEFAULT_ICON_COLOR) as IconColorKey;
  const { label, dotClass } = ICON_COLORS[current];

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpward(spaceBelow < COLOR_PANEL_MAX_HEIGHT);
  }, [open]);

  useEffect(() => {
    if (!open || disabled) return;
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
  }, [open, disabled]);

  return (
    <div className={`relative ${disabled ? "opacity-50" : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={disabled ? "Elige un icono primero" : "Color del icono"}
        className={`flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500 transition ${
          disabled ? "cursor-not-allowed" : "hover:border-gray-600"
        } ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}
      >
        <span className={`rounded-full border border-gray-600 ${compact ? "w-4 h-4" : "w-5 h-5"} ${dotClass}`} />
        {!compact && <span className="text-sm text-gray-300">{label}</span>}
        <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={panelRef}
          className={`absolute left-0 z-50 min-w-[140px] bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 ${
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {ICON_COLOR_KEYS.map((key) => {
            const { label: optLabel, dotClass: optDot } = ICON_COLORS[key];
            const isSelected = current === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition ${
                  isSelected ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className={`rounded-full w-4 h-4 flex-shrink-0 border border-gray-600 ${optDot}`} />
                {optLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
