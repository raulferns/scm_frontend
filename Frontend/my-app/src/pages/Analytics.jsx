import { useShipments } from "../hooks/useShipments";
import Navbar from "../components/Navbar";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ── Colour constants (unchanged) ──────────────────── */
const RISK_COLORS   = ["#ef4444", "#f59e0b", "#10b981"];
const STATUS_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#374151"];

/* ── Dark custom tooltip ───────────────────────────── */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px", padding: "8px 14px", fontSize: "13px",
      }}>
        <p style={{ fontWeight: 600, color: "#f9fafb", margin: "0 0 2px" }}>{payload[0].name}</p>
        <p style={{ color: "#9ca3af", margin: 0 }}>{payload[0].value} shipments</p>
      </div>
    );
  }
  return null;
};

/* ── Shared card shell ─────────────────────────────── */
const cardStyle = {
  background: "#0d1117",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
  padding: "32px",
};

export default function Analytics() {
  // Always call the hook at the very top.
  const { shipments, loading, error } = useShipments();

  // Define your fallback (dummy) data
  // const dummyData = [
  //   { id: 1, riskLevel: "High",   status: "delayed"    },
  //   { id: 2, riskLevel: "Medium", status: "in_transit" },
  //   { id: 3, riskLevel: "Low",    status: "delivered"  },
  //   { id: 4, riskLevel: "High",   status: "in_transit" },
  // ];

  // Determine which source to use.
  const isLive = shipments.length > 0;

  // Risk Data
  const riskData = [
    { name: "High",   value: shipments.filter(s => s.riskLevel === "High").length   },
    { name: "Medium", value: shipments.filter(s => s.riskLevel === "Medium").length },
    { name: "Low",    value: shipments.filter(s => s.riskLevel === "Low").length    },
  ];

  // Status Data
  const statusData = [
    { name: "Pending",    value: shipments.filter(s => s.status === "pending").length    },
    { name: "In Transit", value: shipments.filter(s => s.status === "in_transit").length },
    { name: "Delivered",  value: shipments.filter(s => s.status === "delivered").length  },
    { name: "Cancelled",  value: shipments.filter(s => s.status === "cancelled").length  },
  ];

  /* ── Risk guide config ─────────────────────────── */
  const riskGuide = [
    {
      level: "Low",
      count: riskData.find(r => r.name === "Low")?.value ?? 0,
      desc: "Minimal chance of delay. Shipments on this path are proceeding within normal operational parameters.",
      actionLabel: "No action needed",
      bg:     "rgba(16,185,129,0.05)",
      border: "rgba(16,185,129,0.15)",
      accent: "#10b981",
    },
    {
      level: "Medium",
      count: riskData.find(r => r.name === "Medium")?.value ?? 0,
      desc: "Some risk factors present. Consider proactive monitoring and have contingency routes on standby.",
      actionLabel: "Monitor closely",
      bg:     "rgba(245,158,11,0.05)",
      border: "rgba(245,158,11,0.15)",
      accent: "#f59e0b",
    },
    {
      level: "High",
      count: riskData.find(r => r.name === "High")?.value ?? 0,
      desc: "Significant delay probability detected. Immediate rerouting or dispatcher intervention is recommended.",
      actionLabel: "Intervene immediately",
      bg:     "rgba(239,68,68,0.05)",
      border: "rgba(239,68,68,0.2)",
      accent: "#ef4444",
    },
  ];

  return (
    <div style={{
      background: "#030712", minHeight: "100vh",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#f9fafb",
    }}>
      <Navbar />

      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* ── Page Header ──────────────────────────── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "32px 32px 24px",
        }}>
          <div>
            <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
              Analytics
            </h1>
            <p style={{ fontSize: "15px", color: "#4b5563", margin: 0 }}>
              Shipment risk and status breakdown
            </p>
          </div>

          {/* Live Data badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "9999px", padding: "8px 16px",
          }}>
            <div style={{ position: "relative", width: "8px", height: "8px", flexShrink: 0 }}>
              <span style={{
                display: "block", width: "8px", height: "8px",
                borderRadius: "50%", background: "#10b981",
                position: "relative", zIndex: 1,
              }} />
              <span style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "#10b981", animation: "anlPing 1.6s ease-in-out infinite",
              }} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#10b981" }}>
              {isLive ? "Live Data" : "Sample Data"}
            </span>
          </div>
        </div>

        {/* ── Top stat cards ───────────────────────── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px", padding: "0 32px", marginBottom: "32px",
        }}>
          {/* Total Analysed */}
          <div style={cardStyle}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: "#4b5563", margin: "0 0 16px" }}>
              Total Analysed
            </p>
            <p style={{ fontSize: "56px", fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.04em", lineHeight: 1, margin: "0 0 24px" }}>
              {shipments.length}
            </p>
            <div style={{ height: "3px", borderRadius: "99px", background: "linear-gradient(90deg, #3b82f6, rgba(59,130,246,0.15))", width: "48px" }} />
          </div>

          {/* High Risk */}
          <div style={cardStyle}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: "#4b5563", margin: "0 0 16px" }}>
              High Risk
            </p>
            <p style={{
              fontSize: "56px", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, margin: "0 0 24px",
              color: riskData[0].value === 0 ? "#10b981" : "#ef4444",
            }}>
              {riskData[0].value}
            </p>
            <div style={{ height: "3px", borderRadius: "99px", background: "linear-gradient(90deg, #ef4444, rgba(239,68,68,0.15))", width: "48px" }} />
          </div>

          {/* Delivered */}
          <div style={cardStyle}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: "#4b5563", margin: "0 0 16px" }}>
              Delivered
            </p>
            <p style={{ fontSize: "56px", fontWeight: 800, color: "#10b981", letterSpacing: "-0.04em", lineHeight: 1, margin: "0 0 24px" }}>
              {statusData[2].value}
            </p>
            <div style={{ height: "3px", borderRadius: "99px", background: "linear-gradient(90deg, #10b981, rgba(16,185,129,0.15))", width: "48px" }} />
          </div>
        </div>

        {/* ── Charts Row ───────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", padding: "0 32px", marginBottom: "32px" }}>

          {/* Risk Distribution (Donut) */}
          <div style={cardStyle}>
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#f9fafb", margin: "0 0 4px" }}>Risk Distribution</h2>
              <p style={{ fontSize: "13px", color: "#4b5563", margin: 0 }}>Breakdown of shipments by risk classification</p>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  stroke="none"
                >
                  {riskData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={RISK_COLORS[index % RISK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom legend */}
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "24px" }}>
              {[
                { name: "High",   color: "#ef4444", glow: "rgba(239,68,68,0.6)",   value: riskData[0].value },
                { name: "Medium", color: "#f59e0b", glow: "rgba(245,158,11,0.6)",  value: riskData[1].value },
                { name: "Low",    color: "#10b981", glow: "rgba(16,185,129,0.6)",  value: riskData[2].value },
              ].map(({ name, color, glow, value }) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
                    background: color, boxShadow: `0 0 6px ${glow}`,
                  }} />
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>{name}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Status (Bar) */}
          <div style={cardStyle}>
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#f9fafb", margin: "0 0 4px" }}>Shipment Status</h2>
              <p style={{ fontSize: "13px", color: "#4b5563", margin: 0 }}>Count of shipments per delivery status</p>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#4b5563" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#4b5563" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Risk Level Guide ─────────────────────── */}
        <div style={{ padding: "0 32px 40px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#f9fafb", margin: "0 0 24px" }}>
            Risk Level Guide
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {riskGuide.map(({ level, count, desc, actionLabel, bg, border, accent }) => (
              <div
                key={level}
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  borderLeft: `4px solid ${accent}`,
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: level === "High" && count > 0 ? "0 0 30px rgba(239,68,68,0.08)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: accent }}>{level} Risk</span>
                  <span style={{ fontSize: "32px", fontWeight: 800, color: accent, fontFamily: "monospace", lineHeight: 1 }}>
                    {count}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6, margin: "0 0 16px" }}>
                  {desc}
                </p>
                <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#4b5563", fontWeight: 600, margin: 0 }}>
                  {actionLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ping keyframe */}
      <style>{`
        @keyframes anlPing {
          0%, 100% { transform: scale(1);   opacity: 0.8; }
          50%       { transform: scale(2.4); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}