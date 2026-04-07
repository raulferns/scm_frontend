import { Fragment, useEffect, useMemo } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const center = [20.5937, 78.9629];
const containerStyle = { width: "100%", height: "400px" };
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

export default function ShipmentMap({ shipments }) {
  const routes = useMemo(
    () =>
      (shipments ?? []).map((shipment, index) => {
        const origin = toLatLng(shipment.origin);
        const destination = toLatLng(shipment.destination);
        const midLat = (origin[0] + destination[0]) / 2;
        const midLng = (origin[1] + destination[1]) / 2;
        const altRoutes =
          shipment.riskLevel === "High"
            ? [
                [origin, [midLat + 2, midLng - 2], destination],
                [origin, [midLat - 2, midLng + 2], destination],
              ]
            : [];

        return {
          key: shipment.id ?? shipment.shipmentId ?? index,
          origin,
          mainRoute: [origin, destination],
          altRoutes,
          riskLevel: shipment.riskLevel,
          color: getRiskColor(shipment.riskLevel),
        };
      }),
    [shipments],
  );

  return (
    <MapContainer center={center} zoom={5} scrollWheelZoom={false} style={containerStyle}>
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
