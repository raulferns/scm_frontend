export async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch location data");
  }

  const data = await res.json();

  if (!data || data.length === 0) {
    throw new Error("Address not found");
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}