import { useState } from "react";

/* ── Impact config (dark) ──────────────────────────── */
const IMPACT = {
  high:   {
    badgeBg: "rgba(239,68,68,0.15)", badgeColor: "#f87171",
    badgeBorder: "rgba(239,68,68,0.25)", badgeGlow: "rgba(239,68,68,0.2)",
    cardBorder: "rgba(239,68,68,0.2)", cardGlow: "rgba(239,68,68,0.05)",
    dot: "#ef4444", dotGlow: "rgba(239,68,68,0.5)",
    delayColor: "#ef4444", delayGlow: "rgba(239,68,68,0.5)",
  },
  medium: {
    badgeBg: "rgba(245,158,11,0.15)", badgeColor: "#fbbf24",
    badgeBorder: "rgba(245,158,11,0.25)", badgeGlow: "transparent",
    cardBorder: "rgba(245,158,11,0.2)", cardGlow: "rgba(245,158,11,0.05)",
    dot: "#f59e0b", dotGlow: "rgba(245,158,11,0.5)",
    delayColor: "#f59e0b", delayGlow: "transparent",
  },
  low:    {
    badgeBg: "rgba(16,185,129,0.15)", badgeColor: "#34d399",
    badgeBorder: "rgba(16,185,129,0.25)", badgeGlow: "transparent",
    cardBorder: "rgba(255,255,255,0.07)", cardGlow: "transparent",
    dot: "#10b981", dotGlow: "rgba(16,185,129,0.4)",
    delayColor: "#9ca3af", delayGlow: "transparent",
  },
};

const ICONS = { cricket: "🏏", festival: "🎉", traffic: "🚦", weather: "🌧️", strike: "⚠️", default: "📍" };

/* ── Impact bar colours (dark gradients) ──────────── */
const BAR_STYLE = {
  cricket: { gradient: "linear-gradient(90deg, #3b82f6, rgba(59,130,246,0.4))",   glow: "rgba(59,130,246,0.4)"  },
  festival:{ gradient: "linear-gradient(90deg, #8b5cf6, rgba(139,92,246,0.4))",   glow: "rgba(139,92,246,0.4)" },
  traffic: { gradient: "linear-gradient(90deg, #f59e0b, rgba(245,158,11,0.4))",   glow: "rgba(245,158,11,0.4)" },
  weather: { gradient: "linear-gradient(90deg, #06b6d4, rgba(6,182,212,0.4))",    glow: "rgba(6,182,212,0.4)"  },
  strike:  { gradient: "linear-gradient(90deg, #ef4444, rgba(239,68,68,0.4))",    glow: "rgba(239,68,68,0.4)"  },
  default: { gradient: "linear-gradient(90deg, #6b7280, rgba(107,114,128,0.4))",  glow: "transparent"          },
};

/* ── Filter tab active styles ─────────────────────── */
const TAB_ACTIVE = {
  all:    { bg: "#f9fafb",                        color: "#030712", border: "transparent" },
  high:   { bg: "rgba(239,68,68,0.2)",            color: "#ef4444", border: "rgba(239,68,68,0.4)" },
  medium: { bg: "rgba(245,158,11,0.2)",           color: "#f59e0b", border: "rgba(245,158,11,0.4)" },
  low:    { bg: "rgba(16,185,129,0.2)",           color: "#10b981", border: "rgba(16,185,129,0.4)" },
};

