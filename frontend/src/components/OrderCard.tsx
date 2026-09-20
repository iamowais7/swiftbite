import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { IOrder } from "../types";

interface Props {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const ORDER_ACTION: Record<string, string[]> = {
  placed: ["accepted"],
  accepted: ["preparing"],
  preparing: ["ready_for_rider"],
  ready_for_rider: [],
  rider_assigned: [],
  picked_up: [],
  delivered: [],
  cancelled: [],
};

const statusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "accepted":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "preparing":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "ready_for_rider":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
    case "picked_up":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "delivered":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

function OrderCard({ order, onStatusUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);

  const actions = ORDER_ACTION[order.status] || [];

  useEffect(() => {
    if (order.status !== "ready_for_rider") {
      setRetryVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [order.status]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      setRetryVisible(false);
      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Order updated");
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_10px_25px_rgba(226,55,68,0.12)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900 dark:text-white">Order #{order._id.slice(-6)}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
        {order.items.map((item, i) => (
          <p key={i}>
            {item.name} x {item.quantity}
          </p>
        ))}
      </div>
      <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white">
        <span>Total</span>
        <span>₹{order.totalAmount}</span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">Payment: {order.paymentStatus}</p>
      {order.paymentStatus === "paid" && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {actions.map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              onClick={() => updateStatus(status)}
              className="rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-50"
            >
              Mark as {status.replaceAll("_", " ")}
            </motion.button>
          ))}
        </div>
      )}
      {order.status === "ready_for_rider" && retryVisible && (
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-xl border border-brand py-2 text-xs font-semibold text-brand transition hover:bg-brand/10 disabled:opacity-50"
            onClick={() => updateStatus("ready_for_rider")}
          >
            Retry Ready for Rider
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default OrderCard;
