import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { motion } from "framer-motion";
import { BiCheck } from "react-icons/bi";
import { riderService } from "../main";
import { useSound } from "../hooks/useSound";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const { play } = useSound();

  // Play alert when request first appears
  useEffect(() => {
    play("new-order");
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    setAccepting(true);
    try {
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      play("order-accepted");
      toast.success("Order Accepted!");
      onAccepted();
    } catch (error: any) {
      play("error-alert");
      toast.error(error?.response?.data?.message || "Failed to accept order");
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };

  const pct = (secondsLeft / 10) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: [
          "0 2px 10px rgba(34,197,94,0.15)",
          "0 10px 28px rgba(34,197,94,0.35)",
          "0 2px 10px rgba(34,197,94,0.15)",
        ],
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        opacity: { duration: 0.3 },
        y: { duration: 0.3 },
        scale: { duration: 0.3 },
        boxShadow: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
      }}
      className="space-y-3 rounded-2xl border-2 border-green-400 bg-white p-4"
    >
      {/* Timer bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "linear" }}
          className="h-full rounded-full bg-green-500"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-bold text-green-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          New Delivery Request
        </p>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${secondsLeft <= 3 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
          {secondsLeft}s
        </span>
      </div>

      <p className="text-xs text-gray-500">
        Order ID: <span className="font-semibold text-gray-700">#{orderId.slice(-6).toUpperCase()}</span>
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        disabled={accepting}
        onClick={acceptOrder}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
      >
        {accepting ? (
          "Accepting..."
        ) : (
          <>
            <BiCheck className="h-4.5 w-4.5" />
            Accept Order
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default RiderOrderRequest;
