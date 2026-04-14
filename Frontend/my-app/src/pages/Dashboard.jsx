import { useShipments } from "../hooks/useShipments";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import AlertBanner from "../components/AlertBanner";
import ShipmentTable from "../components/ShipmentTable";
import ShipmentMap from "../components/ShipmentMap";

// Icons for each StatCard
const TruckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
    <path d="M3 4h1.5l1.5 8H14l1.5-5H6"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
  </svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/>
  </svg>
);

export default function Dashboard() {
  const { shipments, loading, error } = useShipments();
  const safeShipments = Array.isArray(shipments) ? shipments : [];

  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }
  const highRisk = shipments.filter(s => s.riskLevel === "High");

  // Logic for the Avg Delay % stat
  const avgDelay = shipments.length > 0
    ? (shipments.reduce((sum, s) => sum + (s.delayProbability || 0), 0) / shipments.length).toFixed(1)
    : 0;

  const inTransit = shipments.filter(s => s.status === "in_transit");

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />

      {/* High-risk alert banner */}
      {highRisk.length > 0 && (
        <AlertBanner count={highRisk.length} />
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 page-enter">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time overview of your supply chain network</p>
        </div>

        {/* ── Stat Cards ────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Shipments"
            value={shipments.length}
            icon={<TruckIcon />}
            accent="blue"
          />
          <StatCard
            title="High Risk"
            value={highRisk.length}
            icon={<AlertIcon />}
            accent="red"
          />
          <StatCard
            title="In Transit"
            value={inTransit.length}
            icon={<ClockIcon />}
            accent="emerald"
          />
          <StatCard
            title="Avg Delay %"
            value={`${avgDelay}%`}
            icon={<ChartIcon />}
            accent="amber"
          />
        </div>

        {/* ── Map + Quick Insights ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Map card */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="section-title text-base">Live Shipment Routes</h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time route visualisation across India</p>
              </div>
              <div className="flex gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Low</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>High</span>
              </div>
            </div>
            <div className="p-2">
              <ShipmentMap shipments={safeShipments} />
            </div>
          </div>

          {/* Quick Insights */}
          <div className="card p-5 flex flex-col gap-4">
            <div>
              <h2 className="section-title text-base">Quick Insights</h2>
              <p className="text-xs text-slate-400 mt-0.5">Key metrics at a glance</p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Active */}
              <div className="insight-item bg-blue-50/60 border-blue-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 text-sm">🚚</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Active Shipments</p>
                  <p className="text-xs text-slate-500">{shipments.length} total in network</p>
                </div>
                <span className="ml-auto text-lg font-bold text-blue-600">{shipments.length}</span>
              </div>

              {/* High Risk */}
              <div className="insight-item bg-red-50/60 border-red-100">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 text-sm">⚠️</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">High Risk</p>
                  <p className="text-xs text-slate-500">Requires immediate attention</p>
                </div>
                <span className="ml-auto text-lg font-bold text-red-600">{highRisk.length}</span>
              </div>

              {/* In Transit */}
              <div className="insight-item bg-emerald-50/60 border-emerald-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 text-sm">📦</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">In Transit</p>
                  <p className="text-xs text-slate-500">Currently moving</p>
                </div>
                <span className="ml-auto text-lg font-bold text-emerald-600">{inTransit.length}</span>
              </div>

              {/* Avg delay */}
              <div className="insight-item bg-amber-50/60 border-amber-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 text-sm">⏱</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Avg Delay Prob.</p>
                  <p className="text-xs text-slate-500">Across all shipments</p>
                </div>
                <span className="ml-auto text-lg font-bold text-amber-600">{avgDelay}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Shipment Table ────────────────────── */}
        <ShipmentTable shipments={safeShipments} />

      </div>
    </div>
  );
}