/* ── Tooltip ──────────────────────────────────────── */
function Tooltip({ text }) {
  return (
    <div style={{
      position: "absolute", zIndex: 10, bottom: "calc(100% + 6px)",
      left: "50%", transform: "translateX(-50%)",
      width: "200px", background: "#0d1117",
      color: "#d1d5db", fontSize: "12px", borderRadius: "10px",
      padding: "8px 12px", pointerEvents: "none",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      {text}
      <div style={{
        position: "absolute", top: "100%", left: "50%",
        transform: "translateX(-50%)",
        borderWidth: "5px", borderStyle: "solid",
        borderColor: "rgba(255,255,255,0.1) transparent transparent transparent",
      }} />
    </div>
  );
}

/* ── Individual event card ────────────────────────── */
function EventCard({ event }) {
  const [tip, setTip] = useState(false);
  const [hovered, setHovered] = useState(false);
  const meta = IMPACT[event.impact] ?? IMPACT.low;
  const icon = ICONS[event.type] ?? ICONS.default;
  const impactLabel = event.impact.charAt(0).toUpperCase() + event.impact.slice(1);

  return (
    <div
      style={{
        background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : meta.cardBorder}`,
        boxShadow: event.impact !== "low" ? `0 0 20px ${meta.cardGlow}` : "none",
        borderRadius: "16px", padding: "20px", marginBottom: "12px",
        transition: "all 0.15s ease",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "22px", lineHeight: 1 }}>{icon}</span>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#f9fafb", margin: "0 0 3px" }}>
              {event.name}
            </p>
            <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>
              {event.location} · {event.time}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Risk badge */}
          <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "6px 12px", borderRadius: "9999px",
            fontSize: "11px", fontWeight: 600,
            background: meta.badgeBg, color: meta.badgeColor,
            border: `1px solid ${meta.badgeBorder}`,
            boxShadow: event.impact === "high" ? `0 0 12px ${meta.badgeGlow}` : "none",
          }}>
            {impactLabel}
          </span>

          {/* Info icon */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setTip(true)}
            onMouseLeave={() => setTip(false)}
          >
            <button style={{
              width: "22px", height: "22px", borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "#374151", fontSize: "12px", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontFamily: "Georgia, serif",
            }}>
              i
            </button>
            {tip && <Tooltip text={event.reason ?? "External event affecting this route."} />}
          </div>
        </div>
      </div>

      {/* Delay row */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: "16px", paddingTop: "16px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <span style={{ fontSize: "12px", color: "#4b5563" }}>Expected delay</span>
        <span style={{
          fontSize: "14px", fontWeight: 700,
          color: meta.delayColor,
          textShadow: event.impact === "high" ? `0 0 10px ${meta.delayGlow}` : "none",
        }}>
          +{event.delayMin} min
        </span>
      </div>

      {/* Affected route */}
      {event.affectedRoute && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
          <span style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: meta.dot, flexShrink: 0,
            boxShadow: `0 0 6px ${meta.dotGlow}`,
          }} />
          <span style={{ fontSize: "11px", color: "#4b5563" }}>Route affected:</span>
          <span style={{ fontSize: "12px", fontWeight: 500, color: "#d1d5db" }}>{event.affectedRoute}</span>
        </div>
      )}
    </div>
  );
}

/* ── Impact distribution bar ──────────────────────── */
function AnalyticsBar({ label, count, max }) {
  const barKey = label.toLowerCase();
  const bs = BAR_STYLE[barKey] ?? BAR_STYLE.default;
  const pct = (count / max) * 100;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
      <span style={{ fontSize: "14px", fontWeight: 500, color: "#d1d5db", width: "80px", flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "8px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: "99px",
          width: `${pct}%`,
          background: bs.gradient,
          boxShadow: `0 0 10px ${bs.glow}`,
          transition: "width 0.6s ease",
        }} />
      </div>
      <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", width: "90px", textAlign: "right", flexShrink: 0 }}>
        {count} shipment{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

/* ── Main component ────────────────────────────────── */
export default function ExternalEvents({ events = [] }) {
  const [filter, setFilter] = useState("all");

  if (!events.length) return null;

  // analytics: group by type
  const byType = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + (e.shipmentsAffected ?? 1);
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(byType), 1);

  const filtered = filter === "all" ? events : events.filter((e) => e.impact === filter);

  return (
    <>
      {/* ── Upcoming External Events Card ─────────── */}
      <div style={{
        background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px", padding: "32px",
      }}>
        {/* Header row 1 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#f9fafb", margin: 0 }}>
            Upcoming External Events
          </h3>
          <span style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "9999px", padding: "6px 12px",
            fontSize: "12px", color: "#9ca3af",
          }}>
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Header row 2 */}
        <p style={{ fontSize: "13px", color: "#4b5563", fontStyle: "italic", margin: "0 0 24px" }}>
          Potential delays on your route — before they happen
        </p>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["all", "high", "medium", "low"].map((f) => {
            const isActive = filter === f;
            const ac = TAB_ACTIVE[f];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  borderRadius: "9999px", padding: "8px 16px",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                  textTransform: "capitalize",
                  background: isActive ? ac.bg : "rgba(255,255,255,0.04)",
                  color: isActive ? ac.color : "#4b5563",
                  border: `1px solid ${isActive ? ac.border : "rgba(255,255,255,0.08)"}`,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Event cards */}
        <div>
          {filtered.length
            ? filtered.map((ev, i) => <EventCard key={i} event={ev} />)
            : <p style={{ fontSize: "13px", color: "#4b5563", textAlign: "center", padding: "24px 0", margin: 0 }}>No events for this filter.</p>
          }
        </div>
      </div>

      {/* ── Impact Distribution Card ──────────────── */}
      {Object.keys(byType).length > 0 && (
        <div style={{
          background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px", padding: "32px",
        }}>
          <p style={{
            fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em",
            fontWeight: 700, color: "#4b5563", margin: "0 0 32px",
          }}>
            Impact Distribution
          </p>
          {Object.entries(byType).map(([type, count]) => (
            <AnalyticsBar
              key={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              count={count}
              max={maxCount}
            />
          ))}
        </div>
      )}
    </>
  );
}