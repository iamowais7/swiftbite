import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import { BiSearchAlt2 } from "react-icons/bi";
import type { IRestaurant } from "../types";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:bg-gray-900">
      <div className="h-40 w-full animate-pulse bg-gray-200 dark:bg-gray-800" />
      <div className="space-y-2 p-3.5">
        <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

function Home() {
  const { location, city } = useAppData();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  const showSkeletons = loading || !location;

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden bg-linear-to-br from-[#fff3f2] via-[#fff8f5] to-white px-4 py-10 dark:from-gray-900 dark:via-gray-950 dark:to-gray-950"
      >
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
            {search ? (
              <>
                Results for <span className="text-brand">"{search}"</span>
              </>
            ) : (
              <>
                Craving something good,{" "}
                <span className="text-brand">{city !== "Fetching Location..." ? city : "there"}</span>?
              </>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search
              ? `Showing the best matches near you`
              : "Great food, delivered fast — browse what's nearby"}
          </p>
        </div>
        {/* decorative blob */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {showSkeletons ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {restaurants.length > 0 ? (
              <motion.div
                key="grid"
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
              >
                {restaurants.map((res, i) => {
                  const [resLng, resLat] = res.autoLocation.coordinates;
                  const distance = getDistanceKm(
                    location!.latitude,
                    location!.longitude,
                    resLat,
                    resLng
                  );
                  return (
                    <motion.div
                      key={res._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05 }}
                    >
                      <RestaurantCard
                        id={res._id}
                        name={res.name}
                        image={res.image ?? ""}
                        distance={`${distance}`}
                        isOpen={res.isOpen}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-3 py-24 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
                  <BiSearchAlt2 className="h-8 w-8 text-brand" />
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">No restaurants found</p>
                <p className="max-w-xs text-sm text-gray-400 dark:text-gray-500">
                  Try a different search, or check back later as more restaurants join SwiftBite AI near you.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default Home;
