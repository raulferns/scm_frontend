import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export function useShipments() {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "shipments"), (snapshot) => {
      // const data = snapshot.docs.map(doc => ({
      //   id: doc.id,
      //   ...doc.data()
      // }));
    //   setShipments(data);
    setShipments([
  {
    id: "1",
    shipmentId: "SHIP001",
    origin: { lat: 19.076, lng: 72.8777, address: "Mumbai" },
    destination: { lat: 28.7041, lng: 77.1025, address: "Delhi" },
    status: "in_transit",
    riskLevel: "High",
    delayProbability: 70,
    aiExplanation: "Traffic congestion",
  }
]);
    });

    return () => unsub();
  }, []);

  return shipments;
}