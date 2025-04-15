import express from "express";
import { protectedroute } from "../middleware/auth.middleware.js";
import {getCartProducts, addProductToCart, removeProductFromCart, updateProductQuantity} from "../controllers/cart.controller.js"

const router = express.Router()



router.get("/", protectedroute, getCartProducts)
router.post("/", protectedroute, addProductToCart)
router.delete("/:id", protectedroute, removeProductFromCart)
router.put("/:id", protectedroute, updateProductQuantity)

export default router