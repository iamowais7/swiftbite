import express from "express";
import { isAuth, isSeller } from "../middleware/isAuth.js";
import { chatSupport, generateMenuDescription } from "../controllers/ai.js";

const router = express.Router();

router.post("/menu-description", isAuth, isSeller, generateMenuDescription);
router.post("/chat", isAuth, chatSupport);

export default router;
