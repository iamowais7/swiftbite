import { useNavigate } from "react-router-dom"
import { useAppData } from "../context/AppContext"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { BiChevronRight, BiLogOut, BiMapPin, BiPackage } from "react-icons/bi"

export const Account = () => {
  const { user, setUser, setIsAuth } = useAppData()
  const firstLetter = user?.name.charAt(0).toLocaleUpperCase()
  const navigate = useNavigate()

  const logoutHandler = () => {
    localStorage.setItem("token", "")
    setUser(null)
    setIsAuth(false)
    navigate("/login", { replace: true })
    toast.success("Logged out successfully")
  }

  const menuRows = [
    { icon: BiPackage, label: "Your Orders", onClick: () => navigate("/orders") },
    { icon: BiMapPin, label: "Addresses", onClick: () => navigate("/address") },
    { icon: BiLogOut, label: "Logout", onClick: logoutHandler },
  ]

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto max-w-md space-y-4"
      >
        {/* Profile card */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand text-xl font-semibold text-white">
            {firstLetter}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Menu rows */}
        <div className="space-y-2.5">
          {menuRows.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={item.onClick}
              className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_10px_25px_rgba(226,55,68,0.12)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                <item.icon className="h-5 w-5 text-brand" />
              </div>
              <span className="flex-1 font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
              <BiChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-500" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
