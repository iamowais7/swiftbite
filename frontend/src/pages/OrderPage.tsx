import { useParams } from "react-router-dom"
import { useSocket } from "../context/SocketContext"
import { useEffect, useRef, useState } from "react"
import type { IOrder } from "../types"
import axios from "axios"
import { motion } from "framer-motion"
import { restaurantService } from "../main"
import UserOrderMap from "../components/UserOrderMap"
import { useSound } from "../hooks/useSound"
import { BiCheckCircle, BiMapPin, BiPhone, BiReceipt, BiRestaurant } from "react-icons/bi"
import { HiOutlineTruck } from "react-icons/hi2"

const STATUS_STEPS = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
  "delivered",
] as const;

const stepLabel: Record<string, string> = {
  placed:          "Placed",
  accepted:        "Accepted",
  preparing:       "Preparing",
  ready_for_rider: "Ready",
  rider_assigned:  "Rider Assigned",
  picked_up:       "On the Way",
  delivered:       "Delivered",
};

function Order() {
  const { id } = useParams()
  const { socket } = useSocket()
  const { play } = useSound()
  const prevStatus = useRef<string | null>(null)
  const [order, setOrder] = useState<IOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null)

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setOrder(data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrder() }, [id])

  // Play sound when order status changes
  useEffect(() => {
    if (!order) return
    if (prevStatus.current && prevStatus.current !== order.status) {
      if (order.status === "delivered") play("order-delivered")
      else if (order.status === "rider_assigned") play("order-accepted")
      else play("order-accepted")
    }
    prevStatus.current = order.status
  }, [order?.status])

  useEffect(() => {
    if (!socket) return
    const onOrderUpdate = () => fetchOrder()
    socket.on("order:update", onOrderUpdate)
    socket.on("order:rider_assigned", onOrderUpdate)
    return () => {
      socket.off("order:update", onOrderUpdate)
      socket.off("order:rider_assigned", onOrderUpdate)
    }
  }, [socket])

  useEffect(() => {
    if (!socket || !id) return
    socket.emit("join", `user:${id}`)
    return () => { socket.emit("leave", `user:${id}`) }
  }, [socket, id])

  useEffect(() => {
    if (!socket) return
    const onRiderLocation = ({ latitude, longitude }: any) => {
      setRiderLocation([latitude, longitude])
    }
    socket.on("rider:location", onRiderLocation)
    return () => { socket.off("rider:location", onRiderLocation) }
  }, [socket])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }
  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <BiReceipt className="h-8 w-8 text-brand" />
        </div>
        <p className="text-lg font-semibold text-gray-700">No order found</p>
        <p className="max-w-xs text-sm text-gray-400">
          This order may have been removed or the link is incorrect.
        </p>
      </div>
    )
  }

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-3xl px-4 py-6 space-y-4"
    >
      <h1 className="text-xl font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h1>

      {/* Status timeline / badge */}
      {isCancelled ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          This order was cancelled
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isLast = i === STATUS_STEPS.length - 1;
              return (
                <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      initial={false}
                      animate={{ scale: isCurrent ? 1.15 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
                        done ? "bg-brand" : "bg-gray-200"
                      } ${isCurrent ? "ring-4 ring-brand/20" : ""}`}
                    >
                      {done && <BiCheckCircle className="h-4 w-4" />}
                    </motion.div>
                    <span
                      className={`hidden text-[10px] font-medium sm:block ${
                        done ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {stepLabel[step]}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`mx-1 h-1 flex-1 rounded-full transition-colors duration-500 ${
                        i < currentStepIndex ? "bg-brand" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-brand sm:hidden">
            {stepLabel[order.status] ?? order.status}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] space-y-2">
        <h2 className="flex items-center gap-1.5 font-semibold text-gray-900">
          <BiRestaurant className="h-4 w-4 text-brand" /> Items
        </h2>
        {order.items.map((item, i) => (
          <div className="flex justify-between text-sm text-gray-600" key={i}>
            <span>{item.name} × {item.quantity}</span>
            <span className="font-medium text-gray-800">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Delivery Address */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] space-y-1.5">
        <h2 className="flex items-center gap-1.5 font-semibold text-gray-900">
          <BiMapPin className="h-4 w-4 text-brand" /> Delivery Address
        </h2>
        <p className="text-sm text-gray-600">{order.deliveryAddress.formattedAddress}</p>
        <p className="flex items-center gap-1.5 text-sm text-gray-600">
          <BiPhone className="h-3.5 w-3.5 text-brand" /> {order.deliveryAddress.mobile}
        </p>
      </div>

      {/* Bill */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] space-y-2">
        <h2 className="flex items-center gap-1.5 font-semibold text-gray-900">
          <BiReceipt className="h-4 w-4 text-brand" /> Bill Summary
        </h2>
        <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>₹{order.subTotal}</span></div>
        <div className="flex justify-between text-sm text-gray-600"><span>Delivery Fee</span><span>₹{order.deliveryFee}</span></div>
        <div className="flex justify-between text-sm text-gray-600"><span>Platform Fee</span><span>₹{order.platfromFee}</span></div>
        <div className="flex justify-between text-sm font-semibold text-gray-900 border-t border-gray-100 pt-2"><span>Total</span><span className="text-brand">₹{order.totalAmount}</span></div>
        <p className="text-xs text-gray-400">Payment: {order.paymentMethod} · {order.paymentStatus}</p>
      </div>

      {/* Live map */}
      {(order.status === "rider_assigned" || order.status === "picked_up") && riderLocation ? (
        <UserOrderMap
          riderLocation={riderLocation}
          deliveryLocation={[order.deliveryAddress.latitude, order.deliveryAddress.longitude]}
        />
      ) : (order.status === "rider_assigned" || order.status === "picked_up") ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] text-sm text-gray-500">
          <HiOutlineTruck className="h-5 w-5 text-brand" />
          Waiting for rider location...
        </div>
      ) : null}
    </motion.div>
  )
}

export default Order
