import type { IOrder } from "../types";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import axios from "axios";
import { realtimeService } from "../main";
import ErrorBoundary from "./ErrorBoundary";

const riderIcon = new L.DivIcon({ html: "🛵", iconSize: [30, 30], className: "" });
const deliveryIcon = new L.DivIcon({ html: "🎁", iconSize: [30, 30], className: "" });

interface RoutingProps {
  from: [number, number];
  to: [number, number];
}

const Routing = ({ from, to }: RoutingProps) => {
  const map = useMap();
  useEffect(() => {
    // Guard: leaflet-routing-machine may not have attached to L → don't crash
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

interface Props {
  order: IOrder;
}

function RiderOrderMap({ order }: Props) {
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

  const userId = order?.userId;
  const dLat = order?.deliveryAddress?.latitude;
  const dLng = order?.deliveryAddress?.longitude;

  useEffect(() => {
    if (!navigator.geolocation) return;
    const fetchLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;
          setRiderLocation([latitude, longitude]);
          try {
            await axios.post(
              `${realtimeService}/api/v1/internal/emit`,
              {
                event: "rider:location",
                room: `user:${userId}`,
                payload: { latitude, longitude },
              },
              { headers: { "x-internal-key": import.meta.env.VITE_INTERNAL_SERVICE_KEY } }
            );
          } catch (err) {
            console.log("Emit error:", err);
          }
        },
        (err) => console.log("Location Error:", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    };
    fetchLocation();
    const interval = setInterval(fetchLocation, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  // Guard against missing delivery coordinates
  if (dLat == null || dLng == null) {
    return (
      <div className="rounded-xl bg-white shadow-sm p-4 text-sm text-gray-500 text-center">
        📍 Delivery location not available for this order.
      </div>
    );
  }

  if (!riderLocation) {
    return (
      <div className="rounded-xl bg-white shadow-sm p-4 text-sm text-gray-500 text-center">
        📡 Getting your location… (allow location access)
      </div>
    );
  }

  const deliveryLocation: [number, number] = [dLat, dLng];

  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-xl bg-white shadow-sm p-4 text-sm text-gray-500 text-center">
          🗺️ Map could not load, but your order is active.
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
            <Popup>You (Rider)</Popup>
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

export default RiderOrderMap;
