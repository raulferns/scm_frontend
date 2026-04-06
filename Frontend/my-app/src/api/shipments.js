export async function createShipment(payload) {
  const res = await fetch("/api/v1/shipments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) throw new Error("Failed to create shipment");
  return res.json();
}