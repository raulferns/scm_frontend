import { useCallback, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";

import Navbar from "../components/Navbar";
import SimulationPanel from "../components/SimulationPanel";
import { predictShipmentRisk } from "../api/simulation";
import {
  buildModelPayload,
  DISRUPTION_IMPACT,
  ROUTE_DELAY,
  WEATHER,
} from "../utils/simulationModel";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

/* ── Shared dark risk pill ───────────────────────── */
function RiskPill({ level }) {
  const map = {
    Low:    { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)", glow: "rgba(16,185,129,0.25)" },
    Medium: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)", glow: "rgba(245,158,11,0.2)"  },
    High:   { bg: "rgba(239,68,68,0.15)",  color: "#f87171", border: "rgba(239,68,68,0.3)",  glow: "rgba(239,68,68,0.2)"  },
  };
  const c = map[level] ?? { bg: "rgba(255,255,255,0.06)", color: "#6b7280", border: "rgba(255,255,255,0.1)", glow: "transparent" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: "9999px", fontSize: "11px", fontWeight: 700,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      boxShadow: `0 0 8px ${c.glow}`,
    }}>
      {level ?? "Unknown"}
    </span>
  );
}

/* ── Metric card ─────────────────────────────────── */
function ResultCard({ title, value, numColor, extra }) {
  return (
    <div style={{
      background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px", padding: "24px",
    }}>
      <p style={{
        fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em",
        fontWeight: 600, color: "#4b5563", margin: "0 0 12px",
      }}>
        {title}
      </p>
      <p style={{
        fontSize: "44px", fontWeight: 800, letterSpacing: "-0.03em",
        color: numColor ?? "#f9fafb", margin: "0 0 8px", lineHeight: 1,
      }}>
        {value}
      </p>
      {extra && <div>{extra}</div>}
    </div>
  );
}

/* ── Logic (unchanged) ───────────────────────────── */
function buildResult({ params, disruptions, prediction }) {
  const probability = prediction.delayProbability;
  const delay  = Math.min(Math.round(probability), 95);
  const damage = Math.min(Math.round(probability * 0.45), 85);
  const cost   = Math.max(1, Math.round((probability * (params.cargo ?? 25)) / 120));

  const factors = [
    { label: "Weather",  val: Math.min(100, WEATHER[params.weather] * 10) },
    { label: "Traffic",  val: params.traffic },
    { label: "Fatigue",  val: params.fatigue * 10 },
    { label: "Route",    val: Math.min(100, ROUTE_DELAY[params.route] * 4) },
    { label: "Distance", val: Math.min(100, Math.round(params.distance / 12)) },
    {
      label: "Issues",
      val: Math.min(100, disruptions.reduce(
        (sum, d) => sum + (DISRUPTION_IMPACT[d] || 0) * 4,
        0
      )),
    },
  ];

  const tips = [];
  if (params.weather !== "clear")  tips.push("Weather severity is materially affecting predicted delay.");
  if (params.traffic > 70)         tips.push("Peak-hour traffic is pushing the model toward a higher risk band.");
  if (params.fatigue > 6)          tips.push("Driver fatigue is being treated as extra historical delay pressure.");
  if (disruptions.length > 0)      tips.push("Operational disruptions are increasing the simulated route duration.");
  if (tips.length === 0)           tips.push("The model sees this route as relatively stable under current settings.");

  return {
    level: prediction.riskLevel,
    score: probability,
    delay,
    damage,
    cost,
    factors,
    tips,
    explanation:  prediction.explanation,
    modelVersion: prediction.modelVersion,
    features:     prediction.features,
  };
}

/* ── Semantic number colour ──────────────────────── */
function riskColor(pct) {
  if (pct < 40) return "#34d399";
  if (pct < 70) return "#fbbf24";
  return "#f87171";
}

