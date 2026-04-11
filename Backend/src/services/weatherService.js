const getWeather = async (lat, lng) => {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();

        const weatherCondition = data.weather?.[0]?.main || "Unknown";
        const severityMap = {
            Clear: 0,
            Clouds: 1,
            Drizzle: 2,
            Rain: 4,
            Thunderstorm: 7,
            Snow: 5,
            Fog: 3
        };

        const baseSeverity = severityMap[weatherCondition] ?? 2;
        const rainVolume = data.rain?.["1h"] || 0;
        const rainBonus = Math.min(rainVolume / 5, 3);

        const weatherSeverity = Math.min(baseSeverity + rainBonus, 10);

        return {
            weatherCondition,
            weatherSeverity
        };

    } catch (err) {
        console.error("Weather API Error:", err.message);

        return {
            weatherCondition: "Unknown",
            weatherSeverity: 2
        };
    }
};

module.exports = { getWeather };