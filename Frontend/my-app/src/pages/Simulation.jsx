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

/* ── Local sub-components (all logic unchanged) ── */
const Badge = ({ level }) => {
  const colors = {
    Low:    "badge-green",
    Medium: "badge-amber",
    High:   "badge-red",
  };
  return (
    <span className={`badge ${colors[level] ?? colors.Medium}`}>
      {level}
    </span>
  );
};

const ResultCard = ({ title, value, extra }) => (
  <div className="card p-4 space-y-1.5">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
    {extra && <div>{extra}</div>}
  </div>
);

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

  const chartData = result && {
    labels: result.factors.map((f) => f.label),
    datasets: [{
      data:            result.factors.map((f) => f.val),
      backgroundColor: result.factors.map((f) =>
        f.val >= 70 ? "#ef4444" : f.val >= 40 ? "#f59e0b" : "#10b981"
      ),
      borderRadius: 6,
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
        grid:  { color: "#f1f5f9" },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      x: {
        grid:  { display: false },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
    },
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6 page-enter">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Risk Simulation</h1>
          <p className="section-sub">Try different scenarios and run them through the trained model</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">

          {/* ── Left: Controls ──────────────────── */}
          <SimulationPanel
            onSimulate={runSimulation}
            onScenarioChange={handleScenarioChange}
            preview={preview}
            previewLoading={previewLoading}
            previewError={previewError}
          />

          {/* ── Right: Results ──────────────────── */}
          <div className="space-y-5">

            {/* Empty state */}
            {!result && !loading && !error && (
              <div className="card flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 font-medium">No Results Yet</p>
                  <p className="text-sm text-slate-400 mt-1">Configure your scenario and click Run Simulation</p>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="card flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-slate-500 text-sm font-medium">Running simulation…</p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="card p-6">
                <div className="flex items-center gap-3 text-red-700 bg-red-50 rounded-xl p-4">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Result */}
            {result && !loading && (
              <>
                {/* Top metric cards */}
                <div className="grid grid-cols-3 gap-4">
                  <ResultCard
                    title="Delay Risk"
                    value={`${result.delay}%`}
                    extra={<Badge level={result.level} />}
                  />
                  <ResultCard
                    title="Damage Risk"
                    value={`${result.damage}%`}
                    extra={<Badge level={result.level} />}
                  />
                  <ResultCard
                    title="Extra Cost"
                    value={`₹${result.cost}K`}
                    extra={<span className="text-xs text-slate-400">Score: {result.score.toFixed(2)}</span>}
                  />
                </div>

                {/* Chart */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-slate-600 mb-4">Risk Factor Breakdown</h3>
                  <div className="h-52">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>

                {/* Model explanation */}
                <div className="card p-5 bg-indigo-50/80 border-indigo-100">
                  <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs">AI</span>
                    Model Explanation
                  </h4>
                  <p className="text-sm text-indigo-800 leading-relaxed">{result.explanation}</p>
                  <p className="text-xs text-indigo-500 mt-3 bg-indigo-100 rounded-lg px-3 py-1.5">
                    {result.modelVersion} · {result.features.distanceKm} km · traffic {result.features.trafficDurationMin} min ·
                    weather severity {result.features.weatherSeverity} · hour {result.features.timeOfDay} ·
                    hist. delay {result.features.historicalDelayAvg}
                  </p>
                </div>

                {/* Suggestions */}
                <div className="card p-5">
                  <h4 className="text-sm font-semibold text-slate-600 mb-3">Suggestions</h4>
                  <ul className="space-y-2">
                    {result.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* History */}
                {history.length > 0 && (
                  <div className="card p-5">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3">Recent Runs</h4>
                    <div className="space-y-2">
                      {history.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2"
                        >
                          <span className="text-slate-400 font-mono">#{entry.id}</span>
                          <span className="font-semibold text-slate-700 tabular-nums">{entry.score.toFixed(2)}/100</span>
                          <Badge level={entry.level} />
                          <span className="text-slate-400">{entry.time}</span>
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
    </div>
  );
}
