import { useRef, useEffect, useState, useMemo } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { ChevronDown } from "lucide-react";

/** Lucide solo usa kebab-case para nombres de iconos (ej. "cpu", "lightbulb", "cloud-sun"). */
const ALL_ICON_NAMES_KEBAB = Object.keys(dynamicIconImports).sort();

function kebabToPascal(kebab: string): string {
  return kebab
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

/** Lucide usa solo kebab-case (ej. "cpu", "air-vent"). Normaliza a kebab por si viene camel de datos antiguos. */
function normalizeToKebab(name: string): string {
  if (!name.trim()) return "";
  if (name.includes("-")) return name;
  if (name === name.toLowerCase()) return name;
  return name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
}

/** Palabras clave por categoría (se aplican al nombre en PascalCase). */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Dispositivos": [
    "Cpu", "Chip", "Phone", "Monitor", "Tv", "Radio", "Server", "Drive", "Database", "Router", "Wifi",
    "Bluetooth", "Box", "Plug", "Battery", "Laptop", "Display", "Printer", "Scan", "Usb", "Cable",
    "Memory", "Circuit", "Micro", "Screen", "Terminal", "Network", "Mail", "Message", "Send", "Inbox",
    "Folder", "File", "Image", "Camera", "Video", "Mic", "Speaker", "Headphone", "Volume", "Disc",
    "Storage", "Save", "Hard", "Archive", "Smartphone", "Tablet", "Keyboard", "Mouse", "Webcam",
  ],
  "Luz y clima": [
    "Light", "Lamp", "Bulb", "Sun", "Moon", "Cloud", "Rain", "Thermometer", "Drop", "Flame", "Wind",
    "Snow", "Storm", "Weather", "Sunrise", "Sunset", "Sparkle", "Star", "Drizzle", "Thermo", "Snowflake",
    "Droplet", "Droplets", "Kindling",
  ],
  "Casa y edificio": [
    "Home", "Building", "Door", "Fan", "Bed", "Bath", "Sofa", "Fence", "Warehouse", "Factory", "Store",
    "House", "Room", "Armchair", "Shower", "Desk", "Shop", "Office",
  ],
  "Control y medición": [
    "Power", "Zap", "Settings", "Toggle", "Gauge", "Chart", "Activity", "Play", "Pause", "Slider", "Dial",
    "Move", "Rotate", "Arrow", "Chevron", "Button", "Switch", "Circle", "Square", "Target", "Focus",
    "Pointer", "Hand", "Grab", "Zoom", "Maximize", "Minimize", "Expand", "Shrink", "Grid", "Layout", "Panel",
  ],
  "Naturaleza y otros": [
    "Leaf", "Tree", "Flower", "Bug", "Sprout", "Mountain", "Bird", "Fish", "Rabbit", "Dog", "Cat",
    "Animal", "Plant", "Palm", "Deciduous", "Pine", "Bee", "Butterfly", "Paw",
  ],
};

function getCategory(pascalName: string): string {
  const n = pascalName.toLowerCase();
  for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keys.some((k) => n.includes(k.toLowerCase()))) return cat;
  }
  return "Otros";
}

function buildCategories(): Array<{ category: string; icons: string[] }> {
  const groups: Record<string, string[]> = {};
  for (const kebab of ALL_ICON_NAMES_KEBAB) {
    const pascal = kebabToPascal(kebab);
    const cat = getCategory(pascal);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(kebab);
  }
  const order = [...Object.keys(CATEGORY_KEYWORDS), "Otros"];
  return order
    .filter((cat) => (groups[cat]?.length ?? 0) > 0)
    .map((cat) => ({ category: cat, icons: groups[cat] ?? [] }));
}

const ICON_CATEGORIES = buildCategories();

const iconCache = new Map<string, React.FC<{ className?: string }>>();

const dynamicLoaders = dynamicIconImports as Record<string, () => Promise<{ default: React.FC<{ className?: string }> }>>;

/** Carga un icono por nombre (kebab-case) desde Lucide; usa caché. */
function useDynamicIcon(kebabName: string): React.FC<{ className?: string }> | null {
  const [Icon, setIcon] = useState<React.FC<{ className?: string }> | null>(() => iconCache.get(kebabName) ?? null);

  useEffect(() => {
    if (!kebabName) return;
    const cached = iconCache.get(kebabName);
    if (cached) {
      setIcon(cached);
      return;
    }
    const loader = dynamicLoaders[kebabName];
    if (!loader) return;
    loader().then((m) => {
      iconCache.set(kebabName, m.default);
      setIcon(() => m.default);
    });
  }, [kebabName]);

  return Icon;
}

