interface Props {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function SwitchWidget({ label, value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-gray-600"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}
