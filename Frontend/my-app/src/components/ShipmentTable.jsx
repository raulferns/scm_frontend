import RiskBadge from "./RiskBadge";
import { useNavigate } from "react-router-dom";

/* ── Status badge config (dark) ── */
const STATUS_CONFIG = {
  pending:    { label: "Pending",    bg: "rgba(245,158,11,0.15)",  color: "#fbbf24", border: "rgba(245,158,11,0.2)"  },
  in_transit: { label: "In Transit", bg: "rgba(59,130,246,0.15)",  color: "#60a5fa", border: "rgba(59,130,246,0.2)"  },
  delivered:  { label: "Delivered",  bg: "rgba(16,185,129,0.15)",  color: "#34d399", border: "rgba(16,185,129,0.2)"  },
  cancelled:  { label: "Cancelled",  bg: "rgba(239,68,68,0.15)",   color: "#f87171", border: "rgba(239,68,68,0.2)"   },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: "rgba(255,255,255,0.05)", color: "#6b7280", border: "rgba(255,255,255,0.1)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 12px", borderRadius: "9999px", fontSize: "12px",
      fontWeight: 600, background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  );
}

export default function ShipmentTable({ shipments }) {
  const navigate = useNavigate();

  return (
    <div style={{
      background: "#0a0f1a",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "16px",
      overflow: "hidden",
      marginTop: "24px",
    }}>
      {/* Table top header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f9fafb", margin: 0 }}>All Shipments</h2>
          <span style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "9999px", padding: "2px 12px", fontSize: "12px", color: "#9ca3af",
          }}>
            {shipments?.length ?? 0} records
          </span>
        </div>

        {/* Live badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ position: "relative", width: "8px", height: "8px", flexShrink: 0 }}>
            <span style={{
              display: "block", width: "8px", height: "8px", borderRadius: "50%",
              background: "#10b981", boxShadow: "0 0 8px #10b981", position: "relative", zIndex: 1,
            }} />
          </div>
          <span style={{ color: "#10b981", fontSize: "12px", fontWeight: 500 }}>Live</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Shipment ID", "Origin", "Destination", "Status", "Risk Level", "Action"].map((h, i) => (
                <th key={h} style={{
                  padding: "12px 24px", textAlign: i === 5 ? "right" : "left",
                  fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em",
                  fontWeight: 600, color: "#4b5563",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments?.map((s) => (
              <tr
                key={s.shipmentId}
                onClick={() => navigate(`/shipment/${s.shipmentId}`)}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Shipment ID */}
                <td style={{ padding: "16px 24px" }}>
                  <span style={{
                    fontFamily: "monospace", fontSize: "12px",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "6px", padding: "2px 8px", color: "#d1d5db",
                    display: "inline-block", maxWidth: "160px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {s.shipmentId}
                  </span>
                </td>

                {/* Origin */}
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                    <span style={{ color: "#d1d5db", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.origin?.address || "Unknown"}
                    </span>
                  </span>
                </td>

                {/* Destination */}
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                    <span style={{ color: "#d1d5db", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.destination?.address || "Unknown"}
                    </span>
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: "16px 24px" }}>
                  <StatusBadge status={s.status} />
                </td>

                {/* Risk */}
                <td style={{ padding: "16px 24px" }}>
                  <RiskBadge level={s.riskLevel} />
                </td>

                {/* Action */}
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <button
                    style={{
                      color: "#34d399", fontSize: "14px", fontWeight: 500,
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "inherit", transition: "color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#6ee7b7"}
                    onMouseLeave={e => e.currentTarget.style.color = "#34d399"}
                    onClick={(e) => { e.stopPropagation(); navigate(`/shipment/${s.shipmentId}`); }}
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}

            {(!shipments || shipments.length === 0) && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "48px 24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
                      <rect width="48" height="48" rx="12" fill="rgba(255,255,255,0.04)" />
                      <path d="M16 28l8-8 8 8" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p style={{ color: "#4b5563", fontSize: "14px", margin: 0 }}>No shipments found</p>
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