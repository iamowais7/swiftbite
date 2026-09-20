import axios from "axios";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { restaurantService } from "../main";
import OrderCard from "./OrderCard";
import { useSocket } from "../context/SocketContext";
import type { IOrder } from "../types";
import { useSound } from "../hooks/useSound";
import { BiBell, BiVolumeFull } from "react-icons/bi";

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
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  const activeOrders    = orders.filter((o) =>  ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Sound permission banner */}
      <AnimatePresence mode="wait">
        {!audioUnlocked ? (
          <motion.div
            key="unlock"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm">
                <BiBell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Enable Sound Notifications</p>
                <p className="text-xs text-gray-500">Get notified when new orders arrive</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={unlockAudio}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            >
              Enable Sound
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-sm font-medium text-green-600"
          >
            <BiVolumeFull className="h-4 w-4" /> Sound notifications enabled
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Active Orders</h3>
        {activeOrders.length === 0 ? (
          <p className="text-sm text-gray-400">No active orders</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
              >
                <OrderCard order={order} onStatusUpdate={fetchOrders} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Completed Orders</h3>
        {completedOrders.length === 0 ? (
          <p className="text-sm text-gray-400">No completed orders</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {completedOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
              >
                <OrderCard order={order} onStatusUpdate={fetchOrders} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default RestaurnatOrders;
