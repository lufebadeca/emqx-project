interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  icon?: React.ReactNode;
}

export default function LevelViewer({ label, value, min, max, icon }: Props) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="bg-gray-800/50 rounded-lg px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-sm">
          {icon}
          {label}
        </span>
        <span className="text-xs font-mono text-emerald-400">
          {value} <span className="text-gray-500">/ {max}</span>
        </span>
      </div>
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
