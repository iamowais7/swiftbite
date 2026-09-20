import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BiStore, BiCycling } from "react-icons/bi";
import AdminRestrauntCard from "../components/AdminRestrauntCard";
import RiderAdmin from "../components/RiderAdmin";
import { aminService } from "../main";

function Admin() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurant" | "rider">("restaurant");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${aminService}/api/v1/admin/restaurant/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const response = await axios.get(
        `${aminService}/api/v1/admin/rider/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // backend returns key "restauraunts" (misspelled) — read it defensively
      setRestaurants(data.restauraunts || data.Restaurants || data.restaurants || []);
      setRiders(response.data.riders || []);
    } catch (error) {
      console.log(error);
      setRestaurants([]);
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading admin panel...</p>
      </div>
    );
  }

  const tabs = [
    { key: "restaurant" as const, label: "Restaurants", icon: BiStore, count: restaurants.length },
    { key: "rider" as const, label: "Riders", icon: BiCycling, count: riders.length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-6xl space-y-6 px-6 py-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review and verify pending restaurants and riders on SwiftBite AI
        </p>
      </div>

      {/* Pill tab switcher */}
      <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active ? "text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-tab-pill"
                  className="absolute inset-0 rounded-full bg-brand shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <Icon className="h-4 w-4" />
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    active ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {t.count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {tab === "restaurant" ? (
          <motion.div
            key="restaurant"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {restaurants.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
                  <BiStore className="h-8 w-8 text-brand" />
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">No pending restaurants</p>
                <p className="max-w-xs text-sm text-gray-400 dark:text-gray-500">
                  New restaurant signups will show up here for review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((r, i) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                  >
                    <AdminRestrauntCard restaurant={r} onVerify={fetchData} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="rider"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {riders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
                  <BiCycling className="h-8 w-8 text-brand" />
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">No pending riders</p>
                <p className="max-w-xs text-sm text-gray-400 dark:text-gray-500">
                  New rider applications will show up here for review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {riders.map((r, i) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                  >
                    <RiderAdmin rider={r} onVerify={fetchData} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Admin;
