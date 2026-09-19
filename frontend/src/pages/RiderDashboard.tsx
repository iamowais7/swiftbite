import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";
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
      toast.success("🔊 Sound notifications enabled!");
    } catch {
      // Even if it fails, mark unlocked so we attempt on next event
      setAudioUnlocked(true);
      toast.success("🔊 Sound notifications enabled!");
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
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        You are not registered as a rider
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Loading rider details...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
          <h1 className="text-xl font-semibold text-[#E23744]">Add Your Rider Profile</h1>
          <input type="text" placeholder="Aadhaar Number" value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#E23744]"/>
          <input type="text" placeholder="Phone Number" value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#E23744]"/>
          <input type="text" placeholder="Driving Licence Number" value={drivingLicenseNumber}
            onChange={(e) => setDrivingLicenseNumber(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#E23744]"/>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
            <BiUpload className="h-5 w-5 text-[#E23744]"/>
            {image ? image.name : "Upload your photo"}
            <input type="file" name="file" accept="image/*" hidden
              onChange={(e) => setImage(e.target.files?.[0] || null)}/>
          </label>
          <button className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#E23744] hover:bg-[#d32f3a] transition"
            disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting..." : "Add Profile"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Profile Card */}
      <div className="mx-auto max-w-md px-4 py-4">
        <div className="rounded-xl bg-white p-4 shadow space-y-3">
          <img src={profile.picture} className="mx-auto h-24 w-24 rounded-full object-cover border-4 border-[#E23744]"/>
          <p className="text-center font-semibold text-lg">{user?.name}</p>
          <p className="text-center text-sm text-gray-500">{profile.phoneNumber}</p>
          <div className="flex justify-center gap-2">
            <span className={`px-3 py-1 text-xs rounded-full font-medium ${profile.isVerified ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
              {profile.isVerified ? "✓ Verified" : "⏳ Pending"}
            </span>
            <span className={`px-3 py-1 text-xs rounded-full font-medium ${profile.isAvailable ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
              {profile.isAvailable ? "🟢 Online" : "⚫ Offline"}
            </span>
          </div>
          <p className="text-xs text-blue-500 text-center">
            Be within 500m of a restaurant (hotspot) before going online to receive orders.
          </p>
          {profile.isVerified && !currentOrder && (
            <button onClick={toggleAvailability} disabled={toggling}
              className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                toggling ? "bg-gray-400" : profile.isAvailable ? "bg-gray-600 hover:bg-gray-700" : "bg-[#E23744] hover:bg-[#d32f3a]"
              }`}>
              {toggling ? "Updating..." : profile.isAvailable ? "Go Offline" : "Go Online"}
            </button>
          )}

          {/* Logout — disabled while on an active delivery */}
          <button
            onClick={logoutHandler}
            disabled={!!currentOrder}
            title={currentOrder ? "Finish your current delivery before logging out" : "Logout"}
            className="w-full py-2 rounded-lg border border-[#E23744] text-[#E23744] font-semibold hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sound permission banner */}
      {!audioUnlocked && (
        <div className="mx-auto max-w-md px-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="font-medium text-blue-900">Enable Sound Notifications</p>
                <p className="text-sm text-blue-700">Get notified when new orders arrive</p>
              </div>
            </div>
            <button onClick={unlockAudio}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              Enable Sound
            </button>
          </div>
        </div>
      )}
      {audioUnlocked && (
        <p className="text-center text-sm text-green-600 font-medium">🔊 Sound notifications enabled</p>
      )}

      {/* Incoming order requests */}
      {profile.isAvailable && incomingOrders.length > 0 && (
        <div className="mx-auto max-w-md px-4 space-y-3">
          <h3 className="font-semibold text-gray-700">🚨 Incoming Orders</h3>
          {incomingOrders.map((id) => (
            <RiderOrderRequest key={id} orderId={id} onAccepted={() => { fetchProfile(); fetchCurrentOrder(); }}/>
          ))}
        </div>
      )}

      {/* Current active order */}
      {currentOrder && (
        <div className="mx-auto max-w-md px-4 space-y-4">
          <RiderCurrentOrder order={currentOrder} onStatusUpdate={fetchCurrentOrder}/>
          <RiderOrderMap order={currentOrder}/>
        </div>
      )}
    </div>
  );
}

export default RiderDashboard;
