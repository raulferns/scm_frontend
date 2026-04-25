import { useShipments } from "../hooks/useShipments";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import AlertBanner from "../components/AlertBanner";
import ShipmentTable from "../components/ShipmentTable";
import ShipmentMap from "../components/ShipmentMap";

// Icons for each StatCard (20px, colour injected via parent container)
const TruckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
    <path d="M3 4h1.5l1.5 8H14l1.5-5H6"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
  </svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/>
  </svg>
);

/* ── Quick Insights row config ───────────────────── */
const INSIGHT_ICONS = {
  active:   { emoji: "🚚", bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  highrisk: { emoji: "⚠️", bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
  transit:  { emoji: "📦", bg: "rgba(16,185,129,0.15)",  color: "#34d399" },
  delay:    { emoji: "⏱",  bg: "rgba(245,158,11,0.15)",  color: "#fbbf24" },
};

function InsightRow({ iconKey, label, sub, value, valueColor, last }) {
  const ic = INSIGHT_ICONS[iconKey];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "14px 0",
      borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
        background: ic.bg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "18px",
      }}>
        {ic.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "#d1d5db", margin: "0 0 2px" }}>{label}</p>
        <p style={{ fontSize: "11px", color: "#4b5563", margin: 0 }}>{sub}</p>
      </div>
      <span style={{ fontSize: "15px", fontWeight: 700, color: valueColor, flexShrink: 0 }}>{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const { shipments, loading, error } = useShipments();
  const safeShipments = Array.isArray(shipments) ? shipments : [];

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", background: "#030712" }}>
        Error: {error}
      </div>
    );
  }

  const highRisk  = shipments.filter(s => s.riskLevel === "High");
  const avgDelay  = shipments.length > 0
    ? (shipments.reduce((sum, s) => sum + (s.delayProbability || 0), 0) / shipments.length).toFixed(1)
    : 0;
  const inTransit = shipments.filter(s => s.status === "in_transit");

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div style={{ background: "#030712", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#f9fafb" }}>
      <Navbar />

      {/* High-risk alert banner */}
      {highRisk.length > 0 && (
        <AlertBanner count={highRisk.length} />
      )}

      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* ── Page Header ─────────────────────────── */}
        <div style={{
          padding: "32px 32px 24px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#f9fafb", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Dashboard
            </h1>
            <p style={{ fontSize: "14px", color: "#4b5563", margin: 0 }}>
              Real-time overview of your supply chain network
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px", padding: "6px 12px", fontSize: "12px", color: "#6b7280",
            display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", marginTop: "8px",
          }}>
            <span>Last updated</span>
            <span style={{ color: "#9ca3af", fontWeight: 500 }}>{timeStr}</span>
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px", padding: "0 32px 24px",
        }}>
          <StatCard title="Total Shipments" value={shipments.length}    icon={<TruckIcon />} accent="blue"    />
          <StatCard title="High Risk"        value={highRisk.length}     icon={<AlertIcon />} accent="red"     />
          <StatCard title="In Transit"       value={inTransit.length}    icon={<ClockIcon />} accent="emerald" />
          <StatCard title="Avg Delay %"      value={`${avgDelay}%`}      icon={<ChartIcon />} accent="amber"   />
        </div>

        {/* ── Map + Quick Insights ─────────────────── */}
        <div style={{
          display: "grid", gridTemplateColumns: "60% 1fr",
          gap: "24px", padding: "0 32px 0",
        }}>

          {/* Map Card */}
          <div style={{
            background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px", overflow: "hidden",
          }}>
            {/* Card header */}
            <div style={{
              padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f9fafb", margin: "0 0 4px" }}>Live Shipment Routes</h2>
                <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>Real-time route visualisation across India</p>
              </div>
              {/* Legend */}
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                {[
                  { label: "Low",    dot: "#10b981" },
                  { label: "Medium", dot: "#f59e0b" },
                  { label: "High",   dot: "#ef4444" },
                ].map(({ label, dot }) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6b7280" }}>
                    <span style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: dot, boxShadow: `0 0 6px ${dot}`, flexShrink: 0,
                    }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Map wrapper — apply subtle dark filter to tiles */}
            <div className="dark-map-wrapper">
              <ShipmentMap shipments={safeShipments} />
            </div>
          </div>

          {/* Quick Insights */}
          <div style={{
            background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px", padding: "24px",
          }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f9fafb", margin: "0 0 4px" }}>Quick Insights</h2>
            <p style={{ fontSize: "12px", color: "#4b5563", margin: "0 0 24px" }}>Key metrics at a glance</p>

            <InsightRow
              iconKey="active"
              label="Active Shipments"
              sub={`${shipments.length} total in network`}
              value={shipments.length}
              valueColor="#3b82f6"
            />
            <InsightRow
              iconKey="highrisk"
              label="High Risk"
              sub="Requires immediate attention"
              value={highRisk.length}
              valueColor={highRisk.length === 0 ? "#10b981" : "#ef4444"}
            />
            <InsightRow
              iconKey="transit"
              label="In Transit"
              sub="Currently moving"
              value={inTransit.length}
              valueColor="#10b981"
            />
            <InsightRow
              iconKey="delay"
              label="Avg Delay Prob."
              sub="Across all shipments"
              value={`${avgDelay}%`}
              valueColor="#f59e0b"
              last
            />
          </div>
        </div>

        {/* ── Shipment Table ───────────────────────── */}
        <div style={{ padding: "0 32px 40px" }}>
          <ShipmentTable shipments={safeShipments} />
        </div>

      </div>

      {/* Map tile darken helper — applied to the outer wrapper only */}
      <style>{`
        .dark-map-wrapper {
          height: 420px;
          filter: brightness(0.85) saturate(0.7);
        }
        .dark-map-wrapper .leaflet-container {
          height: 100%;
        }
      `}</style>
    </div>
  );
}