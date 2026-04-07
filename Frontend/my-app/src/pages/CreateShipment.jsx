import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";

export default function CreateShipment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    priority: "medium",
    constraints: [],
  });

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      constraints: checked
        ? [...prev.constraints, value]
        : prev.constraints.filter((constraint) => constraint !== value),
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = {
      origin: { address: formData.origin, lat: 19.07, lng: 72.87 },
      destination: { address: formData.destination, lat: 28.7, lng: 77.1 },
      priority: formData.priority,
      constraints: formData.constraints,
    };

    console.log("Form Submitted:", payload);
    toast.success("Shipment created!");
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <Toaster />
      <div className="max-w-2xl mx-auto p-6 mt-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">New Shipment</h1>
        <form onSubmit={onSubmit} className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Origin Address"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={(e) => setFormData((prev) => ({ ...prev, origin: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Destination Address"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
              required
            />
          </div>

          <select
            className="w-full border p-3 rounded-xl bg-white"
            value={formData.priority}
            onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <div className="flex gap-4 text-sm text-gray-600">
            {["avoid_tolls", "avoid_highways"].map((constraint) => (
              <label key={constraint} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" value={constraint} onChange={handleCheckbox} className="rounded" />
                {constraint.replace("_", " ")}
              </label>
            ))}
          </div>

          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition">
            Create Shipment
          </button>
        </form>
      </div>
    </div>
  );
}
