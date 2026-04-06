import { useShipments } from "../hooks/useShipments";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import AlertBanner from "../components/AlertBanner";
import ShipmentTable from "../components/ShipmentTable";
import ShipmentMap from "../components/ShipmentMap";

// ❌ REMOVED: import CreateShipment from "./pages/CreateShipment.jsx";
// ❌ REMOVED: import Simulation from "./pages/Simulation.jsx";
// (These belong in App.jsx only!)

export default function Dashboard() {
  const shipments = useShipments();
  const highRisk = shipments.filter(s => s.riskLevel === "High");

  // Logic for the Avg Delay % stat
  const avgDelay = shipments.length > 0 
    ? (shipments.reduce((sum, s) => sum + (s.delayProbability || 0), 0) / shipments.length).toFixed(1)
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {highRisk.length > 0 && (
        <AlertBanner count={highRisk.length} />
      )}

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Shipments" value={shipments.length} />
          <StatCard title="High Risk" value={highRisk.length} />
          <StatCard
            title="In Transit"
            value={shipments.filter(s => s.status === "in_transit").length}
          />
          <StatCard title="Avg Delay %" value={`${avgDelay}%`} />
        </div>

        {/* Map + Insights */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-white p-2 rounded-2xl shadow-sm">
            <ShipmentMap shipments={shipments} />
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3">Quick Insights</h2>
            <p className="text-sm text-gray-500">🚚 Active: {shipments.length}</p>
            <p className="text-sm text-red-500 mt-2">⚠ High Risk: {highRisk.length}</p>
          </div>
        </div>

        {/* Table */}
        <ShipmentTable shipments={shipments} />
      </div>
    </div>
  );
}