interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function SliderWidget({ label, value, min, max, onChange, disabled = false }: Props) {
  return (
    <div className={`bg-gray-800/50 rounded-lg px-4 py-3 ${disabled ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm">{label}</span>
        <span className="text-xs font-mono text-emerald-400">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => !disabled && onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none bg-gray-700 accent-emerald-500 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      />
    </div>
  );
}
