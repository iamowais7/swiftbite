import { useState } from "react"
import { useAppData } from "../context/AppContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { authService } from "../main"
import { motion } from "framer-motion"
import Logo from "../components/Logo"

type Role = "customer" | "rider" | "seller" | null

const roleIcons: Record<string, string> = {
  customer: "🍔",
  rider: "🛵",
  seller: "🍽️",
}

const SelectRole = () => {
  const [role, setRole] = useState<Role>(null)
  const {setUser} = useAppData()
  const navigate = useNavigate()
  const roles: Role[] = ["customer","rider","seller"]

  const addRole = async() => {
    try{
      const {data} = await axios.put(`${authService}/api/auth/add/role`,{role},{
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      })
      localStorage.setItem("token", data.token)
      setUser(data.user)
      navigate("/",{replace:true});
    }catch(error){
      alert("Something went wrong");
      console.log(error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#fff3f2] via-[#fff8f5] to-white px-4 dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm space-y-6 rounded-3xl bg-white/90 p-8 shadow-[0_20px_60px_rgba(226,55,68,0.12)] backdrop-blur-sm dark:bg-gray-900/90 dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      >
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size="lg" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Choose your role</h2>
        </div>

        <div className="space-y-3">
          {roles.map((r, i) => (
            <motion.button
              key={r}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setRole(r)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold capitalize shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition ${
                role === r
                  ? "border-brand bg-brand text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:shadow-[0_10px_25px_rgba(226,55,68,0.12)] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}
            >
              <span className="text-lg">{roleIcons[r!]}</span>
              Continue as {r}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={role ? { scale: 1.02 } : {}}
          whileTap={role ? { scale: 0.97 } : {}}
          disabled={!role}
          onClick={addRole}
          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
            role
              ? "bg-brand text-white hover:bg-brand-dark"
              : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          }`}
        >
          Next →
        </motion.button>
      </motion.div>
    </div>
  )
}

export default SelectRole