export default function Simulation() {
  const [result,         setResult]         = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [history,        setHistory]        = useState([]);
  const [error,          setError]          = useState("");
  const [scenario,       setScenario]       = useState(null);
  const [preview,        setPreview]        = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError,   setPreviewError]   = useState("");

  const handleScenarioChange = useCallback((nextScenario) => {
    setScenario(nextScenario);
  }, []);

  useEffect(() => {
    if (!scenario?.payload) return;
    let isCancelled = false;
    setPreviewLoading(true);
    setPreviewError("");
    const timeoutId = setTimeout(async () => {
      try {
        const prediction = await predictShipmentRisk(scenario.payload);
        if (!isCancelled) setPreview(prediction);
      } catch (err) {
        if (!isCancelled) { setPreview(null); setPreviewError(err.message || "Preview failed"); }
      } finally {
        if (!isCancelled) setPreviewLoading(false);
      }
    }, 350);
    return () => { isCancelled = true; clearTimeout(timeoutId); };
  }, [scenario]);

  const runSimulation = async (data) => {
    setLoading(true);
    setError("");
    try {
      const payload = data.payload || buildModelPayload(data);
      const prediction =
        !previewLoading && !previewError && preview &&
        JSON.stringify(preview.features) === JSON.stringify(payload)
          ? preview
          : await predictShipmentRisk(payload);
      const nextResult = buildResult({ params: data.params, disruptions: data.disruptions, prediction });
      const entry = {
        id:    history.length + 1,
        score: prediction.delayProbability,
        level: prediction.riskLevel,
        time:  new Date().toLocaleTimeString(),
      };
      setResult(nextResult);
      setHistory((prev) => [entry, ...prev.slice(0, 8)]);
    } catch (err) {
      setError(err.message || "Simulation failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  /* ── Chart config (dark) ─────────────────────── */
  const chartData = result && {
    labels: result.factors.map((f) => f.label),
    datasets: [{
      data:            result.factors.map((f) => f.val),
      backgroundColor: result.factors.map((f) =>
        f.val >= 70 ? "#ef4444" : f.val >= 40 ? "#f59e0b" : "#10b981"
      ),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid:  { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#4b5563", font: { size: 12 } },
        border: { color: "rgba(255,255,255,0.06)" },
      },
      x: {
        grid:  { display: false },
        ticks: { color: "#4b5563", font: { size: 12 } },
        border: { color: "rgba(255,255,255,0.06)" },
      },
    },
  };

  /* ── Card shell ─────────────────────────────── */
  const card = {
    background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "16px",
  };

  return (
    <div style={{ background: "#030712", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#f9fafb" }}>
      <Navbar />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 32px 60px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            Risk Simulation
          </h1>
          <p style={{ fontSize: "15px", color: "#4b5563", margin: 0 }}>
            Try different scenarios and run them through the trained model
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* ── Left: Controls ──────────────────────── */}
          <div style={{ width: "360px", flexShrink: 0 }}>
            <SimulationPanel
              onSimulate={runSimulation}
              onScenarioChange={handleScenarioChange}
              preview={preview}
              previewLoading={previewLoading}
              previewError={previewError}
            />
          </div>

          {/* ── Right: Results ──────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Empty state */}
            {!result && !loading && !error && (
              <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", gap: "16px" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "16px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" width="32" height="32">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#9ca3af", margin: "0 0 4px" }}>No Results Yet</p>
                  <p style={{ fontSize: "14px", color: "#4b5563", margin: 0 }}>Configure your scenario and click Run Simulation</p>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px",
                  border: "3px solid rgba(16,185,129,0.2)",
                  borderTopColor: "#10b981",
                  borderRadius: "50%", animation: "sspin 0.7s linear infinite",
                }} />
                <p style={{ fontSize: "14px", color: "#6b7280", fontWeight: 500, margin: 0 }}>Running simulation…</p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div style={{ ...card }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "12px", padding: "14px 16px",
                }}>
                  <svg viewBox="0 0 20 20" fill="#ef4444" width="20" height="20" style={{ flexShrink: 0 }}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <p style={{ fontSize: "14px", color: "#f87171", margin: 0 }}>{error}</p>
                </div>
              </div>
            )}

            {/* ── Results ─────────────────────────── */}
            {result && !loading && (
              <>
                {/* Top metric cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
                  <ResultCard
                    title="Delay Risk"
                    value={`${result.delay}%`}
                    numColor={riskColor(result.delay)}
                    extra={<RiskPill level={result.level} />}
                  />
                  <ResultCard
                    title="Damage Risk"
                    value={`${result.damage}%`}
                    numColor={riskColor(result.damage)}
                    extra={<RiskPill level={result.level} />}
                  />
                  <ResultCard
                    title="Extra Cost"
                    value={`₹${result.cost}K`}
                    numColor="#f9fafb"
                    extra={
                      <span style={{ fontSize: "12px", color: "#4b5563" }}>
                        Score: {result.score.toFixed(2)}
                      </span>
                    }
                  />
                </div>

                {/* Risk Factor Breakdown chart */}
                <div style={card}>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#f9fafb", margin: "0 0 20px" }}>
                    Risk Factor Breakdown
                  </h3>
                  <div style={{ height: "208px" }}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>

                {/* Model explanation */}
                <div style={{
                  background: "rgba(16,185,129,0.05)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderLeft: "3px solid #10b981",
                  borderRadius: "16px", padding: "24px", marginBottom: "16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700,
                      background: "rgba(16,185,129,0.2)", color: "#10b981",
                      borderRadius: "6px", padding: "2px 8px",
                    }}>
                      AI
                    </span>
                    <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f9fafb", margin: 0 }}>
                      Model Explanation
                    </h4>
                  </div>
                  <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: 1.7, margin: "0 0 16px" }}>
                    {result.explanation}
                  </p>
                  {/* Feature pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {[
                      `v: ${result.modelVersion}`,
                      `${result.features.distanceKm} km`,
                      `traffic ${result.features.trafficDurationMin} min`,
                      `severity ${result.features.weatherSeverity}`,
                      `hour ${result.features.timeOfDay}`,
                      `hist. delay ${result.features.historicalDelayAvg}`,
                    ].map((pill) => (
                      <span key={pill} style={{
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px", padding: "6px 12px",
                        fontSize: "12px", fontFamily: "monospace", color: "#9ca3af",
                      }}>
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div style={card}>
                  <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f9fafb", margin: "0 0 16px" }}>Suggestions</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                    {result.tips.map((tip, idx) => (
                      <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                          background: "#10b981", boxShadow: "0 0 6px #10b981", marginTop: "7px",
                        }} />
                        <span style={{ fontSize: "14px", color: "#9ca3af", lineHeight: 1.6 }}>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recent Runs */}
                {history.length > 0 && (
                  <div style={card}>
                    <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f9fafb", margin: "0 0 16px" }}>Recent Runs</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {history.map((entry) => (
                        <div
                          key={entry.id}
                          style={{
                            display: "flex", alignItems: "center", gap: "16px",
                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "12px", padding: "14px 18px",
                          }}
                        >
                          <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#4b5563", flexShrink: 0 }}>
                            #{entry.id}
                          </span>
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#f9fafb", fontFamily: "monospace" }}>
                            {entry.score.toFixed(2)}/100
                          </span>
                          <RiskPill level={entry.level} />
                          <span style={{ fontSize: "12px", color: "#4b5563", marginLeft: "auto" }}>{entry.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes sspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
