import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"
import { utilsService } from "../main";
import toast from "react-hot-toast";
import { BiCheckCircle, BiSolidArrowToRight } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

function OrderSuccess() {
  const [params] = useSearchParams()
  const sessionId = params.get("session_id");
  const navigate = useNavigate();
  const { fetchCart } = useAppData();
  const [verifying, setVerifying] = useState(true);

  useEffect(()=>{
    const verifyPayment = async() => {
      if(!sessionId) { setVerifying(false); return; }
      try{
        await axios.post(`${utilsService}/api/payment/stripe/verify`,{ sessionId });
        toast.success("Payment successful!");
        fetchCart();
      }catch(error){
        toast.error("Stripe verification failed");
        console.log(error);
      }finally{
        setVerifying(false);
      }
    }
    verifyPayment();
  },[sessionId]);

  if(verifying){
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Verifying payment...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center px-4 justify-center">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm text-center space-y-4">
        <BiCheckCircle size={64} className="mx-auto text-green-500"/>
        <h1 className="text-2xl font-bold text-gray-800">Order Placed! 🎉</h1>
        <p className="text-sm text-gray-500">Your Stripe payment was verified successfully.</p>
        <div className="space-y-2 pt-2">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E23744] py-3 text-sm font-semibold text-white hover:bg-[#d32f3a] transition"
            onClick={() => navigate("/")}
          >
            Order More <BiSolidArrowToRight size={16}/>
          </button>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E23744] py-3 text-sm font-semibold text-[#E23744] hover:bg-red-50 transition"
            onClick={() => navigate("/orders")}
          >
            View Your Orders <BiSolidArrowToRight size={16}/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
