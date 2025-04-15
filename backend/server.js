import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/products.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser"


const app = express();
const corsOptions = {
    origin: 'http://localhost:5173', // Allow only the frontend app to send requests
    methods: 'GET,POST,PUT,DELETE,PATCH',  // Allow specific HTTP methods
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true 
  };
  
app.use(cors(corsOptions))

app.use(express.json({ limit: "50mb" }))
app.use(cookieParser())
dotenv.config()
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/coupon", couponRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/analytics", analyticsRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> {
    console.log("Server is running on port " + PORT)
    connectDB()
})