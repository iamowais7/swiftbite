import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { restaurantService } from "../main";
import axios from "axios";
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
  placed:           "bg-yellow-100 text-yellow-700",
  accepted:         "bg-orange-100 text-orange-700",
  preparing:        "bg-blue-100 text-blue-700",
  ready_for_rider:  "bg-indigo-100 text-indigo-700",
  rider_assigned:   "bg-purple-100 text-purple-700",
  picked_up:        "bg-pink-100 text-pink-700",
  delivered:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-600",
};

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-400">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="text-5xl">🍽️</span>
        <p className="text-gray-500 font-medium">No orders yet</p>
        <p className="text-sm text-gray-400">Your order history will appear here</p>
      </div>
    );
  }

  const activeOrders    = orders.filter((o) =>  ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {activeOrders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">🟢 Active Orders</h2>
          {activeOrders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              statusLabel={statusLabel}
              statusColor={statusColor}
              onClick={() => navigate(`/order/${order._id}`)}
            />
          ))}
        </section>
      )}

      {completedOrders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">✅ Past Orders</h2>
          {completedOrders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              statusLabel={statusLabel}
              statusColor={statusColor}
              onClick={() => navigate(`/order/${order._id}`)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default Orders;

const OrderRow = ({
  order, onClick, statusLabel, statusColor,
}: {
  order: IOrder;
  onClick: () => void;
  statusLabel: Record<string, string>;
  statusColor: Record<string, string>;
}) => (
  <div
    className="cursor-pointer rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition"
    onClick={onClick}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-semibold text-gray-800">
          Order #{order._id.slice(-6).toUpperCase()}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {order.restaurantName}
        </p>
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColor[order.status] ?? "bg-gray-100 text-gray-600"}`}>
        {statusLabel[order.status] ?? order.status}
      </span>
    </div>
    <div className="mt-2 text-sm text-gray-500">
      {order.items.slice(0, 3).map((item, i) => (
        <span key={i}>
          {item.name} ×{item.quantity}
          {i < Math.min(order.items.length, 3) - 1 && ", "}
        </span>
      ))}
      {order.items.length > 3 && ` +${order.items.length - 3} more`}
    </div>
    <div className="mt-2 flex justify-between text-sm font-semibold">
      <span className="text-gray-500">Total</span>
      <span className="text-[#E23744]">₹{order.totalAmount}</span>
    </div>
  </div>
);
