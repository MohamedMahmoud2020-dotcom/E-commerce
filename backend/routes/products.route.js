import express from "express"
import {getAllProducts, 
    getFeaturedProducts, 
    createProduct, 
    deleteProduct, 
    getRecommendations, 
    getProductByCategory,
    toggleFeaturedProduct} 
    from "../controllers/product.controller.js"
import {protectedroute, adminRoute} from "../middleware/auth.middleware.js"

const router = express.Router()


router.get("/", protectedroute, adminRoute, getAllProducts)
router.get("/featured", getFeaturedProducts)
router.get("/recommendations", getRecommendations)
router.get("/category/:category", getProductByCategory)
router.post("/create-product", protectedroute, adminRoute, createProduct)
router.patch("/:id", protectedroute, adminRoute, toggleFeaturedProduct)
router.delete("/:id", protectedroute, adminRoute, deleteProduct)
export default router