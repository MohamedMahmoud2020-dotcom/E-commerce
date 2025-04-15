import jwt from "jsonwebtoken"
import User from "../models/user.model.js"


export const protectedroute = async (req, res, next) => {
    try {
        const {accessToken} = req.cookies
        if(!accessToken){
            return res.status(401).json({error: "Unauthorized - No Access Token"})
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decoded.userId)

        if(!user){
            return res.status(401).json({error: "User not found"})
        }
        req.user = user
        next();
    } catch (error) {
        console.log("Error in protected route middleware", error.message)
        res.status(401).json({error: error.message})
    }
    
}


export const adminRoute = (req, res, next) => {
    try {
        const {role} = req.user
        if(role !== "admin"){
            return res.status(401).json({error: "Unauthorized - Not Admin"})            
        }
    } catch (error) {
        console.log("Error in admin route middleware", error.message)
        res.status(403).json({error: error.message})
    }
    next();
}