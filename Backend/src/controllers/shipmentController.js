const { createShipment, getAllShipments, getShipmentById, updateShipment } = require("../services/firestoreService");
const {getRoute} = require("../services/mapsService");
const { getWeather } = require("../services/weatherService");
const { predictShipmentDelay } = require("../services/mlService");
const { calculateEventImpact } = require("../services/eventImpactService");

function getTrafficLevel(distanceKm, trafficDurationMin) {
    const distance = Number(distanceKm) || 0;
    const duration = Number(trafficDurationMin) || 0;

    if (distance <= 0 || duration <= 0) {
        return "Moderate";
    }

    const minutesPerKm = duration / distance;

    if (minutesPerKm < 1.6) {
        return "Low";
    }

    if (minutesPerKm < 2.4) {
        return "Moderate";
    }

    return "Heavy";
}

function buildEta(trafficDurationMin, delayProbability, startTime) {
    const now = startTime ? new Date(startTime) : new Date();
    const validStart = Number.isNaN(now.getTime()) ? new Date() : now;
    const trafficMinutes = Number(trafficDurationMin) || 0;
    const delayMinutes = Math.round(Math.max(15, trafficMinutes * 0.35) * ((Number(delayProbability) || 0) / 100));
    const totalMinutes = trafficMinutes + delayMinutes;

    return new Date(validStart.getTime() + totalMinutes * 60 * 1000).toISOString();
}

exports.predictRisk = async(req, res) => {
    let mlFeatures = {};
    try{
        mlFeatures = {
            distanceKm: Number(req.body.distanceKm) || 0,
            trafficDurationMin: Number(req.body.trafficDurationMin) || 0,
            weatherSeverity: Number(req.body.weatherSeverity) || 0,
            timeOfDay: Number(req.body.timeOfDay) || 0,
            historicalDelayAvg: Number(req.body.historicalDelayAvg) || 0,
            eventImpactScore: Number(req.body.eventImpactScore) || 0,
            hoursUntilEvent: Number(req.body.hoursUntilEvent) || 24
        };

        const prediction = await predictShipmentDelay(mlFeatures );

        res.json({
            delayProbability: prediction.delayProbability,
            riskLevel: prediction.riskLevel,
            explanation: prediction.explanation,
            modelVersion: prediction.modelVersion,
            features: prediction.features,
        });
        
    }catch(err){
        console.error("ML failed:", err.message);

        res.status(503).json({
      error: err.message || "ML service unavailable",
      retryable: true,
      delayProbability: 0,
      riskLevel: "Low",
      explanation: "ML service unavailable",
      features: mlFeatures,
      modelVersion: "fallback"
    });
    }
}

exports.createShipment = async(req, res) => {
    try{
        const {
            origin,
            destination,
            priority,
            weight,
            packageType,
            instructions,
            constraints,
            pickupDate,
            timeWindow
            } = req.body;

        if(!origin || !destination || !priority){
            throw new Error("Origin, destination and priority are required");
        }

        const routeData = await getRoute(origin, destination);
        const weatherData = await getWeather(origin.lat, origin.lng);

        const createdAt = new Date().toISOString();
        const timeOfDay = new Date(createdAt).getHours();

        const tempEta = new Date(Date.now() + (routeData?.durationMin || 0) * 60000);
        const eventData = calculateEventImpact(
        origin,
        destination,
        tempEta
        );

        let hoursUntilEvent = 24;
        if (eventData.externalEvents.length > 0) {
        const eventTime = new Date(eventData.externalEvents[0].time);
        const shipmentETA = new Date(tempEta);

        hoursUntilEvent = Math.abs(
            (eventTime - shipmentETA) / (1000 * 60 * 60)
        );
        }

        const mlFeatures = {
            distanceKm: routeData?.distanceKm || 0,
            trafficDurationMin: routeData?.durationMin || 0,
            weatherSeverity: weatherData?.weatherSeverity || 2,
            timeOfDay,
            historicalDelayAvg: 0,
            eventImpactScore: eventData.eventImpactScore,
            hoursUntilEvent: hoursUntilEvent
        };
        const prediction = await predictShipmentDelay(mlFeatures);
        const eta = buildEta(
            routeData?.durationMin,
            prediction.delayProbability,
            createdAt
            );
        

        let enhancedExplanation = prediction.explanation;

        if (eventData.externalEvents.length > 0) {
        const event = eventData.externalEvents[0];

        enhancedExplanation += ` Likely delay due to ${event.type} event (${event.name}) around ${event.time}.`;
        }

        const shipmentData = {
            origin,
            destination,
            priority,

            status: "pending",

            distanceKm: routeData?.distanceKm || null,
            baseDurationMin: routeData?.durationMin || null,
            trafficDurationMin: routeData?.durationMin || null,
            routePolyline: routeData?.routePolyline || "",
            alternateRoutes: routeData?.alternateRoutes || [],
            hoursUntilEvent: hoursUntilEvent,

            weatherCondition: weatherData?.weatherCondition || "Unknown",
            weatherSeverity: weatherData?.weatherSeverity || 2,

            trafficLevel: getTrafficLevel(routeData?.distanceKm, routeData?.durationMin),

            delayProbability: prediction.delayProbability,
            riskLevel: prediction.riskLevel,
            eta: eta,

            eventImpactScore : eventData.eventImpactScore,
            externalEvents : eventData.externalEvents,

            cascadeAffected: [],
            aiExplanation: enhancedExplanation,
            mlFeatures: prediction.features,
            modelVersion: prediction.modelVersion,

            weight: weight || null,
            packageType: packageType || "",
            instructions: instructions || "",
            constraints: constraints || [],
            pickupDate: pickupDate || null,
            timeWindow: timeWindow || "",

            createdAt,
            updatedAt: new Date().toISOString()
    };
    const savedShipment = await createShipment(shipmentData);
        res.status(201).json(savedShipment);
        
    }catch(err){
        console.error("Error creating shipment:", err);
        res.status(500).json({ error: err.message });
    }
}

exports.getAllShipments = async(req, res) => {
    try{
        const shipments = await getAllShipments();
        res.json(shipments);


    }catch(err){
        console.error("Error fetching shipments:", err);
        res.status(500).json({ error: err.message });
    }
}

exports.getShipmentById = async(req, res) => {
    try{
        const { id }  = req.params;
        if(!id){
            throw new Error("Shipment ID is required");
        }

        const shipment = await getShipmentById(id);
        if(!shipment){
            throw new Error("Shipment not found");
        }
        res.json(shipment);

    }catch(err){
        res.status(404).json({ error: "Shipment not found" })
    }
}

exports.updateShipmentStatus = async(req, res) => {
    try{
        const { id }  = req.params;

        const { status } = req.body;

        if(!id || !status){
            throw new Error("Shipment ID and status are required");
        }

        if(!["pending", "in_transit", "delivered", "cancelled"].includes(status)){
            throw new Error("Invalid status");
        }

        const updateData = {
            status,
            updatedAt: new Date(),
        }
        const response = await updateShipment(id, updateData);

        res.json(response);

    }catch(err){
        res.status(404).json({ error: err.message });
    }
}
