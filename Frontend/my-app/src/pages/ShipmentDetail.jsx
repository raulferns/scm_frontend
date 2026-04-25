import Navbar from "../components/Navbar";
import ExternalEvents from "../components/ExternalEvents";

// Mock — replace with real API/props
const shipment = {
  id: "SHP-4821",
  origin: "Mumbai",
  destination: "Pune",
  status: "In Transit",
  eta: "Today, 9:45 PM",
  driver: "Rakesh M.",
  route: "Mumbai–Pune Expressway",
  externalEvents: [
    {
      name: "IPL Match – Wankhede",
      type: "cricket",
      impact: "high",
      time: "7:00 PM",
      location: "Wankhede Stadium",
      delayMin: 35,
      affectedRoute: "Western Express Hwy",
      reason: "Post-match crowd dispersal causes severe congestion on WEH and nearby roads.",
      shipmentsAffected: 3,
    },
    {
      name: "Ganesh Visarjan Procession",
      type: "festival",
      impact: "high",
      time: "6:00 PM",
      location: "Girgaon to Chowpatty",
      delayMin: 50,
      affectedRoute: "Marine Drive corridor",
      reason: "Procession blocks multiple arterial roads. Plan alternate routing.",
      shipmentsAffected: 5,
    },
    {
      name: "Peak Hour Traffic",
      type: "traffic",
      impact: "medium",
      time: "5:30 – 8:00 PM",
      location: "Sion–Panvel Highway",
      delayMin: 18,
      affectedRoute: "NH-48",
      reason: "Regular evening peak — elevated vehicle density on expressway.",
      shipmentsAffected: 2,
    },
    {
      name: "Light Rain Forecast",
      type: "weather",
      impact: "low",
      time: "8:00 PM",
      location: "Khopoli Ghat",
      delayMin: 10,
      affectedRoute: "Khopoli Ghat section",
      reason: "Reduced visibility on ghat road. Driver advisory issued.",
      shipmentsAffected: 1,
    },
  ],
};

/* ── Status badge (dark) ───────────────────────────── */
const STATUS_DARK = {
  "In Transit": {
    bg: "rgba(59,130,246,0.15)", color: "#3b82f6",
    border: "rgba(59,130,246,0.3)", glow: "rgba(59,130,246,0.15)",
    label: "In Transit",
  },
  Delivered: {
    bg: "rgba(16,185,129,0.15)", color: "#10b981",
    border: "rgba(16,185,129,0.3)", glow: "rgba(16,185,129,0.15)",
    label: "Delivered",
  },
  Pending: {
    bg: "rgba(245,158,11,0.15)", color: "#f59e0b",
    border: "rgba(245,158,11,0.3)", glow: "rgba(245,158,11,0.1)",
    label: "Pending",
  },
};

function StatusPill({ status }) {
  const s = STATUS_DARK[status] ?? STATUS_DARK.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      boxShadow: `0 0 20px ${s.glow}`,
      borderRadius: "9999px", padding: "10px 20px",
      fontSize: "14px", fontWeight: 600,
    }}>
      {s.label}
    </span>
  );
}

/* ── Info row ─────────────────────────────────────── */
function InfoRow({ label, value, isLast }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
      padding: isLast ? "20px 0 0" : "20px 0",
    }}>
      <span style={{ fontSize: "13px", color: "#4b5563" }}>{label}</span>
      <span style={{ fontSize: "14px", fontWeight: 600, color: "#f9fafb", display: "flex", alignItems: "center", gap: "8px" }}>
        {value}
      </span>
    </div>
  );
}

/* ── Row icons ────────────────────────────────────── */
const RouteIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" width="14" height="14" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round">
    <path d="M2 9h14M9 3l6 6-6 6"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" width="14" height="14" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="9" cy="9" r="7"/>
    <path d="M9 5v4l3 2"/>
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" width="14" height="14" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="9" cy="6" r="3"/>
    <path d="M3 16c0-3.314 2.686-6 6-6s6 2.686 6 6"/>
  </svg>
);

/* ── Arrow SVG for route ──────────────────────────── */
const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

export default function ShipmentDetail() {
  return (
    <div style={{
      background: "#030712", minHeight: "100vh",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#f9fafb",
    }}>
      <Navbar />

      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* ── Page Header ─────────────────────────── */}
        <div style={{
          padding: "40px 40px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: "32px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <h1 style={{
              fontSize: "40px", fontWeight: 900, fontFamily: "monospace",
              color: "#f9fafb", letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1,
            }}>
              {shipment.id}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", color: "#6b7280" }}>
              <span style={{ color: "#d1d5db" }}>{shipment.origin}</span>
              <ArrowIcon />
              <span style={{ color: "#d1d5db" }}>{shipment.destination}</span>
            </div>
          </div>
          <StatusPill status={shipment.status} />
        </div>

        <div style={{ padding: "0 40px 60px", display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* ── Shipment Details Card ───────────────── */}
          <div style={{
            background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px", padding: "32px",
          }}>
            <h3 style={{
              fontSize: "16px", fontWeight: 600, color: "#f9fafb",
              margin: "0 0 0", paddingBottom: "20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              Shipment Details
            </h3>

            <InfoRow
              label="Route"
              value={<><RouteIcon />{shipment.route}</>}
            />
            <InfoRow
              label="ETA"
              value={<><ClockIcon /><span style={{ color: "#10b981" }}>{shipment.eta}</span></>}
            />
            <InfoRow
              label="Driver"
              value={<><PersonIcon />{shipment.driver}</>}
              isLast
            />
          </div>

          {/* ← External Events section */}
          <ExternalEvents events={shipment.externalEvents} />

        </div>
      </div>
    </div>
  );
}