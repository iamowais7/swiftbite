import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google"
import {FcGoogle} from "react-icons/fc"
import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi2";
import { useAppData } from "../context/AppContext";
import Logo from "../components/Logo";


function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const {setUser, setIsAuth} = useAppData()

  const responseGoogle = async(authResult: any) => {
    setLoading(true)
    try{
      const result = await axios.post(`${authService}/api/auth/login`,{
        code:authResult["code"],
      });
      localStorage.setItem("token",result.data.token);
      toast.success(result.data.message);
      setLoading(false);
      setUser(result.data.user)
      setIsAuth(true)
      navigate(from, { replace: true });
    }catch(error:any){
     console.log(error);
     toast.error("Problem while login")
     setLoading(false);
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess:responseGoogle,
    onError: responseGoogle,
    flow:"auth-code",
  });

  const floatingFoods = [
    { emoji: "🍔", top: "8%", left: "10%", size: "text-6xl", duration: 7 },
    { emoji: "🍕", top: "15%", left: "82%", size: "text-7xl", duration: 9 },
    { emoji: "🍜", top: "72%", left: "6%", size: "text-6xl", duration: 8 },
    { emoji: "🍰", top: "78%", left: "85%", size: "text-6xl", duration: 6.5 },
    { emoji: "🥗", top: "45%", left: "3%", size: "text-5xl", duration: 7.5 },
    { emoji: "🍩", top: "38%", left: "90%", size: "text-5xl", duration: 8.5 },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#fff3f2] via-[#fff8f5] to-white px-4 dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
      {/* animated gradient blobs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand/15 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -25, 0], y: [0, -15, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-brand/15 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb800]/10 blur-3xl"
      />

      {/* floating food emojis */}
      {floatingFoods.map((f, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ y: [0, -18, 0], rotate: [0, 8, 0], opacity: 0.16 }}
          transition={{ duration: f.duration, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          className={`pointer-events-none absolute select-none ${f.size} blur-[1px]`}
          style={{ top: f.top, left: f.left }}
        >
          {f.emoji}
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm space-y-7 rounded-3xl bg-white/90 p-8 shadow-[0_20px_60px_rgba(226,55,68,0.12)] backdrop-blur-sm dark:bg-gray-900/90 dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <Logo size="lg" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Log in or sign up to continue</p>
          <p className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-semibold text-brand">
            <HiSparkles className="h-3.5 w-3.5" />
            Powered by AI — smart search, instant recommendations & order support
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={googleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow-md disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600"
        >
          <FcGoogle size={20}/>
          {loading ? "Signing in..." : "Continue with Google"}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-xs text-gray-400 dark:text-gray-500"
        >
          By continuing, you agree with our{" "}
          <span className="font-medium text-brand">Terms of Service</span> &{" "}
          <span className="font-medium text-brand">Privacy Policy</span>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Login
