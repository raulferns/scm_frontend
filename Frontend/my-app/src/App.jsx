import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ShipmentDetail from "./pages/ShipmentDetail";
import Analytics from "./pages/Analytics";
import ChatAssistant from "./components/ChatAssistant";
import CreateShipment from "./pages/CreateShipment";
import Simulation from "./pages/Simulation";

// Temporary component for pages not yet built
const Dummy = ({ title }) => (
  <div className="p-10 text-xl">{title} Page Coming Soon...</div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shipment/:id" element={<ShipmentDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/create" element={<CreateShipment />} />
        <Route path="/simulate" element={<Simulation />} />
        
        {/* Optional: Catch-all route for broken links */}
        <Route path="*" element={<Dummy title="404" />} />
      </Routes>
      <ChatAssistant />
    </BrowserRouter>
  );
}

export default App;