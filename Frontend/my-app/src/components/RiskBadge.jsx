/**
 * RiskBadge — Dark-themed colour-coded risk level pill.
 * Props preserved: level
 */
const CONFIG = {
  Low:    {
    bg: "rgba(16,185,129,0.15)",  color: "#34d399",
    border: "rgba(16,185,129,0.2)", glow: "rgba(16,185,129,0.2)",
  },
  Medium: {
    bg: "rgba(245,158,11,0.15)",   color: "#fbbf24",
    border: "rgba(245,158,11,0.2)", glow: "rgba(245,158,11,0.2)",
  },
  High:   {
    bg: "rgba(239,68,68,0.15)",    color: "#f87171",
    border: "rgba(239,68,68,0.2)", glow: "rgba(239,68,68,0.2)",
  },
  Unknown: {
    bg: "rgba(255,255,255,0.05)",  color: "#6b7280",
    border: "rgba(255,255,255,0.1)", glow: "transparent",
  },
};

export default function RiskBadge({ level }) {
  const cfg = CONFIG[level] ?? CONFIG.Unknown;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "3px 12px", borderRadius: "9999px", fontSize: "12px",
      fontWeight: 600, background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      boxShadow: `0 0 8px ${cfg.glow}`,
    }}>
      {level ?? "Unknown"}
    </span>
  );
}