import axios from "axios";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/tryCatch.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import { IMenuItem } from "../models/MenuItems.js";
import Order from "../models/Order.js";
import Restaurant, { IRestaurant } from "../models/Restaurant.js";
import { publishEvent } from "../config/order.publisher.js";

export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { paymentMethod, addressId } = req.body;
  if (!addressId) {
    return res.status(400).json({ message: "Address is required" });
  }

  const address = await Address.findOne({ _id: addressId, userId: user._id });
  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const cartItems = await Cart.find({ userId: user._id })
    .populate<{ itemId: IMenuItem }>("itemId")
    .populate<{ restaurantId: IRestaurant }>("restaurantId");

  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const firstCartItem = cartItems[0];
  if (!firstCartItem || !firstCartItem.restaurantId) {
    return res.status(400).json({ message: "Invalid Cart Data" });
  }

  const restaurantId = firstCartItem.restaurantId._id;
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: "No restaurant with this id" });
  }
  if (!restaurant.isOpen) {
    return res.status(400).json({ message: "Sorry this restaurant is closed for now." });
  }

  const distance = getDistance(
    address.location.coordinates[1]!,
    address.location.coordinates[0]!,
    restaurant.autoLocation.coordinates[1]!,
    restaurant.autoLocation.coordinates[0]!
  );

  let subTotal = 0;
  const orderItems = cartItems.map((cart) => {
    const item = cart.itemId;
    if (!item) throw new Error("Invalid cart item");
    const itemTotal = item.price * cart.quantity;
    subTotal += itemTotal;
    return {
      itemId: item._id.toString(),
      name: item.name,
      price: item.price,
      quantity: cart.quantity,
    };
  });

  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platfromFee = 7;
  const totalAmount = subTotal + deliveryFee + platfromFee;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const [longitude, latitude] = address.location.coordinates;
  const riderAmount = Math.ceil(distance) * 20;

  const order = await Order.create({
    userId: user._id.toString(),
    restaurantId: restaurantId.toString(),
    restaurantName: restaurant.name,
    riderId: null,
    distance,
    riderAmount,
    items: orderItems,
    subTotal,
    deliveryFee,
    platfromFee,
    totalAmount,
    addressId: address._id.toString(),
    deliveryAddress: {
      formattedAddress: address.formattedAddress,
      mobile: address.mobile,
      latitude,
      longitude,
    },
    paymentMethod,
    paymentStatus: "pending",
    status: "placed",
    expiresAt,
  });

  // Cart is intentionally NOT cleared here — this order is still "pending" until
  // payment actually succeeds (see payment.consumer.ts). Clearing it here meant an
  // abandoned/failed payment attempt silently emptied the cart before checkout finished.
  res.json({
    message: "Order created successfully",
    orderId: order._id.toString(),
    amount: totalAmount,
  });
});

export const fetchOrderForPayment = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (order.paymentStatus !== "pending") {
    return res.status(400).json({ message: "Order already paid" });
  }
  res.json({ orderId: order._id, amount: order.totalAmount, currency: "INR" });
});

export const fetchRestaurantOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  const { restaurantId } = req.params;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!restaurantId) {
    return res.status(400).json({ message: "Restaurant id is required" });
  }
  const limit = req.query.limit ? Number(req.query.limit) : 0;
  // fixed: lowercase "paid"
  const orders = await Order.find({ restaurantId, paymentStatus: "paid" })
    .sort({ createdAt: -1 })
    .limit(limit);

  return res.json({ success: true, count: orders.length, orders });
});

const ALLOWED_STATUSES = ["accepted", "preparing", "ready_for_rider"] as const;

export const updateOrderStatus = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  const { orderId } = req.params;
  const { status } = req.body;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!(ALLOWED_STATUSES as readonly string[]).includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (order.paymentStatus !== "paid") {
    return res.status(400).json({ message: "Order payment is not complete" });
  }
  const restaurant = await Restaurant.findById(order.restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (restaurant.ownerId !== user._id.toString()) {
    return res.status(403).json({ message: "You are not allowed to update this order" });
  }
  order.status = status;
  await order.save();

  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    { event: "order:update", room: `user:${order.userId}`, payload: { orderId: order._id, status: order.status } },
    { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
  );

  if (status === "ready_for_rider") {
    console.log("Publishing Order ready for rider event for order", order._id);
    await publishEvent("ORDER_READY_FOR_RIDER", {
      orderId: order._id.toString(),
      restaurantId: restaurant._id.toString(),
      location: restaurant.autoLocation,
    });
    console.log("Event Published successfully");
  }

  res.json({ message: "Order status updated successfully", order });
});

export const getMyOrders = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const orders = await Order.find({
    userId: req.user._id.toString(),
    paymentStatus: "paid",
  }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const fetchSingleOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  // fixed: was === (was denying access to own order), should be !==
  if (order.userId !== req.user._id.toString()) {
    return res.status(403).json({ message: "You are not allowed to view this order" });
  }
  res.json(order);
});

export const assignRiderToOrder = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { orderId, riderId, riderName, riderPhone } = req.body;

  const riderBusy = await Order.findOne({ riderId, status: { $nin: ["delivered", "cancelled"] } });
  if (riderBusy) {
    return res.status(400).json({ message: "Rider already has an active order" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (order.riderId !== null) {
    return res.status(400).json({ message: "Order already taken" });
  }

  const orderUpdated = await Order.findOneAndUpdate(
    { _id: orderId, riderId: null },
    { riderId, riderName, riderPhone, status: "rider_assigned" },
    { new: true }
  );

  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    { event: "order:rider_assigned", room: `user:${order.userId}`, payload: { order: orderUpdated } },
    { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
  );

  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    { event: "order:rider_assigned", room: `restaurant:${order.restaurantId}`, payload: { order: orderUpdated } },
    { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
  );

  res.json({ message: "Rider assigned successfully", success: true, order: orderUpdated });
});

// fixed: params were swapped (res, req) → (req, res)
export const getCurrentOrderForRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const riderId = req.query.riderId as string | undefined;
  if (!riderId) {
    return res.status(400).json({ message: "Rider id is required" });
  }
  const order = await Order.findOne({
    riderId,
    status: { $nin: ["delivered", "cancelled"] },
  }).populate("restaurantId");
  if (!order) {
    return res.status(404).json({ message: "No active order found" });
  }
  res.json(order);
});

export const updatedOrderStatusRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }
  // fixed: was `const orderId = req.body` (wrong - assigns entire body object)
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const nextStatus = order.status === "rider_assigned" ? "picked_up" : order.status === "picked_up" ? "delivered" : null;
  if (!nextStatus) {
    return res.status(400).json({ message: "Cannot update order status from current state" });
  }

  order.status = nextStatus;
  await order.save();

  const emitPayload = { event: "order:update", payload: { order } };
  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    { ...emitPayload, room: `restaurant:${order.restaurantId}` },
    { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
  );
  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    { ...emitPayload, room: `user:${order.userId}` },
    { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
  );

  return res.json({ message: "Order updated successfully" });
});
