import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
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
    <div className="rounded-xl bg-white p-4 shadow-sm border-2 border-green-400 space-y-3 animate-pulse-once">
      {/* Timer bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-green-700">🚨 New Delivery Request</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${secondsLeft <= 3 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
          {secondsLeft}s
        </span>
      </div>

      <p className="text-xs text-gray-500">
        Order ID: <span className="font-semibold text-gray-700">#{orderId.slice(-6).toUpperCase()}</span>
      </p>

      <button
        disabled={accepting}
        onClick={acceptOrder}
        className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 active:scale-95 transition disabled:opacity-50"
      >
        {accepting ? "Accepting..." : "✓ Accept Order"}
      </button>
    </div>
  );
};

export default RiderOrderRequest;
