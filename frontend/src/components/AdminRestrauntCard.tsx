import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BiCheckCircle, BiLoader, BiMapPin, BiPhone } from "react-icons/bi";
import { aminService } from "../main";

function AdminRestrauntCard({
  restaurant,
  onVerify,
}: {
  restaurant: any;
  onVerify: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const verify = async () => {
    try {
      setStatus("loading");
      await axios.patch(
        `${aminService}/api/v1/verify/restaurant/${restaurant._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStatus("success");
      toast.success("Restaurant verified");
      setTimeout(() => {
        onVerify();
      }, 700);
    } catch (error) {
      setStatus("idle");
      toast.error("Failed to verify restaurant");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_10px_25px_rgba(226,55,68,0.12)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={restaurant.image}
          className="h-full w-full object-cover"
          alt={restaurant.name}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/0 to-black/0" />
        <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-brand backdrop-blur-sm">
          PENDING
        </span>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-bold text-gray-900 dark:text-white">{restaurant.name}</h3>
        <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <BiPhone className="h-4 w-4 shrink-0 text-brand" />
          {restaurant.phone}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <BiMapPin className="h-4 w-4 shrink-0 text-brand" />
          <span className="truncate">{restaurant.autoLocation?.formattedAddress}</span>
        </p>

        <motion.button
          whileHover={status === "idle" ? { scale: 1.02 } : {}}
          whileTap={status === "idle" ? { scale: 0.97 } : {}}
          disabled={status !== "idle"}
          onClick={verify}
          className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed ${
            status === "success" ? "bg-green-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {status === "loading" && (
            <>
              <BiLoader className="h-4 w-4 animate-spin" /> Verifying...
            </>
          )}
          {status === "success" && (
            <>
              <BiCheckCircle className="h-4 w-4" /> Verified
            </>
          )}
          {status === "idle" && "Verify Restaurant"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default AdminRestrauntCard;
