import React, { useEffect, useState } from "react";
import { buildModelPayload } from "../utils/simulationModel";

const weatherOptions = [
  { value: "clear",   label: "Clear skies",    icon: "☀️" },
  { value: "rain",    label: "Heavy rain",     icon: "🌧️" },
  { value: "cyclone", label: "Cyclone warning",icon: "🌀" },
  { value: "fog",     label: "Dense fog",      icon: "🌫️" },
];

const routeOptions = [
  { value: "highway", label: "Highway",      icon: "🛣️" },
  { value: "state",   label: "State roads",  icon: "🛤️" },
  { value: "urban",   label: "City / urban", icon: "🏙️" },
];

const disruptionsList = [
  { key: "strike", label: "Port strike",   impact: 12, icon: "🚧" },
  { key: "fuel",   label: "Fuel shortage", impact: 8,  icon: "⛽" },
  { key: "road",   label: "Road closure",  impact: 15, icon: "🚫" },
];

/* ── Weather selected accent ──────────────────── */
const WEATHER_ACCENT = {
  clear:   { border: "rgba(16,185,129,0.5)",  bg: "rgba(16,185,129,0.1)",  color: "#10b981",  glow: "rgba(16,185,129,0.15)"  },
  rain:    { border: "rgba(59,130,246,0.5)",  bg: "rgba(59,130,246,0.1)",  color: "#3b82f6",  glow: "transparent"            },
  cyclone: { border: "rgba(239,68,68,0.5)",   bg: "rgba(239,68,68,0.1)",   color: "#ef4444",  glow: "transparent"            },
  fog:     { border: "rgba(156,163,175,0.5)", bg: "rgba(156,163,175,0.08)",color: "#9ca3af",  glow: "transparent"            },
};

const ROUTE_ACCENT = {
  border: "rgba(139,92,246,0.5)",
  bg:     "rgba(139,92,246,0.1)",
  color:  "#8b5cf6",
};

/* ── Shared token helpers ──────────────────────── */
const controlLabel = {
  fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em",
  fontWeight: 700, color: "#4b5563", marginBottom: "12px", marginTop: "24px",
  display: "block",
};

function sliderColor(value, max) {
  const pct = (value / max) * 100;
  if (pct < 40) return "#10b981";
  if (pct < 70) return "#f59e0b";
  return "#ef4444";
}

/* ── Risk badge (dark) ─────────────────────────── */
function RiskPill({ level, loading }) {
  const map = {
    Low:    { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)", glow: "rgba(16,185,129,0.25)" },
    Medium: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)", glow: "rgba(245,158,11,0.2)"  },
    High:   { bg: "rgba(239,68,68,0.15)",  color: "#f87171", border: "rgba(239,68,68,0.3)",  glow: "rgba(239,68,68,0.2)"  },
  };
  const label = loading ? "…" : (level || "Unknown");
  const c = map[level] ?? { bg: "rgba(255,255,255,0.06)", color: "#6b7280", border: "rgba(255,255,255,0.1)", glow: "transparent" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: "9999px", fontSize: "11px", fontWeight: 700,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      boxShadow: `0 0 8px ${c.glow}`,
    }}>
      {label}
    </span>
  );
}

/* ── Live Risk Preview box ─────────────────────── */
function ScoreBar({ preview, loading }) {
  const score = preview?.delayProbability ?? 0;
  const level = preview?.riskLevel;
  const fillColor = level === "High" ? "#ef4444" : level === "Medium" ? "#f59e0b" : "#10b981";
  const numColor  = level === "High" ? "#f87171" : level === "Medium" ? "#fbbf24" : "#34d399";
  const numGlow   = level === "High" ? "rgba(239,68,68,0.4)" : level === "Medium" ? "rgba(245,158,11,0.4)" : "rgba(16,185,129,0.4)";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "14px", padding: "20px", marginTop: "24px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#4b5563", fontWeight: 700 }}>
          Live Risk Preview
        </span>
        <RiskPill level={level} loading={loading} />
      </div>

      {/* Score number */}
      <div style={{
        fontSize: "40px", fontWeight: 800, fontFamily: "monospace",
        letterSpacing: "-0.02em", color: numColor,
        textShadow: `0 0 20px ${numGlow}`,
        lineHeight: 1,
      }}>
        {loading ? (
          <span style={{ display: "inline-block", width: "80px", height: "36px", background: "rgba(255,255,255,0.06)", borderRadius: "8px", animation: "shimPulse 1.4s ease-in-out infinite" }} />
        ) : (
          `${score.toFixed(1)}`
        )}
        <span style={{ fontSize: "16px", color: "#4b5563", fontWeight: 400 }}>/100</span>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: "16px", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: "99px",
          width: `${Math.max(2, score)}%`,
          background: fillColor,
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

