import React, { useState } from "react";

export default function SimulationPanel() {
  const [weather, setWeather] = useState("Clear");

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
      <h3 className="font-bold text-lg">Control Panel</h3>
      <div>
        <label className="text-sm font-medium text-gray-500">Weather Scenario</label>
        <select 
          className="w-full mt-1 border p-2 rounded-lg bg-gray-50"
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
        >
          <option>Clear Skies</option>
          <option>Heavy Rain</option>
          <option>Cyclone Warning</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Traffic Density</label>
        <input type="range" className="w-full accent-emerald-600" />
      </div>
      <button className="w-full bg-black text-white py-2 rounded-lg font-medium">
        Apply Simulation
      </button>
    </div>
  );
}