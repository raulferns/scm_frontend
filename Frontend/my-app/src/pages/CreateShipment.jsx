import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";

export default function CreateShipment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    priority: "medium",
    constraints: []
  });

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      constraints: checked 
        ? [...prev.constraints, value] 
        : prev.constraints.filter(c => c !== value)
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // We mock the lat/lng for development since we aren't using a geocoder
    const payload = {
      origin: { address: formData.origin, lat: 19.07, lng: 72.87 },
      destination: { address: formData.destination, lat: 28.70, lng: 77.10 },
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
              onChange={(e) => setFormData({...formData, origin: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Destination Address"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              required
            />
          </div>

          <select 
            className="w-full border p-3 rounded-xl bg-white"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <div className="flex gap-4 text-sm text-gray-600">
            {['avoid_tolls', 'avoid_highways'].map(c => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" value={c} onChange={handleCheckbox} className="rounded" />
                {c.replace('_', ' ')}
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
// // import React, { useState, useRef } from "react";
// // import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
// // import { useNavigate } from "react-router-dom";
// // import toast, { Toaster } from "react-hot-toast";
// // import Navbar from "../components/Navbar";

// // // 1. Move this OUTSIDE the component to prevent re-renders
// // const libraries = ["places"];

// // export default function CreateShipment() {
// //   const navigate = useNavigate();
// //   const [priority, setPriority] = useState("medium");
  
// //   // Refs must be at the TOP level of the function
// //   const originRef = useRef(null);
// //   const destRef = useRef(null);

// //   const { isLoaded } = useJsApiLoader({
// //     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
// //     libraries, // Uses the constant defined above
// //   });

// //   const onSubmit = async (e) => {
// //     e.preventDefault();
// //     if (!originRef.current || !destRef.current) return;

// //     const originPlace = originRef.current.getPlace();
// //     const destPlace = destRef.current.getPlace();

// //     if (!originPlace?.geometry || !destPlace?.geometry) {
// //       toast.error("Please select an address from the dropdown list");
// //       return;
// //     }

// //     console.log("Origin Lat:", originPlace.geometry.location.lat());
// //     // ... your fetch call here
// //   };

// //   // 2. This is the safety gate. Nothing using Google Maps should be above this line.
// //   if (!isLoaded) return <div className="p-10 text-center">Loading Maps API...</div>;

// //   return (
// //     <div className="bg-gray-50 min-h-screen">
// //       <Navbar />
// //       <Toaster />
// //       <div className="max-w-2xl mx-auto p-6">
// //         <h1 className="text-2xl font-bold mb-6">Create Shipment</h1>
// //         <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
          
// //           <div>
// //             <label className="block text-sm font-medium mb-1">Origin</label>
// //             {/* 3. Autocomplete ONLY renders because isLoaded is true */}
// //             <Autocomplete onLoad={(ref) => (originRef.current = ref)}>
// //               <input
// //                 type="text"
// //                 placeholder="Search origin..."
// //                 className="w-full border p-2 rounded-lg"
// //                 required
// //               />
// //             </Autocomplete>
// //           </div>

// //           <div>
// //             <label className="block text-sm font-medium mb-1">Destination</label>
// //             <Autocomplete onLoad={(ref) => (destRef.current = ref)}>
// //               <input
// //                 type="text"
// //                 placeholder="Search destination..."
// //                 className="w-full border p-2 rounded-lg"
// //                 required
// //               />
// //             </Autocomplete>
// //           </div>

// //           <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold">
// //             Create Shipment
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useState, useRef } from "react";
// import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
// import { useNavigate } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";
// import Navbar from "../components/Navbar";
// import { createShipment } from "../api/shipments";

// const libraries = ["places"];

// export default function CreateShipment() {
//   const navigate = useNavigate();
//   const [priority, setPriority] = useState("medium");
//   const [constraints, setConstraints] = useState([]);
  
//   // Refs for Autocomplete instances
//   const originRef = useRef(null);
//   const destRef = useRef(null);

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
//     libraries,
//   });

//   const handleConstraintChange = (e) => {
//     const { value, checked } = e.target;
//     if (checked) {
//       setConstraints([...constraints, value]);
//     } else {
//       setConstraints(constraints.filter((c) => c !== value));
//     }
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       // Get Lat/Lng from Autocomplete refs
//       const originPlace = originRef.current.getPlace();
//       const destPlace = destRef.current.getPlace();

//       if (!originPlace?.geometry || !destPlace?.geometry) {
//         toast.error("Please select valid addresses from the dropdown");
//         return;
//       }

//       const payload = {
//         origin: {
//           lat: originPlace.geometry.location.lat(),
//           lng: originPlace.geometry.location.lng(),
//         },
//         destination: {
//           lat: destPlace.geometry.location.lat(),
//           lng: destPlace.geometry.location.lng(),
//         },
//         priority,
//         constraints,
//       };

//       await createShipment(payload);
      
//       toast.success("Shipment created!");
//       setTimeout(() => navigate("/"), 1500); // Redirect after toast
//     } catch (error) {
//       toast.error("Failed to create shipment. Try again.");
//     }
//   };

//   if (!isLoaded) return <div className="p-10">Loading Autocomplete...</div>;

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <Navbar />
//       <Toaster position="top-right" />
      
//       <div className="max-w-2xl mx-auto p-6 mt-10">
//         <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Shipment</h1>
        
//         <form onSubmit={onSubmit} className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
          
//           {/* ORIGIN & DESTINATION */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
//               <Autocomplete onLoad={(ref) => (originRef.current = ref)}>
//                 <input
//                   type="text"
//                   placeholder="Enter origin address"
//                   className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
//                   required
//                 />
//               </Autocomplete>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
//               <Autocomplete onLoad={(ref) => (destRef.current = ref)}>
//                 <input
//                   type="text"
//                   placeholder="Enter destination address"
//                   className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
//                   required
//                 />
//               </Autocomplete>
//             </div>
//           </div>

//           {/* PRIORITY */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
//             <select
//               value={priority}
//               onChange={(e) => setPriority(e.target.value)}
//               className="w-full border border-gray-300 p-2 rounded-lg bg-white"
//             >
//               <option value="low">Low</option>
//               <option value="medium">Medium</option>
//               <option value="high">High</option>
//             </select>
//           </div>

//           {/* CONSTRAINTS */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Route Constraints</label>
//             <div className="flex flex-wrap gap-4">
//               {["avoid_tolls", "avoid_highways", "avoid_ferries"].map((c) => (
//                 <label key={c} className="flex items-center space-x-2 text-sm cursor-pointer">
//                   <input
//                     type="checkbox"
//                     value={c}
//                     onChange={handleConstraintChange}
//                     className="w-4 h-4 text-emerald-600 rounded border-gray-300"
//                   />
//                   <span className="capitalize">{c.replace("_", " ")}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* SUBMIT */}
//           <button
//             type="submit"
//             className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
//           >
//             Create Shipment
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
