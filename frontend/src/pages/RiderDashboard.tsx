import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { BiUpload, BiCheckCircle, BiTimeFive, BiBell, BiVolumeFull } from "react-icons/bi";
import { useSocket } from "../context/SocketContext";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";
import RiderOrderRequest from "../components/RiderOrderRequest";
import type { IOrder } from "../types";
import { useSound } from "../hooks/useSound";

interface IRider {
  _id: string;
  picture: string;
  phoneNumber: string;
  aadhaarNumber: string;
  drivingLicenseNumber: string;
  isVerified: boolean;
  location: { type: "Point"; coordinates: [number, number] };
  isAvailable: boolean;
}

function RiderDashboard() {
  const { user, setUser, setIsAuth } = useAppData();
  const { socket } = useSocket();
  const { play } = useSound();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out successfully");
  };
  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const unlockAudio = async () => {
    try {
      // Play a silent sound to unlock browser autoplay policy
      const silent = new Audio("/sounds/add-to-cart.mp3");
      silent.volume = 0.01;
      await silent.play();
      silent.pause();
      setAudioUnlocked(true);
      toast.success("Sound notifications enabled!");
    } catch {
      // Even if it fails, mark unlocked so we attempt on next event
      setAudioUnlocked(true);
      toast.success("Sound notifications enabled!");
    }
  };

  // Incoming order available for rider
  useEffect(() => {
    if (!socket) return;
    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );
      if (audioUnlocked) play("new-order");
      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 10000);
    };
    socket.on("order:available", onOrderAvailable);
    return () => { socket.off("order:available", onOrderAvailable); };
  }, [socket, audioUnlocked]);

  // Order status updated (rider assigned, picked up, delivered)
  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = (payload: any) => {
      if (audioUnlocked) {
        const status = payload?.order?.status || payload?.status;
        if (status === "delivered") play("order-delivered");
        else play("order-accepted");
      }
      fetchCurrentOrder();
    };
    socket.on("order:rider_assigned", onOrderUpdate);
    socket.on("order:update", onOrderUpdate);
    return () => {
      socket.off("order:rider_assigned", onOrderUpdate);
      socket.off("order:update", onOrderUpdate);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProfile(data || null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") fetchProfile();
    else setLoading(false);
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/order/current`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCurrentOrder(data.order);
    } catch {
      setCurrentOrder(null);
    }
  };

  useEffect(() => { fetchCurrentOrder(); }, []);

  const toggleAvailability = async () => {
    if (!navigator.geolocation) { toast.error("Location Access required"); return; }
    setToggling(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle`,
          {
            isAvailable: !profile?.isAvailable,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success(profile?.isAvailable ? "You are offline" : "You are online");
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed");
      } finally {
        setToggling(false);
      }
    });
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!navigator.geolocation) { toast.error("Location Access required"); return; }
    setSubmitting(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("aadhaarNumber", aadhaarNumber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      formData.append("latitude", pos.coords.latitude.toString());
      formData.append("longitude", pos.coords.longitude.toString());
      if (image) formData.append("file", image);
      try {
        const { data } = await axios.post(`${riderService}/api/rider/new`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success(data.message);
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed");
      } finally {
        setSubmitting(false);
      }
    });
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500 dark:text-gray-400">
        You are not registered as a rider
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
        >
          <h1 className="text-xl font-extrabold text-brand">Add Your Rider Profile</h1>
          <input type="text" placeholder="Aadhaar Number" value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"/>
          <input type="text" placeholder="Phone Number" value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"/>
          <input type="text" placeholder="Driving Licence Number" value={drivingLicenseNumber}
            onChange={(e) => setDrivingLicenseNumber(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"/>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <BiUpload className="h-5 w-5 text-brand"/>
            {image ? image.name : "Upload your photo"}
            <input type="file" name="file" accept="image/*" hidden
              onChange={(e) => setImage(e.target.files?.[0] || null)}/>
          </label>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60"
            disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting..." : "Add Profile"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4 pb-10"
    >
      {/* Profile Card */}
      <div className="mx-auto max-w-md px-4 py-4">
        <div className="space-y-4 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
          <img src={profile.picture} className="mx-auto h-24 w-24 rounded-full border-4 border-brand object-cover"/>
          <div className="space-y-1 text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.phoneNumber}</p>
          </div>
          <div className="flex justify-center gap-2">
            <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${profile.isVerified ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
              {profile.isVerified ? <BiCheckCircle className="h-3.5 w-3.5" /> : <BiTimeFive className="h-3.5 w-3.5" />}
              {profile.isVerified ? "Verified" : "Pending"}
            </span>
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${profile.isAvailable ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${profile.isAvailable ? "bg-green-500" : "bg-gray-400 dark:bg-gray-600"}`} />
              {profile.isAvailable ? "Online" : "Offline"}
            </span>
          </div>
          <p className="text-center text-xs text-blue-500 dark:text-blue-400">
            Be within 500m of a restaurant (hotspot) before going online to receive orders.
          </p>

          {profile.isVerified && !currentOrder && (
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/60">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {toggling ? "Updating..." : profile.isAvailable ? "You're online" : "You're offline"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {profile.isAvailable ? "Receiving delivery requests" : "Go online to start receiving orders"}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleAvailability}
                disabled={toggling}
                aria-label="Toggle availability"
                className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 disabled:opacity-50 ${
                  profile.isAvailable ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <motion.span
                  animate={{ x: profile.isAvailable ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md"
                />
              </motion.button>
            </div>
          )}

          {/* Logout — disabled while on an active delivery */}
          <motion.button
            whileHover={currentOrder ? {} : { scale: 1.02 }}
            whileTap={currentOrder ? {} : { scale: 0.97 }}
            onClick={logoutHandler}
            disabled={!!currentOrder}
            title={currentOrder ? "Finish your current delivery before logging out" : "Logout"}
            className="w-full rounded-xl border border-brand py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Logout
          </motion.button>
        </div>
      </div>

      {/* Sound permission banner */}
      <AnimatePresence>
        {!audioUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto max-w-md px-4"
          >
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <BiBell className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                </span>
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">Enable Sound Notifications</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Get notified when new orders arrive</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={unlockAudio}
                className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Enable
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {audioUnlocked && (
        <p className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-green-600">
          <BiVolumeFull className="h-4 w-4" />
          Sound notifications enabled
        </p>
      )}

      {/* Incoming order requests */}
      <AnimatePresence>
        {profile.isAvailable && incomingOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-md space-y-3 px-4"
          >
            <h3 className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-200">
              <BiBell className="h-4 w-4 text-brand" />
              Incoming Orders
            </h3>
            <AnimatePresence>
              {incomingOrders.map((id) => (
                <RiderOrderRequest key={id} orderId={id} onAccepted={() => { fetchProfile(); fetchCurrentOrder(); }}/>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current active order */}
      {currentOrder && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto max-w-md space-y-4 px-4"
        >
          <RiderCurrentOrder order={currentOrder} onStatusUpdate={fetchCurrentOrder}/>
          <RiderOrderMap order={currentOrder}/>
        </motion.div>
      )}
    </motion.div>
  );
}

export default RiderDashboard;
