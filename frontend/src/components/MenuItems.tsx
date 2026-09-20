import axios from "axios";
import type { IMenuItem } from "../types";
import { BiLoader, BiTrash } from "react-icons/bi";
import { BsEye, BsEyeSlash, BsCart } from "react-icons/bs";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAppData } from "../context/AppContext";
import { useSound } from "../hooks/useSound";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

function MenuItems({ items, onItemDeleted, isSeller }: MenuItemsProps) {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const { play } = useSound();

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this item");
    if (!confirm) return;
    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Item deleted");
      onItemDeleted();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const toggleAvailability = async (itemId: string) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const { fetchCart } = useAppData();
  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);
      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        { restaurantId, itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      play("add-to-cart");
      toast.success(data.message);
      fetchCart();
    } catch (error: any) {
      play("error-alert");
      toast.error(error.response.data.message);
    } finally {
      setLoadingItemId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-gray-400">No items to show</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item, i) => {
        const isLoading = loadingItemId === item._id;
        return (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }}
            whileHover={{ y: -3 }}
            className={`relative flex gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_10px_25px_rgba(226,55,68,0.12)] ${
              !item.isAvailable ? "opacity-70" : ""
            }`}
          >
            <div className="relative shrink-0">
              <img
                src={item.image}
                alt=""
                className={`h-20 w-20 rounded-xl object-cover ${
                  !item.isAvailable ? "grayscale brightness-75" : ""
                }`}
              />
              {!item.isAvailable && (
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 text-[10px] font-semibold text-white">
                  Not Available
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-bold text-brand">₹{item.price}</p>
                {isSeller && (
                  <div className="flex gap-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleAvailability(item._id)}
                      className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                    >
                      {item.isAvailable ? (
                        <BsEye size={18} />
                      ) : (
                        <BsEyeSlash size={18} />
                      )}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(item._id)}
                      className="rounded-lg p-2 text-brand hover:bg-brand/10"
                    >
                      <BiTrash size={18} />
                    </motion.button>
                  </div>
                )}
                {!isSeller && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={item.isAvailable ? { scale: 1.08 } : {}}
                    disabled={!item.isAvailable || isLoading}
                    onClick={() => addToCart(item.restaurantId, item._id)}
                    className={`flex items-center justify-center rounded-lg p-2 ${
                      !item.isAvailable || isLoading
                        ? "cursor-not-allowed text-gray-400"
                        : "text-brand hover:bg-brand/10"
                    }`}
                  >
                    {isLoading ? (
                      <BiLoader size={18} className="animate-spin" />
                    ) : (
                      <BsCart size={18} />
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default MenuItems;
