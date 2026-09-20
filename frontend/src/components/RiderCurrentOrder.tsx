import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BiPhoneCall } from "react-icons/bi";
import type { IOrder } from "../types";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

function RiderCurrentOrder({ order, onStatusUpdate }: Props) {
  const updateStatus = async () => {
    try {
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Order status updated");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const address = order?.deliveryAddress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
    >
      <h1 className="font-bold text-gray-900 dark:text-white">Current Order</h1>

      <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
        <p>
          <b className="font-semibold text-gray-800 dark:text-gray-100">Pickup:</b> {order.restaurantName}
        </p>

        <p>
          <b className="font-semibold text-gray-800 dark:text-gray-100">Drop:</b> {address?.formattedAddress ?? "—"}
        </p>

        <p>
          <b className="font-semibold text-gray-800 dark:text-gray-100">Total:</b> ₹{order.totalAmount}
        </p>

        <p>
          <b className="font-semibold text-gray-800 dark:text-gray-100">Your Earning:</b>{" "}
          <span className="font-bold text-brand">₹{order.riderAmount}</span>
        </p>

        <p className="flex items-center gap-1.5">
          <b className="font-semibold text-gray-800 dark:text-gray-100">Status:</b>
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand">
            {order.status.replace("_", " ")}
          </span>
        </p>
      </div>

      {address?.mobile && (
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/60">
          <div className="text-sm">
            <p className="text-gray-500 dark:text-gray-400">Customer Phone</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {address.mobile}
            </p>
          </div>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href={`tel:${address.mobile}`}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <BiPhoneCall className="h-4 w-4" />
            Call
          </motion.a>
        </div>
      )}

      <div className="space-y-2">
        {order.status === "rider_assigned" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={updateStatus}
            className="w-full rounded-xl bg-yellow-500 py-2.5 font-semibold text-white shadow-sm transition hover:bg-yellow-600"
          >
            Reached Restaurant
          </motion.button>
        )}

        {order.status === "picked_up" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={updateStatus}
            className="w-full rounded-xl bg-green-500 py-2.5 font-semibold text-white shadow-sm transition hover:bg-green-600"
          >
            Mark as Delivered
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default RiderCurrentOrder;
