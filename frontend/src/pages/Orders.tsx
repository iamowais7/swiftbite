import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import { restaurantService } from "../main";
import axios from "axios";
import type { IOrder } from "../types";
import { useSound } from "../hooks/useSound";
import { BiReceipt } from "react-icons/bi";
import { HiOutlineClock, HiOutlineCheckCircle } from "react-icons/hi2";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const statusLabel: Record<string, string> = {
  placed:           "Order Placed",
  accepted:         "Accepted",
  preparing:        "Preparing",
  ready_for_rider:  "Ready for Pickup",
  rider_assigned:   "Rider Assigned",
  picked_up:        "On the Way",
  delivered:        "Delivered ✓",
  cancelled:        "Cancelled",
};

const statusColor: Record<string, string> = {
  placed:           "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  accepted:         "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  preparing:        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ready_for_rider:  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  rider_assigned:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  picked_up:        "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  delivered:        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled:        "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

function SkeletonRow() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] space-y-3 dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="h-3 w-2/3 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      <div className="h-3 w-1/4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { play } = useSound();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = (payload: any) => {
      const status = payload?.status || payload?.order?.status;
      if (status === "delivered") play("order-delivered");
      else play("order-accepted");
      fetchOrders();
    };
    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);
    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <BiReceipt className="h-8 w-8 text-brand" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">No orders yet</p>
        <p className="max-w-xs text-sm text-gray-400 dark:text-gray-500">
          Your order history will appear here once you place your first order on SwiftBite AI.
        </p>
      </motion.div>
    );
  }

  const activeOrders    = orders.filter((o) =>  ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-3xl px-4 py-6 space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>

      {activeOrders.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-1.5 text-lg font-semibold text-gray-700 dark:text-gray-200">
            <HiOutlineClock className="h-5 w-5 text-brand" />
            Active Orders
          </h2>
          {activeOrders.map((order, i) => (
            <OrderRow
              key={order._id}
              order={order}
              index={i}
              statusLabel={statusLabel}
              statusColor={statusColor}
              onClick={() => navigate(`/order/${order._id}`)}
            />
          ))}
        </section>
      )}

      {completedOrders.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-1.5 text-lg font-semibold text-gray-700 dark:text-gray-200">
            <HiOutlineCheckCircle className="h-5 w-5 text-brand" />
            Past Orders
          </h2>
          {completedOrders.map((order, i) => (
            <OrderRow
              key={order._id}
              order={order}
              index={i}
              statusLabel={statusLabel}
              statusColor={statusColor}
              onClick={() => navigate(`/order/${order._id}`)}
            />
          ))}
        </section>
      )}
    </motion.div>
  );
}

export default Orders;

const OrderRow = ({
  order, onClick, statusLabel, statusColor, index,
}: {
  order: IOrder;
  onClick: () => void;
  statusLabel: Record<string, string>;
  statusColor: Record<string, string>;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.05 }}
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.98 }}
    className="cursor-pointer rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_10px_25px_rgba(226,55,68,0.12)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
    onClick={onClick}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Order #{order._id.slice(-6).toUpperCase()}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-500">
          {order.restaurantName}
        </p>
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColor[order.status] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
        {statusLabel[order.status] ?? order.status}
      </span>
    </div>
    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
      {order.items.slice(0, 3).map((item, i) => (
        <span key={i}>
          {item.name} ×{item.quantity}
          {i < Math.min(order.items.length, 3) - 1 && ", "}
        </span>
      ))}
      {order.items.length > 3 && ` +${order.items.length - 3} more`}
    </div>
    <div className="mt-2 flex justify-between text-sm font-semibold">
      <span className="text-gray-500 dark:text-gray-400">Total</span>
      <span className="text-brand">₹{order.totalAmount}</span>
    </div>
  </motion.div>
);