/* ── Slider ────────────────────────────────────── */
function SliderField({ label, value, min, max, step = 1, onChange, unit = "" }) {
  const pct = Math.round(((value - min) / (max - min)) * 100);
  const valColor = sliderColor(value - min, max - min);

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>{label}</span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: valColor, fontFamily: "monospace" }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%", appearance: "none", WebkitAppearance: "none",
          height: "4px", borderRadius: "99px", outline: "none", cursor: "pointer",
          background: `linear-gradient(to right, #10b981 0%, #10b981 ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#374151", marginTop: "6px" }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

/* ── Main panel ────────────────────────────────── */
export default function SimulationPanel({
  onSimulate,
  onScenarioChange,
  preview,
  previewLoading,
  previewError,
}) {
  const [data, setData] = useState({
    weather:  "clear",
    route:    "highway",
    traffic:  40,
    fatigue:  3,
    distance: 600,
    cargo:    25,
  });

  const [issues, setIssues] = useState([]);

  const toggleIssue = (key) => {
    setIssues((prev) =>
      prev.includes(key)
        ? prev.filter((x) => x !== key)
        : [...prev, key]
    );
  };

  useEffect(() => {
    onScenarioChange({
      params:      data,
      disruptions: issues,
      payload:     buildModelPayload({ params: data, disruptions: issues }),
    });
  }, [data, issues, onScenarioChange]);

  return (
    <div style={{
      background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "20px", padding: "28px",
    }}>
      {/* Panel title */}
      <div style={{ paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "4px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f9fafb", margin: "0 0 4px" }}>Simulation Controls</h2>
        <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>Adjust parameters and run the model</p>
      </div>

      {/* ── Weather Condition ── */}
      <span style={controlLabel}>Weather Condition</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {weatherOptions.map((w) => {
          const active = data.weather === w.value;
          const acc = WEATHER_ACCENT[w.value];
          return (
            <button
              key={w.value}
              onClick={() => setData({ ...data, weather: w.value })}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
                background: active ? acc.bg : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? acc.border : "rgba(255,255,255,0.08)"}`,
                boxShadow: active ? `0 0 12px ${acc.glow}` : "none",
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>{w.icon}</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: active ? acc.color : "#9ca3af" }}>{w.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Route Type ── */}
      <span style={controlLabel}>Route Type</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {routeOptions.map((r) => {
          const active = data.route === r.value;
          return (
            <button
              key={r.value}
              onClick={() => setData({ ...data, route: r.value })}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                padding: "10px 8px", borderRadius: "10px", cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
                background: active ? ROUTE_ACCENT.bg : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? ROUTE_ACCENT.border : "rgba(255,255,255,0.08)"}`,
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }
              }}
            >
              <span style={{ fontSize: "18px" }}>{r.icon}</span>
              <span style={{ fontSize: "11px", fontWeight: 500, color: active ? ROUTE_ACCENT.color : "#9ca3af" }}>{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Sliders ── */}
      <span style={{ ...controlLabel, marginBottom: "16px" }}>Traffic Load</span>
      <SliderField
        label="Traffic Load"
        value={data.traffic}
        min={0}
        max={100}
        unit="%"
        onChange={(v) => setData({ ...data, traffic: v })}
      />
      <span style={{ ...controlLabel, marginTop: 0, marginBottom: "16px" }}>Driver Fatigue</span>
      <SliderField
        label="Driver Fatigue"
        value={data.fatigue}
        min={0}
        max={10}
        unit="/10"
        onChange={(v) => setData({ ...data, fatigue: v })}
      />
      <span style={{ ...controlLabel, marginTop: 0, marginBottom: "16px" }}>Distance</span>
      <SliderField
        label="Distance"
        value={data.distance}
        min={50}
        max={2000}
        step={50}
        unit=" km"
        onChange={(v) => setData({ ...data, distance: v })}
      />

      {/* ── Active Disruptions ── */}
      <span style={controlLabel}>Active Disruptions</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {disruptionsList.map((d) => {
          const checked = issues.includes(d.key);
          return (
            <label
              key={d.key}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: checked ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${checked ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "10px", padding: "12px 14px", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <input
                type="checkbox"
                style={{ display: "none" }}
                checked={checked}
                onChange={() => toggleIssue(d.key)}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                {/* Custom checkbox */}
                <span style={{
                  width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: checked ? "#ef4444" : "transparent",
                  border: `1px solid ${checked ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
                  transition: "all 0.15s",
                }}>
                  {checked && (
                    <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span style={{ fontSize: "16px" }}>{d.icon}</span>
                <span style={{ fontSize: "13px", color: "#d1d5db" }}>{d.label}</span>
              </div>
              {/* Impact badge */}
              <span style={{
                marginLeft: "8px", flexShrink: 0,
                background: "rgba(239,68,68,0.15)", color: "#ef4444",
                borderRadius: "9999px", padding: "2px 10px", fontSize: "11px", fontWeight: 700,
              }}>
                +{d.impact}%
              </span>
            </label>
          );
        })}
      </div>

      {/* ── Live Risk Preview ── */}
      <ScoreBar preview={preview} loading={previewLoading} />
      {previewError && (
        <p style={{
          fontSize: "12px", color: "#ef4444", marginTop: "8px",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "8px", padding: "8px 12px",
        }}>
          {previewError}
        </p>
      )}

      {/* ── Run Simulation ── */}
      <button
        onClick={() =>
          onSimulate({
            params:      data,
            disruptions: issues,
            payload:     buildModelPayload({ params: data, disruptions: issues }),
          })
        }
        style={{
          width: "100%", marginTop: "24px", borderRadius: "12px", padding: "16px",
          background: "linear-gradient(135deg, #10b981, #059669)",
          boxShadow: "0 0 30px rgba(16,185,129,0.35)",
          color: "white", fontSize: "15px", fontWeight: 600,
          border: "none", cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 0 45px rgba(16,185,129,0.55)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 0 30px rgba(16,185,129,0.35)";
        }}
        onMouseDown={e => {
          e.currentTarget.style.transform = "translateY(0) scale(0.99)";
        }}
        onMouseUp={e => {
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
        </svg>
        Run Simulation
      </button>

      {/* Slider thumb + shimmer keyframes */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px rgba(16,185,129,0.5);
          cursor: pointer;
          border: 2px solid #030712;
        }
        input[type=range]::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px rgba(16,185,129,0.5);
          cursor: pointer;
          border: 2px solid #030712;
        }
        @keyframes shimPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
