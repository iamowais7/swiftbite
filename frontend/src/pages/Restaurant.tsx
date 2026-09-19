import { useEffect, useState } from 'react'
import type { IMenuItem, IRestaurant } from "../types"
import axios from 'axios';
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
        <p className="text-gray-500">Loading your restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
      <ResaurantProfile
        restaurant={restaurant}
        onUpdate={(updated) => setRestaurant(updated)}
        isSeller={true}
      />

      <RestaurnatOrders restaurantId={restaurant._id} />

      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex border-b">
          {[
            { key: "menu",     label: "Menu Items" },
            { key: "add-item", label: "Add Item"   },
            { key: "sales",    label: "Sales"      },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as SellerTab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                tab === t.key
                  ? "border-b-2 border-[#E23744] text-[#E23744]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-5">
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
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">📊</p>
              <p>Sales analytics coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Restaurant;
