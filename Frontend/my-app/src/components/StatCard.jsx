/**
 * StatCard — Dark-themed metric card with icon, large value, and coloured bottom glow.
 * Props preserved: title, value, icon, accent, trend, trendLabel
 */
export default function StatCard({ title, value, icon, accent = "emerald", trend, trendLabel }) {
  const accents = {
    emerald: { iconBg: "rgba(16,185,129,0.15)",  iconColor: "#10b981", glowBorder: "rgba(16,185,129,0.4)"  },
    red:     { iconBg: "rgba(239,68,68,0.15)",   iconColor: "#ef4444", glowBorder: "rgba(239,68,68,0.4)"   },
    blue:    { iconBg: "rgba(59,130,246,0.15)",  iconColor: "#3b82f6", glowBorder: "rgba(59,130,246,0.4)"  },
    amber:   { iconBg: "rgba(245,158,11,0.15)",  iconColor: "#f59e0b", glowBorder: "rgba(245,158,11,0.4)"  },
  };

  const c = accents[accent] ?? accents.emerald;

  return (
    <div style={{
      background: "#0a0f1a",
      border: "1px solid rgba(255,255,255,0.07)",
      borderBottom: `1px solid ${c.glowBorder}`,
      borderRadius: "16px",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}>
      {/* Top row: label + icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <p style={{
          fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em",
          fontWeight: 600, color: "#4b5563", margin: 0,
        }}>
          {title}
        </p>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: c.iconBg, display: "flex", alignItems: "center",
          justifyContent: "center", color: c.iconColor, flexShrink: 0,
        }}>
          {icon ?? <DefaultIcon />}
        </div>
      </div>

      {/* Big number */}
      <span style={{
        fontSize: "42px", fontWeight: 800, letterSpacing: "-0.03em",
        color: "#f9fafb", lineHeight: 1, display: "block",
      }}>
        {value}
      </span>

      {/* Bottom label */}
      <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>
        {trendLabel ?? "Current total"}
      </p>
    </div>
  );
}

function DefaultIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
    </svg>
  );
}