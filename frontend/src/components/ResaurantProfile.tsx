import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

interface Props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const ResaurantProfile = ({ restaurant, isSeller, onUpdate }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  const { setIsAuth, setUser } = useAppData();

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const logoutHandler = async () => {
    await axios.put(
      `${restaurantService}/api/restaurant/status`,
      { status: false },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      onUpdate(data.restaurant);
      toast.success(data.message);
      setEditMode(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-xl overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
    >
      {restaurant.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img src={restaurant.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/0 to-black/0" />
          <span
            className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm ${
              isOpen ? "bg-white/90 text-green-600" : "bg-black/70 text-white"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-green-500" : "bg-gray-300"}`} />
            {isOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>
      )}
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {editMode ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border px-3 py-1.5 text-lg font-bold outline-none focus:border-brand"
              />
            ) : (
              <h2 className="text-xl font-extrabold text-gray-900">{restaurant.name}</h2>
            )}
            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
              <BiMapPin className="h-4 w-4 shrink-0 text-brand" />
              <span className="truncate">{restaurant.autoLocation.formattedAddress || "Location unavailable"}</span>
            </div>
          </div>
          {isSeller && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditMode(!editMode)}
              className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand"
            >
              <BiEdit size={18} />
            </motion.button>
          )}
        </div>

        {editMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand"
          />
        ) : (
          <p className="text-sm text-gray-600">
            {restaurant.description || "No description added"}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t pt-4">
          {editMode && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={saveChanges}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:opacity-60"
            >
              <BiSave size={16} /> Save
            </motion.button>
          )}
          {isSeller && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleOpenStatus}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm ${
                isOpen ? "bg-gray-800 hover:bg-gray-900" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isOpen ? "Close Restaurant" : "Open Restaurant"}
            </motion.button>
          )}
          {isSeller && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={logoutHandler}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
            >
              Logout
            </motion.button>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Created on {new Date(restaurant.createdAt).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
};

export default ResaurantProfile;
