import express from "express"
import { isAuth, isSeller } from "../middleware/isAuth.js";
import {
  assignRiderToOrder,
  createOrder,
  fetchOrderForPayment,
  fetchRestaurantOrder,
  fetchSingleOrder,
  getCurrentOrderForRider,
  getMyOrders,
  updatedOrderStatusRider,
  updateOrderStatus,
} from "../controllers/order.js";

const router = express.Router();

// Static / specific routes first (must come before parameterized routes)
router.post("/new", isAuth, createOrder);
router.get("/my", isAuth, getMyOrders);
router.get("/payment/:id", fetchOrderForPayment);
router.put("/assign/rider", assignRiderToOrder);
router.get("/current/rider", getCurrentOrderForRider);
router.put("/update/status/rider", updatedOrderStatusRider);
router.get("/restaurant/:restaurantId", isAuth, isSeller, fetchRestaurantOrder);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);
router.get("/:id", isAuth, fetchSingleOrder);

export default router;
