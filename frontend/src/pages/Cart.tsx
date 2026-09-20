import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BiCart, BiLoader, BiMinus, BiPlus } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";

function Cart() {
  const { cart, subTotal, quantity, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <BiCart className="h-8 w-8 text-brand" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">Your cart is empty</p>
        <p className="max-w-xs text-sm text-gray-400 dark:text-gray-500">
          Looks like you haven't added anything yet — go find something tasty.
        </p>
      </motion.div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure you want to clear your cart?");
    if (!confirm) return;
    try {
      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setClearingCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-5xl py-6 px-4 space-y-6"
    >
      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{restaurant.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>

      <div className="space-y-4">
        {cart.map((cartItem: ICart, i: number) => {
          const item = cartItem.itemId as IMenuItem;
          const isLoading = loadingItemId === item._id;
          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
              whileHover={{ y: -3 }}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_10px_25px_rgba(226,55,68,0.12)] dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800"
            >
              <img
                src={item.image}
                alt=""
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:border-brand hover:bg-brand/10 hover:text-brand disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                  disabled={isLoading}
                  onClick={() => decreaseQty(item._id)}
                >
                  {isLoading ? (
                    <BiLoader size={16} className="animate-spin" />
                  ) : (
                    <BiMinus size={16} />
                  )}
                </motion.button>
                <span className="w-4 text-center font-semibold text-gray-900 dark:text-white">
                  {cartItem.quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:border-brand hover:bg-brand/10 hover:text-brand disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                  disabled={isLoading}
                  onClick={() => increaseQty(item._id)}
                >
                  {isLoading ? (
                    <BiLoader size={16} className="animate-spin" />
                  ) : (
                    <BiPlus size={16} />
                  )}
                </motion.button>
              </div>
              <p className="w-20 text-right font-bold text-gray-900 dark:text-white">
                ₹{item.price * cartItem.quantity}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] space-y-3 dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Total Items</span>
          <span>{quantity}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Subtotal</span>
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

        <motion.button
          whileHover={!restaurant.isOpen ? {} : { scale: 1.02 }}
          whileTap={!restaurant.isOpen ? {} : { scale: 0.97 }}
          onClick={() => navigate("/checkout")}
          className={`mt-3 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark ${
            !restaurant.isOpen ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!restaurant.isOpen}
        >
          {!restaurant.isOpen ? "Restaurant is closed" : "Proceed to Checkout"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={clearCart}
          disabled={clearingCart}
          className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-gray-800 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 disabled:opacity-60 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Clear Cart
          <TbTrash size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default Cart;
