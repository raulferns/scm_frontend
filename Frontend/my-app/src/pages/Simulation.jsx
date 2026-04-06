import Navbar from "../components/Navbar";
import SimulationPanel from "../components/SimulationPanel";

export default function Simulation() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Risk Simulation Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SimulationPanel />
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border min-h-[300px]">
            <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">Simulation Results</h3>
            <p className="text-gray-400 italic">Adjust parameters on the left to see live risk impact.</p>
          </div>
        </div>
      </div>
    </div>
  );
}