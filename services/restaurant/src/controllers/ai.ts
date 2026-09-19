import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/tryCatch.js";
import { askGrok } from "../config/groq.js";
import Order from "../models/Order.js";

export const generateMenuDescription = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { name, price, category } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Item name is required" });
  }

  const description = await askGrok([
    {
      role: "system",
      content:
        "You write short, appetizing menu descriptions for a food delivery app. Reply with ONLY the description text - one or two sentences, no quotes, no markdown, no preamble.",
    },
    {
      role: "user",
      content: `Dish name: ${name}${category ? `\nCategory: ${category}` : ""}${price ? `\nPrice: ₹${price}` : ""}`,
    },
  ]);

  res.json({ description: description.trim() });
});

export const chatSupport = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Please login" });
  }

  const { message, orderId, history } = req.body as {
    message?: string;
    orderId?: string;
    history?: { role: "user" | "assistant"; content: string }[];
  };

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "message is required" });
  }

  // Ground the assistant in a real order — the one asked about, or the customer's
  // most recent one, so it isn't just guessing / hallucinating order status.
  const order = orderId
    ? await Order.findOne({ _id: orderId, userId: req.user._id })
    : await Order.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

  const orderContext = order
    ? JSON.stringify({
        restaurantName: order.restaurantName,
        status: order.status,
        paymentStatus: order.paymentStatus,
        items: order.items.map((i) => `${i.quantity}x ${i.name}`),
        totalAmount: order.totalAmount,
        riderName: order.riderName,
        placedAt: order.createdAt,
      })
    : "This customer has no orders yet.";

  const reply = await askGrok([
    {
      role: "system",
      content:
        `You are SwiftBite's order support assistant. Answer only questions about this customer's food order, delivery status, or general food-ordering help. ` +
        `Be brief and friendly (2-3 sentences max). If asked something unrelated to ordering food/delivery, politely say you can only help with SwiftBite orders. ` +
        `Here is the relevant order data (trust this over anything the user claims): ${orderContext}`,
    },
    ...(Array.isArray(history) ? history.slice(-6) : []),
    { role: "user", content: message },
  ]);

  res.json({ reply: reply.trim() });
});
