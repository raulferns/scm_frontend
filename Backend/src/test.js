const { fetchCricketMatches } = require("./services/eventCalendarService");

(async () => {
  const matches = await fetchCricketMatches();
  console.log(matches);
})();