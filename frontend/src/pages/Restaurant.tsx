import { useEffect, useState } from 'react'
import type { IMenuItem, IRestaurant } from "../types"
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { restaurantService } from '../main';
import AddRestaurant from '../components/AddRestaurant';
import ResaurantProfile from '../components/ResaurantProfile';
import MenuItems from '../components/MenuItems';
import AddMenuItem from '../components/AddMenuItem';
import RestaurnatOrders from '../components/RestaurnatOrders';
import { useAppData } from '../context/AppContext';

type SellerTab = "menu" | "add-item" | "sales";

function Restaurant() {
  const { refreshUser } = useAppData();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SellerTab>("menu");
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/restaurant/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setRestaurant(data.restaurant || null);

      // Backend returns a NEW token when restaurantId was missing from the old one.
      // FIX: instead of window.location.reload() (which causes login flash),
      //      store the token and refresh the user in context — no page reload needed.
      if (data.token) {
        localStorage.setItem("token", data.token);
        await refreshUser();   // re-syncs AppContext user (now has restaurantId)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyRestaurant(); }, []);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/item/all/${restaurantId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (restaurant?._id) fetchMenuItems(restaurant._id);
  }, [restaurant]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }

  const tabs: { key: SellerTab; label: string }[] = [
    { key: "menu",     label: "Menu Items" },
    { key: "add-item", label: "Add Item"   },
    { key: "sales",    label: "Sales"      },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 px-4 py-6 space-y-6"
    >
      <ResaurantProfile
        restaurant={restaurant}
        onUpdate={(updated) => setRestaurant(updated)}
        isSeller={true}
      />

      <RestaurnatOrders restaurantId={restaurant._id} />

      <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex gap-1 border-b border-gray-100 p-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "text-brand"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === t.key && (
                <motion.span
                  layoutId="seller-tab-pill"
                  className="absolute inset-0 rounded-xl bg-brand/10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {tab === "menu" && (
                <MenuItems
                  items={menuItems}
                  onItemDeleted={() => fetchMenuItems(restaurant._id)}
                  isSeller={true}
                />
              )}
              {tab === "add-item" && (
                <AddMenuItem onItemAdded={() => fetchMenuItems(restaurant._id)} />
              )}
              {tab === "sales" && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="font-semibold text-gray-700">Sales analytics coming soon</p>
                  <p className="max-w-xs text-sm text-gray-400">
                    Track your revenue and order trends right here once it's ready.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default Restaurant;
