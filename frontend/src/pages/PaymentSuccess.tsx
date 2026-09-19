import { useNavigate, useParams } from "react-router-dom"
import { useAppData } from "../context/AppContext";
import { BiCheckCircle, BiSolidArrowToRight } from "react-icons/bi";
import { useEffect } from "react";

function PaymentSuccess() {
  const {paymentId} = useParams<{paymentId: string}>();
  const navigate = useNavigate();
  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
  },[]);

  return (
    <div className="flex min-h-[70vh] items-center px-4 justify-center">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm text-center space-y-4">
        <BiCheckCircle size={64} className="mx-auto text-green-500"/>

        <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>
        <p className="text-sm text-gray-500">Your order has been placed successfully 🎉</p>

        {paymentId && (
          <div className="rounded-lg bg-gray-50 p-3 text-left">
            <p className="text-xs text-gray-400 mb-1">Payment ID</p>
            <p className="font-mono text-xs break-all text-gray-600">{paymentId}</p>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E23744] py-3 text-sm font-semibold text-white hover:bg-[#d32f3a] transition"
            onClick={() => navigate("/")}
          >
            Order More <BiSolidArrowToRight size={16} />
          </button>
          {/* fixed: was /order (wrong) — correct route is /orders */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E23744] py-3 text-sm font-semibold text-[#E23744] hover:bg-red-50 transition"
            onClick={() => navigate("/orders")}
          >
            View Your Orders <BiSolidArrowToRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
