import express from "express"
import {signup, login, logout, refreshToken, getProfile} from "../controllers/auth.controller.js"
import { protectedroute } from "../middleware/auth.middleware.js";
const router = express.Router()


router.post("/signup", signup);


router.post("/login", login);


router.post("/logout", logout);
router.post("/refreshToken", refreshToken)
router.get("/profile", protectedroute, getProfile)

export default router

