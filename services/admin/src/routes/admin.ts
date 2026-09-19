import express from "express"
import { isAdmin, isAuth } from "../middleware/isAuth.js";
import { getPendingRestaurant, getPendingRider, verifyRestaurant, verifyRider } from "../controllers/admin.js";

const router = express.Router();

router.get("/admin/restaurant/pending", isAuth, isAdmin, getPendingRestaurant);
router.get("/admin/rider/pending", isAuth, isAdmin, getPendingRider);
router.patch("/verify/rider/:id", isAuth, isAdmin, verifyRider);
router.patch("/verify/restaurant/:id", isAuth, isAdmin, verifyRestaurant);

export default router;
