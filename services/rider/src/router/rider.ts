import express from "express"
import { isAuth } from "../middleware/isAuth.js";
import { acceptOrder, addRiderProfile, fetchMyCurrentOrder, fetchMyProfile, toggleRiderAvailablity, updateOrderStatus } from "../controllers/rider.js";
import uploadFile from "../middleware/multer.js";
const router = express.Router();
router.post("/new",isAuth,uploadFile,addRiderProfile)
router.get("/myprofile",isAuth,fetchMyProfile);
router.patch("/toggle",isAuth,toggleRiderAvailablity)
router.post("/accept/:orderId",isAuth,acceptOrder);
router.get("/order/current", isAuth,fetchMyCurrentOrder)
router.put("/order/update/:orderId",isAuth,updateOrderStatus)
export default router;