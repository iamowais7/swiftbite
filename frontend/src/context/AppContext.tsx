import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, restaurantService } from "../config";
import type { AppContextType, ICart, LocationData, User } from "../types";
import { Toaster } from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<ICart[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [quantity, setquantity] = useState(0);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching Location...");

  // Shared fetch — also used as refreshUser so components can re-sync after token change
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }
      const { data } = await axios.get(`${authService}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  // Exposed so Restaurant.tsx can call this after storing a new token
  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  async function fetchCart() {
    if (!user || user.role !== "customer") return;
    try {
      const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCart(data.cart || []);
      setSubTotal(data.subTotal);
      setquantity(data.cartLength);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => { fetchUser(); }, []);

  useEffect(() => {
    if (user && user.role === "customer") fetchCart();
  }, [user]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setLocation({ latitude, longitude, formattedAddress: data.display_name || "Current Location" });
          setCity(
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state_district ||
            data.address?.hamlet ||
            data.address?.municipality ||
            data.address?.county ||
            "Your Location"
          );
        } catch {
          setLocation({ latitude, longitude, formattedAddress: "Current Location" });
          setCity("Your Location");
        } finally {
          setLoadingLocation(false);
        }
      },
      () => setLoadingLocation(false)
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth, loading, setIsAuth, setLoading, setUser,
        user, location, loadingLocation, city,
        cart, fetchCart, refreshUser,
        quantity, subTotal,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppData must be used within AppProvider");
  return context;
};
