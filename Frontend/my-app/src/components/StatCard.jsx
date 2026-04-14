/**
 * StatCard — Modern metric card with icon, trend, and subtle colour accent.
 * Props preserved: title, value  (+ new optional: icon, accent, trend, trendLabel)
 */
export default function StatCard({ title, value, icon, accent = "emerald", trend, trendLabel }) {
  const accents = {
    emerald: { bg: "bg-emerald-50",  icon: "bg-emerald-100 text-emerald-700", bar: "from-emerald-400 to-emerald-600", text: "text-emerald-700" },
    red:     { bg: "bg-red-50",      icon: "bg-red-100     text-red-700",     bar: "from-red-400     to-red-600",     text: "text-red-700"     },
    blue:    { bg: "bg-blue-50",     icon: "bg-blue-100    text-blue-700",    bar: "from-blue-400    to-blue-600",    text: "text-blue-700"    },
    amber:   { bg: "bg-amber-50",    icon: "bg-amber-100   text-amber-700",   bar: "from-amber-400   to-amber-600",   text: "text-amber-700"   },
  };

  const colors = accents[accent] ?? accents.emerald;

  return (
    <div className={`card card-hover p-5 flex flex-col gap-3 overflow-hidden relative`}>
      {/* Decorative gradient strip */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors.bar} opacity-70`} />

      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`metric-icon ${colors.icon}`}>
          {icon ?? <DefaultIcon />}
        </div>

        {/* Trend chip */}
        {trend !== undefined && (
          <span className={`badge ${trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"} text-xs`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none tracking-tight">{value}</p>
        <p className="text-xs font-medium text-slate-400 mt-1.5 uppercase tracking-wider">{title}</p>
      </div>

      {/* Trend label */}
      {trendLabel && (
        <p className="text-xs text-slate-400">{trendLabel}</p>
      )}
    </div>
  );
}

function DefaultIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
    </svg>
  );
}