/** Muestra un icono por nombre en kebab-case (Lucide). */
export function IconByName({ name, className = "" }: { name: string; className?: string }) {
  const kebab = normalizeToKebab(name);
  const Icon = useDynamicIcon(kebab);
  if (!Icon) return <span className={`inline-block w-5 h-5 ${className}`} />;
  return <Icon className={className} />;
}

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
  id?: string;
  compact?: boolean;
  /** Clase de color para la vista previa del icono (ej. "text-emerald-400"). */
  iconColorClass?: string;
  /** Si true, permite valor vacío (muestra "Ninguno" y opción para quitar icono). */
  allowEmpty?: boolean;
}

function IconGridCell({
  kebabName,
  isSelected,
  onSelect,
}: {
  kebabName: string;
  isSelected: boolean;
  onSelect: (kebab: string) => void;
}) {
  const Icon = useDynamicIcon(kebabName);

  if (!Icon) {
    return (
      <button type="button" className="w-9 h-9 rounded-lg bg-gray-800/50 animate-pulse" disabled aria-hidden />
    );
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(kebabName)}
      title={kebabToPascal(kebabName)}
      className={`flex items-center justify-center w-9 h-9 rounded-lg transition ${
        isSelected ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-emerald-400"
      }`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

const PANEL_MAX_HEIGHT = 400;

export default function IconPicker({ value, onChange, className = "", id = "icon-picker", compact = false, iconColorClass, allowEmpty = false }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const valueKebab = normalizeToKebab(value);
  const currentPascal = valueKebab ? kebabToPascal(valueKebab) : "";
  const isEmpty = allowEmpty && !valueKebab;

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpward(spaceBelow < PANEL_MAX_HEIGHT);
  }, [open]);

  const searchLower = search.trim().toLowerCase();
  const filteredBySearch = useMemo(
    () =>
      searchLower
        ? ALL_ICON_NAMES_KEBAB.filter((k) => kebabToPascal(k).toLowerCase().includes(searchLower) || k.includes(searchLower))
        : null,
    [searchLower]
  );

  const filteredCategories = useMemo(() => {
    if (filteredBySearch !== null) {
      return filteredBySearch.length > 0 ? [{ category: "Resultados", icons: filteredBySearch }] : [];
    }
    return ICON_CATEGORIES;
  }, [filteredBySearch]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const selectIcon = (kebab: string) => {
    onChange(kebab);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={compact ? (currentPascal || "Icono del widget") : undefined}
        className={`flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500 hover:border-gray-600 transition ${
          compact ? "p-1.5 w-10 justify-center" : "w-full px-3 py-2 text-sm"
        }`}
      >
        <span className={`flex items-center justify-center rounded ${compact ? "w-6 h-6" : "w-8 h-8 flex-shrink-0 bg-gray-900"} ${!isEmpty && (iconColorClass ?? "text-emerald-400")}`}>
          {isEmpty ? (
            <span className="text-xs text-gray-500 italic">{compact ? "—" : "Ninguno"}</span>
          ) : (
            <IconByName name={valueKebab || "cpu"} className={`${compact ? "w-4 h-4" : "w-5 h-5"} ${iconColorClass ?? "text-emerald-400"}`} />
          )}
        </span>
        {!compact && (
          <>
            <span className="text-left flex-1 text-gray-300 truncate text-sm">
              {isEmpty ? "Ninguno" : (currentPascal || "Seleccionar icono")}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {open && (
        <div
          className={`absolute left-0 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[300px] ${
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          style={compact ? { left: 0 } : {}}
        >
          <div className="p-2 border-b border-gray-800">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar icono..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {allowEmpty && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  setSearch("");
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-sm transition mb-2 ${
                  isEmpty ? "bg-gray-800 text-emerald-400" : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/50 text-gray-500 text-xs">—</span>
                Ninguno
              </button>
            )}
            {filteredCategories.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Ningún icono coincide</p>
            ) : (
              filteredCategories.map(({ category, icons: catIcons }) => (
                <div key={category} className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1 sticky top-0 bg-gray-900 py-1 z-10">
                    {category} ({catIcons.length})
                  </p>
                  <div className="grid grid-cols-6 gap-1">
                    {catIcons.map((kebabName) => (
                      <IconGridCell
                        key={kebabName}
                        kebabName={kebabName}
                        isSelected={valueKebab === kebabName}
                        onSelect={selectIcon}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { kebabToPascal as toPascalCase };
