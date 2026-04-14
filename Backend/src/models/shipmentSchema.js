const shipmentSchema = {
  shipmentId: "string",

  status: "pending | in_transit | delivered | cancelled",
  priority: "high | medium | low",

  origin: {
    lat: "number",
    lng: "number",
    address: "string (optional)"
  },

  destination: {
    lat: "number",
    lng: "number",
    address: "string (optional)"
  },

 
  weight: "number (kg, optional)",
  packageType: "string (box | pallet | envelope | fragile | hazardous)",
  instructions: "string (optional)",
  constraints: ["string"],
  pickupDate: "string (YYYY-MM-DD)",
  timeWindow: "string (morning | afternoon | evening | flexible)",

  distanceKm: "number (from Maps API)",
  trafficDurationMin: "number",
  trafficLevel: "Low | Moderate | Heavy",

  routePolyline: "string",

  alternateRoutes: [
    {
      polyline: "string",
      durationMin: "number",
      summary: "string"
    }
  ],

  eta: "timestamp",


  weatherCondition: "string",
  weatherSeverity: "number (0-10)",

  delayProbability: "number (0-100)",
  riskLevel: "Low | Medium | High",
  aiExplanation: "string",

  cascadeAffected: ["shipmentId"],


  createdAt: "timestamp",
  updatedAt: "timestamp"
};

module.exports = shipmentSchema;