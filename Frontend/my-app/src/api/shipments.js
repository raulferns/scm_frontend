import { BASE_URL } from "./base";

export async function getShipments() {
  const res = await fetch(`${BASE_URL}/api/v1/shipments`);

  if (!res.ok) {
    throw new Error("Failed to fetch shipments");
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.shipments || [];
}

export async function createShipment(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/shipments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create shipment");
  }

  return res.json();
}