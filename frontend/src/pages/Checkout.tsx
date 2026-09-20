import { useState, useEffect } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BiCreditCard, BiLoader, BiMapPin } from "react-icons/bi";
import { loadStripe } from "@stripe/stripe-js";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

function Checkout() {
  const { cart, subTotal, quantity } = useAppData();
  const [address, setAddress] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }
      try {
        const { data } = await axios.get(`${restaurantService}/api/address/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAddress(data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchAddresses();
  }, [cart]);

  if (!cart || cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[60vh] items-center justify-center"
      >
        <p className="text-gray-500 text-lg dark:text-gray-400">Your Cart is Empty</p>
      </motion.div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: string) => {
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return data;
    } catch (error) {
      toast.error("Failed to create Order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);
      const order = await createOrder("razorpay");
      if (!order) return;
      const { orderId, amount } = order;
      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });
      const { razorpayOrderId, key } = data;
      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "SwiftBite AI",
        description: "Food Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            toast.success("Payment Successful");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#E23744" },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment Failed, please refresh page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;
      const { orderId } = order;
      const stripe = await stripePromise;
      if (!stripe) return;
      const { data } = await axios.post(
        `${utilsService}/api/payment/stripe/create`,
        { orderId }
      );
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create payment session");
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-4xl px-4 py-6 space-y-6"
    >
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Checkout</h1>
      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{restaurant.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] space-y-3 dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white">Delivery Address</h3>
        {loadingAddress ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : address.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No address found. Please add one.
          </p>
        ) : (
          address.map((add, i) => (
            <motion.label
              key={add._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
              whileHover={{ y: -2 }}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                selectedAddressId === add._id
                  ? "border-brand bg-brand/10"
                  : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              <input
                type="radio"
                checked={selectedAddressId === add._id}
                onChange={() => setSelectedAddressId(add._id)}
                className="mt-1 accent-brand"
              />
              <BiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{add.formattedAddress}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{add.mobile}</p>
              </div>
            </motion.label>
          ))
        )}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] space-y-4 dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white">Order Summary</h3>
        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;
          return (
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300" key={cartItem._id}>
              <span>
                {item.name} X {cartItem.quantity}
              </span>
              <span>₹{item.price * cartItem.quantity}</span>
            </div>
          );
        })}
        <hr className="border-gray-100 dark:border-gray-800" />
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Items ({quantity})</span>
          <span>₹{subTotal}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Delivery Fee</span>
          <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Platform Fee</span>
          <span>₹{platformFee}</span>
        </div>
        {subTotal < 250 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add items worth ₹{250 - subTotal} more to get free delivery
          </p>
        )}
        <div className="flex justify-between border-t pt-2 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-white">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] space-y-3 dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white">Payment Method</h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
          onClick={payWithRazorpay}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D7FF9] py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 dark:bg-[#3d8bfa] dark:hover:bg-[#5b9dfb]"
        >
          {loadingRazorpay ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}{" "}
          Pay with Razorpay
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={!selectedAddressId || loadingStripe || creatingOrder}
          onClick={payWithStripe}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-800 dark:ring-1 dark:ring-gray-700 dark:hover:bg-gray-700"
        >
          {loadingStripe ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}{" "}
          Pay with Stripe
        </motion.button>
      </div>
    </motion.div>
  );
}

export default Checkout;
