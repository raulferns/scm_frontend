import React, { useEffect, useState } from "react";

import { buildModelPayload } from "../utils/simulationModel";

const weatherOptions = [
  { value: "clear",   label: "Clear skies",      icon: "☀️" },
  { value: "rain",    label: "Heavy rain",        icon: "🌧️" },
  { value: "cyclone", label: "Cyclone warning",   icon: "🌀" },
  { value: "fog",     label: "Dense fog",         icon: "🌫️" },
];

const routeOptions = [
  { value: "highway", label: "Highway",       icon: "🛣️" },
  { value: "state",   label: "State roads",   icon: "🛤️" },
  { value: "urban",   label: "City / urban",  icon: "🏙️" },
];

const disruptionsList = [
  { key: "strike", label: "Port strike",    impact: 12,  icon: "🚧" },
  { key: "fuel",   label: "Fuel shortage",  impact: 8,   icon: "⛽" },
  { key: "road",   label: "Road closure",   impact: 15,  icon: "🚫" },
];

function ScoreBar({ preview, loading }) {
  const score = preview?.delayProbability ?? 0;
  const label = loading ? "Refreshing…" : preview?.riskLevel || "Unknown";
  const colorMap = {
    Low:    "bg-emerald-500",
    Medium: "bg-amber-500",
    High:   "bg-red-500",
  };
  const color = colorMap[preview?.riskLevel] ?? "bg-slate-300";

  return (
    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
      <div className="flex justify-between items-center text-xs font-medium text-slate-500">
        <span>Live Risk Preview</span>
        <span className={`badge ${
          preview?.riskLevel === "Low" ? "badge-green" :
          preview?.riskLevel === "High" ? "badge-red" : "badge-amber"
        }`}>
          {label}
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${color}`}
          style={{ width: `${Math.max(2, score)}%` }}
        />
      </div>
      <p className="text-lg font-bold text-slate-800">
        {loading ? (
          <span className="shimmer inline-block w-16 h-5 rounded" />
        ) : (
          `${score.toFixed(1)}/100`
        )}
      </p>
    </div>
  );
}

function SliderField({ label, value, min, max, step = 1, onChange, unit = "" }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <span className="text-sm font-bold text-slate-800 tabular-nums">
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
      />
      <div className="flex justify-between text-xs text-slate-300">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

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
      params:       data,
      disruptions:  issues,
      payload:      buildModelPayload({ params: data, disruptions: issues }),
    });
  }, [data, issues, onScenarioChange]);

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h2 className="section-title text-base">Simulation Controls</h2>
        <p className="text-xs text-slate-400 mt-0.5">Adjust parameters and run the model</p>
      </div>

      {/* Weather */}
      <div>
        <label className="form-label">Weather Condition</label>
        <div className="grid grid-cols-2 gap-2">
          {weatherOptions.map((w) => (
            <button
              key={w.value}
              onClick={() => setData({ ...data, weather: w.value })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-150
                ${data.weather === w.value
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 font-medium"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <span>{w.icon}</span>
              <span className="text-xs truncate">{w.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Route */}
      <div>
        <label className="form-label">Route Type</label>
        <div className="flex gap-2">
          {routeOptions.map((r) => (
            <button
              key={r.value}
              onClick={() => setData({ ...data, route: r.value })}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-all duration-150
                ${data.route === r.value
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 font-medium"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
            >
              <span className="text-base">{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <SliderField
        label="Traffic Load"
        value={data.traffic}
        min={0}
        max={100}
        unit="%"
        onChange={(v) => setData({ ...data, traffic: v })}
      />
      <SliderField
        label="Driver Fatigue"
        value={data.fatigue}
        min={0}
        max={10}
        unit="/10"
        onChange={(v) => setData({ ...data, fatigue: v })}
      />
      <SliderField
        label="Distance"
        value={data.distance}
        min={50}
        max={2000}
        step={50}
        unit=" km"
        onChange={(v) => setData({ ...data, distance: v })}
      />

      {/* Disruptions */}
      <div>
        <label className="form-label">Active Disruptions</label>
        <div className="space-y-2">
          {disruptionsList.map((d) => {
            const checked = issues.includes(d.key);
            return (
              <label
                key={d.key}
                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all duration-150
                  ${checked
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200 hover:bg-slate-50"
                  }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={checked}
                  onChange={() => toggleIssue(d.key)}
                />
                <span className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 text-xs transition-all
                  ${checked ? "bg-red-500 border-red-500 text-white" : "border-slate-300"}`}>
                  {checked && "✓"}
                </span>
                <span className="text-sm">{d.icon}</span>
                <span className="text-sm text-slate-700 flex-1">{d.label}</span>
                <span className="text-xs text-red-500 font-medium">+{d.impact}%</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Score preview */}
      <ScoreBar preview={preview} loading={previewLoading} />
      {previewError && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{previewError}</p>
      )}

      {/* Run button */}
      <button
        onClick={() =>
          onSimulate({
            params:      data,
            disruptions: issues,
            payload:     buildModelPayload({ params: data, disruptions: issues }),
          })
        }
        className="w-full btn-primary flex items-center justify-center gap-2 py-3"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
        </svg>
        Run Simulation
      </button>
    </div>
  );
}
