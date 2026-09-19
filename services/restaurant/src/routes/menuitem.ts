import express from "express"
import { addMenuItem, deleteMenuItem, getAllItems, toggleMenuItemAvailability } from "../controllers/menuitem.js";
import { isAuth, isSeller } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";
const router = express.Router()

router.post("/new", isAuth, isSeller, uploadFile, addMenuItem);
router.get("/all/:id",isAuth,getAllItems);
router.delete("/:itemId",isAuth,isSeller,deleteMenuItem)
router.put("/status/:itemId",isAuth,isSeller, toggleMenuItemAvailability)

export default router;