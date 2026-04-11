async function getRoute(origin, destination) {
    try {
        const url = `http://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&alternatives=true&geometries=polyline`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch route data from OSRM");
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            throw new Error("No routes found between the specified origin and destination.");
        }

        const mainRoute = data.routes[0];

        const distanceKm = mainRoute.distance / 1000;
        const durationMin = mainRoute.duration / 60;
        const polyline = mainRoute.geometry;
        const alternates = data.routes.slice(1).map(route => ({
            polyline: route.geometry,
            durationMin: route.duration / 60
        }));

        return {
            distanceKm,
            durationMin,
            routePolyline: polyline,
            alternateRoutes: alternates
        };

    } catch (err) {
        console.error("Error fetching maps data:", err);
        return null;
    }
}

module.exports = { getRoute };