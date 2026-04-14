import { useParams, useNavigate } from "react-router-dom";
import { useShipments } from "../hooks/useShipments";
import Navbar from "../components/Navbar";
import RiskBadge from "../components/RiskBadge";
import ShipmentMap from "../components/ShipmentMap";

const STATUS_STYLE = {
  in_transit: { label: "In Transit", classes: "bg-blue-50 text-blue-700 border-blue-200"     },
  delayed:    { label: "Delayed",    classes: "bg-red-50  text-red-700  border-red-200"       },
  delivered:  { label: "Delivered",  classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-slate-50 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function ShipmentDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { shipments, loading, error } = useShipments();
  const safeShipments = Array.isArray(shipments) ? shipments : [];

  const shipment = safeShipments.find(s => s.shipmentId === id);

  const affectedShipments = shipment
    ? safeShipments.filter(
        (s) =>
          s.shipmentId !== shipment.shipmentId &&
          (s.origin?.address === shipment.origin?.address ||
            s.destination?.address === shipment.destination?.address)
      )
    : [];

  if (!shipment) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shimmer" />
          <p className="text-slate-400 text-sm">Loading shipment details…</p>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_STYLE[shipment.status] ?? { label: shipment.status, classes: "bg-slate-50 text-slate-600 border-slate-200" };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-6 page-enter">

        {/* ── Page header ────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
          >
            ←
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800">Shipment Details</h1>
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {shipment.shipmentId}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">Full route and risk breakdown</p>
          </div>

          {/* Status + Risk badges */}
          <div className="flex items-center gap-2">
            <span className={`badge border text-xs ${statusCfg.classes}`}>
              {statusCfg.label}
            </span>
            <RiskBadge level={shipment.riskLevel} />
          </div>
        </div>

        {/* ── Map ────────────────────────────────── */}
        <div className="card overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Route Map</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {shipment.origin?.address} → {shipment.destination?.address}
              </p>
            </div>
            <div className="flex gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700 inline-block"/>Origin</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Destination</span>
            </div>
          </div>
          <div className="p-2">
            <ShipmentMap shipments={[shipment]} />
          </div>
        </div>

        {/* ── Info grid ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          {/* Route card */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm">🗺️</span>
              Route Information
            </h3>
            <InfoRow label="Origin"      value={shipment.origin?.address ?? "—"} />
            <InfoRow label="Destination" value={shipment.destination?.address ?? "—"} />
            <InfoRow label="Status"      value={
              <span className={`badge border text-xs ${statusCfg.classes}`}>{statusCfg.label}</span>
            } />
          </div>

          {/* Risk card */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-sm">⚠️</span>
              Risk Assessment
            </h3>
            <InfoRow label="Risk Level"  value={<RiskBadge level={shipment.riskLevel} />} />
            <InfoRow label="Delay Prob." value={
              <div className="flex items-center gap-2">
                <div className="progress-bar-track w-20">
                  <div
                    className={`progress-bar-fill ${
                      (shipment.delayProbability ?? 0) >= 70 ? "bg-red-500" :
                      (shipment.delayProbability ?? 0) >= 40 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${shipment.delayProbability ?? 0}%` }}
                  />
                </div>
                <span className="font-semibold text-slate-800">{shipment.delayProbability ?? 0}%</span>
              </div>
            } />
          </div>
        </div>

        {/* ── AI Insight card ─────────────────────── */}
        <div className="card p-5 bg-indigo-50/70 border-indigo-100 mb-5">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold">AI</span>
            AI Shipment Insight
          </h3>
          <p className="text-sm text-indigo-800 leading-relaxed">
            {shipment.aiExplanation ?? "No AI explanation available for this shipment."}
          </p>
          <div className="mt-3 pt-3 border-t border-indigo-200 flex items-center gap-2">
            <span className="text-xs text-indigo-500 font-medium">Delay Probability:</span>
            <span className="text-xs font-bold text-indigo-700">{shipment.delayProbability ?? 0}%</span>
          </div>
        </div>

        {/* ── Cascade Impact ──────────────────────── */}
        {shipment.riskLevel === "High" && affectedShipments.length > 0 && (
          <div className="card p-5 border-amber-200 bg-amber-50/70">
            <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-200 flex items-center justify-center text-amber-700 text-sm">⚡</span>
              Cascade Impact
              <span className="ml-auto badge bg-amber-200 text-amber-800 border-amber-300">{affectedShipments.length} affected</span>
            </h3>
            <p className="text-xs text-amber-700 mb-3">
              This high-risk shipment may affect the following routes:
            </p>
            <div className="space-y-2">
              {affectedShipments.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-amber-100 cursor-pointer hover:border-amber-300 transition-all duration-150 shadow-sm"
                  onClick={() => (window.location.href = `/shipment/${s.shipmentId}`)}
                >
                  <span className="text-sm">🚚</span>
                  <span className="text-sm font-medium text-slate-700 font-mono">{s.shipmentId}</span>
                  <span className="ml-auto text-xs text-slate-500 capitalize">{s.status?.replace("_", " ")}</span>
                  <RiskBadge level={s.riskLevel} />
                  <span className="text-emerald-600 text-xs font-medium">View →</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}