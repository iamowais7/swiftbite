import axios from "axios";
import { useEffect, useState } from "react";
import { restaurantService } from "../main";
import OrderCard from "./OrderCard";
import { useSocket } from "../context/SocketContext";
import type { IOrder } from "../types";
import { useSound } from "../hooks/useSound";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

function RestaurnatOrders({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const { socket } = useSocket();
  const { play } = useSound();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/restaurant/${restaurantId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [restaurantId]);

  // Rider assigned → order-accepted sound
  useEffect(() => {
    if (!socket) return;
    const onUpdateOrder = () => {
      if (audioUnlocked) play("order-accepted");
      fetchOrders();
    };
    socket.on("order:rider_assigned", onUpdateOrder);
    return () => { socket.off("order:rider_assigned", onUpdateOrder); };
  }, [socket, audioUnlocked]);

  // New order → new-order sound  🔔
  useEffect(() => {
    if (!socket) return;
    const onNewOrder = () => {
      if (audioUnlocked) play("new-order");
      fetchOrders();
    };
    socket.on("order:new", onNewOrder);
    return () => { socket.off("order:new", onNewOrder); };
  }, [socket, audioUnlocked]);

  // Order status update (accepted/preparing/ready)
  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = () => {
      if (audioUnlocked) play("order-accepted");
      fetchOrders();
    };
    socket.on("order:update", onOrderUpdate);
    return () => { socket.off("order:update", onOrderUpdate); };
  }, [socket, audioUnlocked]);

  const unlockAudio = () => {
    // Play silently to unblock autoplay policy
    const silent = new Audio("/sounds/add-to-cart.mp3");
    silent.volume = 0.01;
    silent.play().then(() => {
      silent.pause();
      setAudioUnlocked(true);
    }).catch(() => setAudioUnlocked(true));
  };

  if (loading) {
    return <p className="text-gray-500">Loading Orders…</p>;
  }

  const activeOrders    = orders.filter((o) =>  ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="space-y-6">
      {/* Sound permission banner */}
      {!audioUnlocked && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-medium text-blue-900">Enable Sound Notifications</p>
              <p className="text-sm text-blue-700">Get notified when new orders arrive</p>
            </div>
          </div>
          <button
            onClick={unlockAudio}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Enable Sound
          </button>
        </div>
      )}
      {audioUnlocked && (
        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <span>🔊</span> Sound notifications enabled
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Active Orders</h3>
        {activeOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No active orders</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Completed Orders</h3>
        {completedOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No completed orders</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedOrders.map((order) => (
              <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurnatOrders;
