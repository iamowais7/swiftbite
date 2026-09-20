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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#fff3f2] via-[#fff8f5] to-white px-4">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm space-y-7 rounded-3xl bg-white/90 p-8 shadow-[0_20px_60px_rgba(226,55,68,0.12)] backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <Logo size="lg" />
          <p className="text-sm text-gray-500">Log in or sign up to continue</p>
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
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow-md disabled:opacity-50"
        >
          <FcGoogle size={20}/>
          {loading ? "Signing in..." : "Continue with Google"}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-xs text-gray-400"
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
