import { Fragment, useEffect, useMemo } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import polyline from "@mapbox/polyline";

const center = [20.5937, 78.9629];
const containerStyle = { width: "100%", height: "400px" };

// ── ADDITION: Define the moving truck icon ──────────────────
const movingTruckIcon = divIcon({
  className: "",
  html: `<div style="font-size: 24px; filter: drop-shadow(0 0 2px white); cursor: pointer;">🚚</div>`,
  iconAnchor: [12, 12],
});

const riskColors = {
  High: "#ef4444",
  Medium: "#eab308",
  Low: "#22c55e",
};

const makeMarkerIcon = (color) =>
  divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(15,23,42,.25);"></span>`,
    iconAnchor: [8, 8],
    iconSize: [16, 16],
  });

const markerIcons = {
  High: makeMarkerIcon(riskColors.High),
  Medium: makeMarkerIcon(riskColors.Medium),
  Low: makeMarkerIcon(riskColors.Low),
};

const toCoordinate = (value, fallback) => {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : fallback;
};

const toLatLng = (point) => [
  toCoordinate(point?.lat, center[0]),
  toCoordinate(point?.lng, center[1]),
];

const getRiskColor = (riskLevel) => riskColors[riskLevel] ?? riskColors.Low;
const getRiskIcon = (riskLevel) => markerIcons[riskLevel] ?? markerIcons.Low;

function MapBounds({ routes }) {
  const map = useMap();

  useEffect(() => {
    const points = routes.flatMap((route) => [
      ...route.mainRoute,
      ...route.altRoutes.flat(),
    ]);

    if (points.length === 0) {
      map.setView(center, 5);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 6);
      return;
    }

    map.fitBounds(points, { padding: [32, 32], maxZoom: 7 });
  }, [map, routes]);

  return null;
}

export default function ShipmentMap({ shipments, livePosition }) {
  const routes = useMemo(
    () =>
      (shipments ?? []).map((shipment, index) => {
        // ── ADDITION: Fixed logic for polyline decoding ──────
        let mainRoute = [];
        const originPoint = toLatLng(shipment.origin);
        const destinationPoint = toLatLng(shipment.destination);

        if (shipment.routePolyline) {
          mainRoute = polyline.decode(shipment.routePolyline);
        } else {
          mainRoute = [originPoint, destinationPoint];
        }

        const origin = mainRoute[0];
        const midLat = (originPoint[0] + destinationPoint[0]) / 2;
        const midLng = (originPoint[1] + destinationPoint[1]) / 2;
        
        const altRoutes =
          shipment.riskLevel === "High"
            ? [
                [originPoint, [midLat + 2, midLng - 2], destinationPoint],
                [originPoint, [midLat - 2, midLng + 2], destinationPoint],
              ]
            : [];

        return {
          key: shipment.id ?? shipment.shipmentId ?? index,
          origin,
          mainRoute, // ── CORRECTED: Now using the array from polyline
          altRoutes,
          riskLevel: shipment.riskLevel,
          color: getRiskColor(shipment.riskLevel),
        };
      }),
    [shipments],
  );

  return (
    <MapContainer center={center} zoom={5} scrollWheelZoom={true} touchZoom={true} style={containerStyle}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds routes={routes} />

      {routes.map((route) => (
        <Fragment key={route.key}>
          <Marker position={route.origin} icon={getRiskIcon(route.riskLevel)} />
          <Polyline
            pathOptions={{ color: route.color, opacity: 0.9, weight: 4 }}
            positions={route.mainRoute}
          />
          
          {/* ── ADDITION: Render the moving marker ───────────── */}
          {livePosition && (
            <Marker position={livePosition} icon={movingTruckIcon} />
          )}

          {route.altRoutes.map((altRoute, index) => (
            <Polyline
              key={`${route.key}-alt-${index}`}
              pathOptions={{ color: "#3b82f6", opacity: 0.6, weight: 3 }}
              positions={altRoute}
            />
          ))}
        </Fragment>
      ))}
    </MapContainer>
  );
}