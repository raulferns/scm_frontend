import { BASE_URL } from "./base";

export async function predictShipmentRisk(payload) {
  let res;

  try {
    res = await fetch(`${BASE_URL}/api/v1/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(
      "Could not reach backend prediction API. Ensure backend is running."
    );
  }

  const text = await res.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(
      data.error ||
        text ||
        `Prediction request failed with status ${res.status}`
    );
  }

  return data;
}