import express from "express";
import { createCheckoutSession, checkoutSuccess } from "../controllers/payment.controller.js";
import { protectedroute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-checkout-session", protectedroute, createCheckoutSession);
router.post("/checkout-success", protectedroute, checkoutSuccess);

export default router;