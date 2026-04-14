const validate_shipment = (req, res, next) => {
    try {
        const { origin, destination, priority } = req.body;

     
        if (!origin || !destination || !priority) {
            return res.status(400).json({
                error: "Missing required fields: origin, destination, priority"
            });
        }


        if (!["high", "medium", "low"].includes(priority)) {
            return res.status(400).json({
                error: "Invalid priority value. Must be 'high', 'medium', or 'low'"
            });
        }

       
        if (
            typeof origin.lat !== "number" ||
            typeof origin.lng !== "number" ||
            typeof destination.lat !== "number" ||
            typeof destination.lng !== "number"
        ) {
            return res.status(400).json({
                error: "Origin and destination lat and lng must be numbers"
            });
        }

        next();

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

const validate_maps = (req, res, next) => {
    try {
        const { origin, destination } = req.body;

     
        if (!origin || !destination) {
            return res.status(400).json({
                error: "Missing required fields: origin, destination"
            });
        }

       
        if (
            typeof origin.lat !== "number" ||
            typeof origin.lng !== "number" ||
            typeof destination.lat !== "number" ||
            typeof destination.lng !== "number"
        ) {
            return res.status(400).json({
                error: "Origin and destination lat and lng must be numbers"
            });
        }

        next();

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

const validate_prediction = (req, res, next) => {
    try {
        const requiredFields = [
            "distanceKm",
            "trafficDurationMin",
            "weatherSeverity",
            "timeOfDay",
            "historicalDelayAvg"
        ];

        const missingFields = requiredFields.filter(
            (field) => req.body[field] === undefined || req.body[field] === null
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(", ")}`
            });
        }

        const invalidField = requiredFields.find((field) => {
            const value = Number(req.body[field]);
            return Number.isNaN(value);
        });

        if (invalidField) {
            return res.status(400).json({
                error: `${invalidField} must be numeric`
            });
        }

        if (req.body.weight && typeof req.body.weight !== "number") {
            throw new Error("Weight must be a number");
        }

        if (req.body.packageType && typeof req.body.packageType !== "string") {
            throw new Error("Invalid package type");
        }

        if (req.body.constraints && !Array.isArray(req.body.constraints)) {
            throw new Error("Constraints must be an array");
        }

        next();

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {validate_shipment, validate_maps, validate_prediction};
