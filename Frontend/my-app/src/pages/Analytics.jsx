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
  Legend,
} from "recharts";

const RISK_COLORS   = ["#ef4444", "#f59e0b", "#10b981"];
const STATUS_COLORS = ["#94a3b8", "#3b82f6", "#10b981", "#ef4444"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2 text-sm">
        <p className="font-semibold text-slate-700">{payload[0].name}</p>
        <p className="text-slate-500">{payload[0].value} shipments</p>
      </div>
    );
  }
  return null;
};

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card p-6">
      <div className="mb-5">
        <h2 className="section-title text-base">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

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
  { name: "Pending",    value: shipments.filter(s => s.status === "pending").length },
  { name: "In Transit", value: shipments.filter(s => s.status === "in_transit").length },
  { name: "Delivered",  value: shipments.filter(s => s.status === "delivered").length },
  { name: "Cancelled",  value: shipments.filter(s => s.status === "cancelled").length },
];

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6 page-enter">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
            <p className="section-sub">Shipment risk and status breakdown</p>
          </div>
          <span className={`badge ${isLive ? "badge-green" : "badge-gray"} px-3 py-1.5`}>
            {isLive ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" /> Live Data</>
            ) : (
              "Sample Data"
            )}
          </span>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Analysed", value: shipments.length,                                           color: "text-slate-800"   },
            { label: "High Risk",      value: riskData[0].value,                                          color: "text-red-600"     },
            { label: "Delivered",      value: statusData[2].value,                                        color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 flex items-center gap-4">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Risk Pie */}
          <ChartCard
            title="Risk Distribution"
            subtitle="Breakdown of shipments by risk classification"
          >
            <ResponsiveContainer width="100%" height={280}>
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
                >
                  {riskData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={RISK_COLORS[index % RISK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Status Bar */}
          <ChartCard
            title="Shipment Status"
            subtitle="Count of shipments per delivery status"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData} barCategoryGap="35%">
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
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
          </ChartCard>

        </div>

        {/* Risk legend detail */}
        <div className="mt-6 card p-5">
          <h3 className="text-sm font-semibold text-slate-600 mb-4">Risk Level Guide</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { level: "Low",    color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", desc: "Minimal chance of delay. No action needed."        },
              { level: "Medium", color: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50",   desc: "Some risk factors present. Monitor closely."       },
              { level: "High",   color: "bg-red-500",     text: "text-red-700",     bg: "bg-red-50",     desc: "Significant delay probability. Intervene quickly."  },
            ].map(({ level, color, text, bg, desc }) => (
              <div key={level} className={`${bg} rounded-xl p-4 border ${bg.replace("50","100")}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${color}`} />
                  <span className={`text-sm font-semibold ${text}`}>{level} Risk</span>
                  <span className="ml-auto text-xl font-bold text-slate-700">
                    {riskData.find(r => r.name === level)?.value ?? 0}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}