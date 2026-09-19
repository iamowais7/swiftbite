import { useEffect, useState } from "react";
import axios from "axios";
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
        <p className="text-gray-500">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="flex gap-4">
        <button
          onClick={() => setTab("restaurant")}
          className={`px-4 py-2 rounded ${
            tab === "restaurant" ? "bg-[#E23744] text-white" : "bg-gray-200"
          }`}
        >
          Restaurant
        </button>
        <button
          onClick={() => setTab("rider")}
          className={`px-4 py-2 rounded ${
            tab === "rider" ? "bg-[#E23744] text-white" : "bg-gray-200"
          }`}
        >
          Rider
        </button>
      </div>
      {tab === "restaurant" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {restaurants.length === 0 ? (
            <p>No pending restaurants</p>
          ) : (
            restaurants.map((r) => (
              <AdminRestrauntCard key={r._id} restaurant={r} onVerify={fetchData} />
            ))
          )}
        </div>
      )}
      {tab === "rider" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {riders.length === 0 ? (
            <p>No pending riders</p>
          ) : (
            riders.map((r) => (
              <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;
