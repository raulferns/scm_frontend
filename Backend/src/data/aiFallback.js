const FALLBACK_RESPONSES = [
  {
    keywords: ["risk", "high risk", "danger"],
    answer: "High-risk shipments are typically those with high delay probability, heavy traffic, or nearby disruptive events such as rallies or festivals."
  },
  {
    keywords: ["delay", "late", "why delayed"],
    answer: "Delays are usually caused by traffic congestion, weather conditions, or external events like rallies or matches affecting routes."
  },
  {
    keywords: ["route", "which route", "avoid"],
    answer: "Routes passing through high-traffic zones or near major events should be avoided. Alternative routes with lower congestion are recommended."
  },
  {
    keywords: ["weather"],
    answer: "Weather conditions such as rain or haze can increase delay probability and impact shipment reliability."
  },
  {
    keywords: ["event", "rally", "festival", "match"],
    answer: "External events like political rallies, festivals, or cricket matches can significantly impact traffic and delay shipments."
  },
  {
    keywords: ["optimize", "improve"],
    answer: "You can optimize shipments by avoiding peak hours, selecting alternate routes, and accounting for external disruptions in advance."
  },
  {
    keywords: ["shipment", "status"],
    answer: "You can view shipment status, risk level, ETA, and influencing factors directly on the dashboard."
  }
];

const DEFAULT_RESPONSE =
  "Based on current logistics data, shipments may be impacted by traffic, weather, or external events. Monitoring risk levels helps optimize delivery decisions.";

function getFallbackResponse(question) {
  const q = question.toLowerCase();

  for (const item of FALLBACK_RESPONSES) {
    if (item.keywords.some(k => q.includes(k))) {
      return item.answer;
    }
  }

  return DEFAULT_RESPONSE;
}

module.exports = { getFallbackResponse };