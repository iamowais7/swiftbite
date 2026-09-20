import { useNavigate, useParams } from "react-router-dom"
import { useAppData } from "../context/AppContext";
import { BiSolidArrowToRight } from "react-icons/bi";
import { useEffect } from "react";
import { motion } from "framer-motion";

function PaymentSuccess() {
  const {paymentId} = useParams<{paymentId: string}>();
  const navigate = useNavigate();
  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
  },[]);

  return (
    <div className="relative flex min-h-[70vh] items-center overflow-hidden px-4 justify-center bg-linear-to-br from-[#fff3f2] via-[#fff8f5] to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md space-y-4 rounded-3xl bg-white/90 p-8 shadow-[0_20px_60px_rgba(226,55,68,0.12)] backdrop-blur-sm text-center dark:bg-gray-900/90 dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="h-10 w-10 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M4 12.5l5 5L20 6.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            />
          </motion.svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="space-y-1.5"
        >
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Payment Successful!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your order has been placed successfully on SwiftBite AI 🎉</p>
        </motion.div>

        {paymentId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="rounded-xl bg-gray-50 p-3 text-left dark:bg-gray-800"
          >
            <p className="text-xs text-gray-400 mb-1 dark:text-gray-500">Payment ID</p>
            <p className="font-mono text-xs break-all text-gray-600 dark:text-gray-300">{paymentId}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="space-y-2.5 pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark transition"
            onClick={() => navigate("/")}
          >
            Order More <BiSolidArrowToRight size={16} />
          </motion.button>
          {/* fixed: was /order (wrong) — correct route is /orders */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand py-3 text-sm font-semibold text-brand hover:bg-brand/10 transition"
            onClick={() => navigate("/orders")}
          >
            View Your Orders <BiSolidArrowToRight size={16} />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default PaymentSuccess
