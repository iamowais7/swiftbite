import { useParams } from "react-router-dom"
import { useSocket } from "../context/SocketContext"
import { useEffect, useRef, useState } from "react"
import type { IOrder } from "../types"
import axios from "axios"
import { restaurantService } from "../main"
import UserOrderMap from "../components/UserOrderMap"
import { useSound } from "../hooks/useSound"

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
    return <p className="text-center text-gray-500 mt-10">Loading Order...</p>
  }
  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">No order found</p>
      </div>
    )
  }

  const statusColor: Record<string, string> = {
    placed:           "bg-yellow-50 text-yellow-700 border-yellow-200",
    accepted:         "bg-orange-50 text-orange-700 border-orange-200",
    preparing:        "bg-blue-50 text-blue-700 border-blue-200",
    ready_for_rider:  "bg-indigo-50 text-indigo-700 border-indigo-200",
    rider_assigned:   "bg-purple-50 text-purple-700 border-purple-200",
    picked_up:        "bg-pink-50 text-pink-700 border-pink-200",
    delivered:        "bg-green-50 text-green-700 border-green-200",
    cancelled:        "bg-red-50 text-red-700 border-red-200",
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Order #{order._id.slice(-6)}</h1>

      {/* Status badge */}
      <div className={`rounded-lg border px-4 py-3 text-sm font-semibold capitalize ${statusColor[order.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
        🚦 Status: {order.status.replaceAll("_", " ")}
      </div>

      {/* Items */}
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h2 className="font-semibold">Items</h2>
        {order.items.map((item, i) => (
          <div className="flex justify-between text-sm" key={i}>
            <span>{item.name} × {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Delivery Address */}
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-1">
        <h2 className="font-semibold">Delivery Address</h2>
        <p className="text-sm text-gray-600">{order.deliveryAddress.formattedAddress}</p>
        <p className="text-sm text-gray-600">📞 {order.deliveryAddress.mobile}</p>
      </div>

      {/* Bill */}
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h2 className="font-semibold">Bill Summary</h2>
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{order.subTotal}</span></div>
        <div className="flex justify-between text-sm"><span>Delivery Fee</span><span>₹{order.deliveryFee}</span></div>
        <div className="flex justify-between text-sm"><span>Platform Fee</span><span>₹{order.platfromFee}</span></div>
        <div className="flex justify-between text-sm font-semibold border-t pt-2"><span>Total</span><span>₹{order.totalAmount}</span></div>
        <p className="text-xs text-gray-400">Payment: {order.paymentMethod} · {order.paymentStatus}</p>
      </div>

      {/* Live map */}
      {(order.status === "rider_assigned" || order.status === "picked_up") && riderLocation ? (
        <UserOrderMap
          riderLocation={riderLocation}
          deliveryLocation={[order.deliveryAddress.latitude, order.deliveryAddress.longitude]}
        />
      ) : (order.status === "rider_assigned" || order.status === "picked_up") ? (
        <div className="rounded-xl bg-white p-4 shadow-sm text-sm text-gray-500 text-center">
          📍 Waiting for rider location...
        </div>
      ) : null}
    </div>
  )
}

export default Order
