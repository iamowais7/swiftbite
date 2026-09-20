import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BiTransferAlt } from "react-icons/bi";
import toast from "react-hot-toast";
import { authService } from "../main";
import { useAppData } from "../context/AppContext";

const roles = [
  { value: "customer", label: "Customer", icon: "🍔" },
  { value: "rider", label: "Rider", icon: "🛵" },
  { value: "seller", label: "Seller", icon: "🍽️" },
];

interface Props {
  disabled?: boolean;
  disabledReason?: string;
}

function RoleSwitcher({ disabled, disabledReason }: Props) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const { user, setUser } = useAppData();

  const switchRole = async (role: string) => {
    if (role === user?.role) {
      setOpen(false);
      return;
    }
    try {
      setSwitching(true);
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      localStorage.setItem("token", data.token);
      setUser(data.user);
      toast.success(`Switched to ${role}`);
    } catch (error) {
      toast.error("Failed to switch role");
    } finally {
      setSwitching(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || switching}
        title={disabled ? disabledReason : "Switch Role"}
        className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <BiTransferAlt className="h-4 w-4" />
        {switching ? "Switching..." : "Switch Role"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 z-20 mb-2 w-44 overflow-hidden rounded-xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:bg-gray-900 dark:ring-1 dark:ring-gray-800"
          >
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => switchRole(r.value)}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium capitalize transition ${
                  user?.role === r.value
                    ? "bg-brand/10 text-brand"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <span>{r.icon}</span>
                {r.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RoleSwitcher;
