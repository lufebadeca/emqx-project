import type { IconColorKey } from "../types";

export const ICON_COLORS: Record<IconColorKey, { label: string; className: string; dotClass: string }> = {
  primary: { label: "Principal", className: "text-emerald-400", dotClass: "bg-emerald-400" },
  danger: { label: "Peligro", className: "text-red-400", dotClass: "bg-red-400" },
  success: { label: "Éxito", className: "text-green-400", dotClass: "bg-green-400" },
  warning: { label: "Advertencia", className: "text-amber-400", dotClass: "bg-amber-400" },
  muted: { label: "Apagado", className: "text-gray-500", dotClass: "bg-gray-500" },
  info: { label: "Info", className: "text-blue-400", dotClass: "bg-blue-400" },
};

export const ICON_COLOR_KEYS: IconColorKey[] = ["primary", "danger", "success", "warning", "muted", "info"];

export const DEFAULT_ICON_COLOR: IconColorKey = "primary";

export function getIconColorClass(color?: IconColorKey | string): string {
  if (!color || !(color in ICON_COLORS)) return ICON_COLORS.primary.className;
  return ICON_COLORS[color as IconColorKey].className;
}
