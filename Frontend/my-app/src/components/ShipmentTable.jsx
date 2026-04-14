import RiskBadge from "./RiskBadge";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  pending:     { label: "Pending",    classes: "badge-gray" },
  in_transit:  { label: "In Transit", classes: "badge-blue" },
  delivered:   { label: "Delivered",  classes: "badge-green" },
  cancelled:   { label: "Cancelled",  classes: "badge-red" }
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: "badge-gray" };
  return (
    <span className={`badge ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

export default function ShipmentTable({ shipments }) {
  const navigate = useNavigate();

  return (
    <div className="card overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="section-title text-base">All Shipments</h2>
          <p className="text-xs text-slate-400 mt-0.5">{shipments?.length ?? 0} total records</p>
        </div>
        <span className="badge badge-green">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
          Live
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Shipment ID</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Risk Level</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {shipments?.map((s) => (
              <tr
                key={s.shipmentId}
                onClick={() => navigate(`/shipment/${s.shipmentId}`)}
              >
                <td>
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {s.shipmentId}
                  </span>
                </td>
                <td>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[160px]">{s.origin?.address || "Unknown"}</span>
                  </span>
                </td>
                <td>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="truncate max-w-[160px]">{s.destination?.address || "Unknown"}</span>
                  </span>
                </td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
                <td>
                  <RiskBadge level={s.riskLevel} />
                </td>
                <td className="text-right">
                  <button
                    className="text-xs text-emerald-600 font-medium hover:text-emerald-800 transition-colors"
                    onClick={(e) => { e.stopPropagation(); navigate(`/shipment/${s.shipmentId}`); }}
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
            {(!shipments || shipments.length === 0) && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-slate-200">
                      <rect width="48" height="48" rx="12" fill="currentColor"/>
                      <path d="M16 28l8-8 8 8" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p className="text-sm">No shipments found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}