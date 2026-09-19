import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { useEffect } from "react";
import ErrorBoundary from "./ErrorBoundary";

interface Props {
  riderLocation: [number, number];
  deliveryLocation: [number, number];
}

const riderIcon = new L.DivIcon({ html: "🛵", iconSize: [30, 30], className: "" });
const deliveryIcon = new L.DivIcon({ html: "🎁", iconSize: [30, 30], className: "" });

interface RoutingProps {
  from: [number, number];
  to: [number, number];
}

const Routing = ({ from, to }: RoutingProps) => {
  const map = useMap();
  useEffect(() => {
    const Routing = (L as any).Routing;
    if (!Routing || typeof Routing.control !== "function") {
      console.warn("leaflet-routing-machine not available — skipping route line");
      return;
    }
    let control: any;
    try {
      control = Routing.control({
        waypoints: [L.latLng(from), L.latLng(to)],
        lineOptions: { styles: [{ color: "#E23744", weight: 5 }] },
        addWaypoints: false,
        draggableWaypoints: false,
        show: false,
        fitSelectedRoutes: true,
        createMarker: () => null,
        router: Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
      }).addTo(map);
    } catch (err) {
      console.warn("Routing failed:", err);
    }
    return () => {
      try {
        if (control) map.removeControl(control);
      } catch {
        /* ignore */
      }
    };
  }, [from, to, map]);
  return null;
};

function UserOrderMap({ riderLocation, deliveryLocation }: Props) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-xl bg-white shadow-sm p-4 text-sm text-gray-500 text-center">
          🗺️ Map could not load.
        </div>
      }
    >
      <div className="rounded-xl bg-white shadow-sm p-3">
        <MapContainer center={riderLocation} zoom={14} className="h-80 w-full rounded-lg">
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={riderLocation} icon={riderIcon}>
            <Popup>Rider</Popup>
          </Marker>
          <Marker position={deliveryLocation} icon={deliveryIcon}>
            <Popup>Delivery Location</Popup>
          </Marker>
          <Routing from={riderLocation} to={deliveryLocation} />
        </MapContainer>
      </div>
    </ErrorBoundary>
  );
}

export default UserOrderMap;
