const url = "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live";

const options = {
  method: "GET",
  headers: {
    "x-rapidapi-key": process.env.RAPID_API_KEY,
    "x-rapidapi-host": "crickbuzz-official-apis.p.rapidapi.com"
  }
};

async function fetchCricketMatches() {
  try {
    const response = await fetch(url, options);
    console.log("STATUS:", response.status);

    const text = await response.text();
    console.log("RAW RESPONSE:", text);

    if (!response.ok) {
      throw new Error("Failed to fetch cricket matches");
    }

    const data = await response.json();

    const matches = [];

    data.typeMatches?.forEach(type => {
      type.seriesMatches?.forEach(series => {
        series.seriesAdWrapper?.matches?.forEach(match => {
          matches.push({
            name: `${match.matchInfo?.team1?.teamName} vs ${match.matchInfo?.team2?.teamName}`,
            venue: match.matchInfo?.venueInfo?.ground,
            city: match.matchInfo?.venueInfo?.city,
            startTime: match.matchInfo?.startDate
          });
        });
      });
    });

    return matches;

  } catch (err) {
    console.error("fetchCricketMatches error:", err.message);
    return [];
  }
}

module.exports = {
  fetchCricketMatches
};