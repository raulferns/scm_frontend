/**
 * RiskBadge — colour-coded risk level pill.
 * Props preserved: level
 */
const CONFIG = {
  Low:    { dot: "bg-emerald-500", classes: "bg-emerald-50  text-emerald-700  border-emerald-200"  },
  Medium: { dot: "bg-amber-500",   classes: "bg-amber-50    text-amber-700    border-amber-200"    },
  High:   { dot: "bg-red-500",     classes: "bg-red-50      text-red-700      border-red-200"      },
};

export default function RiskBadge({ level }) {
  const cfg = CONFIG[level] ?? CONFIG.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {level ?? "Unknown"}
    </span>
  );
}