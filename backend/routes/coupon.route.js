import express from "express";
import { protectedroute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();

router.get("/", protectedroute, getCoupon)
router.post("/validate", protectedroute, validateCoupon)
export default router