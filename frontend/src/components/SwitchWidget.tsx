interface Props {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function SwitchWidget({ label, value, onChange, disabled = false, icon }: Props) {
  return (
    <div className={`flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3 ${disabled ? "opacity-60" : ""}`}>
      <span className="flex items-center gap-2 text-sm">
        {icon}
        {label}
      </span>
      <button
        type="button"
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-gray-600"} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}
