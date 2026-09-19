import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google"
import {FcGoogle} from "react-icons/fc"
import { useAppData } from "../context/AppContext";


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
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand name — consistent color #E23744 */}
        <h1 className="text-center text-3xl font-bold text-[#E23744]">
          SwiftBite
        </h1>
        <p className="text-center text-sm text-gray-500">Log in or sign up to continue</p>
        <button
          onClick={googleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          <FcGoogle size={20}/>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
        <p className="text-center text-xs text-gray-400">
          By continuing, you agree with our{" "}
          <span className="text-[#E23744]">Terms of Service</span> &{" "}
          <span className="text-[#E23744]">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}

export default Login
