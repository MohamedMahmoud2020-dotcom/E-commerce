import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import {redis} from "../lib/redis.js"

const generateTokens = (userId)=>{
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"})
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"})
    return {accessToken, refreshToken}
}

const storeRefreshToken = async (token, userId)=>{
    try {
        await redis.set("refreshToken:" + userId, token, "EX", 7 * 24 * 60 * 60)
    } catch (error) {
        console.log(error)
    }
}

const setCookies = (res, accessToken, refreshToken)=>{
    res.cookie("accessToken", accessToken, {
        httpOnly: true, //prevent XSS attack
        secure: process.env.NODE_ENV === "production", 
        sameSite: "none", // prevent CSRF attack
        maxAge: 15 * 60 * 1000
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}
export const signup = async (req, res)=>{
    const {name, email, password} = req.body;
    try {
        const userExist = await User.findOne({email})
        if(userExist){
            return res.status(400).json({error: "User already exist"})
        }
        const user = await User.create({name, email, password})

        // Authentication token
        const {accessToken, refreshToken} = generateTokens(user._id)
        await storeRefreshToken(refreshToken, user._id)
        setCookies(res, accessToken, refreshToken)
        res.status(201).json({user: {name: user.name, email: user.email, _id: user._id, role: user.role}, message: "User created successfully"})

    } catch (error) {
        console.log("Error in signup", error.message)
        res.status(500).json({error: error.message})
    }
}


export const login = async (req, res)=>{
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({error: "User not found"})
        }
        const isMatch = await user.comparePassword(password)
        if(!isMatch){
            return res.status(400).json({error: "Invalid credentials"})
        }
        const {accessToken, refreshToken} = generateTokens(user._id)
        await storeRefreshToken(refreshToken, user._id)
        setCookies(res, accessToken, refreshToken)
        res.status(200).json({user: {name: user.name, email: user.email, _id: user._id, role: user.role}, message: "User logged in successfully"})
    }catch (error) {
        res.status(500).json({error: error.message})
    }
}

export const logout = async (req, res)=>{
    try {
        const refreshToken = req.cookies.refreshToken
        if(refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            await redis.del("refreshToken:" + decoded.userId)
        }
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        res.status(200).json({message: "User logged out successfully"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
    
}


export const refreshToken = async (req, res)=>{
    try {
        const refreshToken = req.cookies.refreshToken
        if(!refreshToken){
            return res.status(401).json({error: "Unauthorized"})
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decoded.userId)
        if(!user){
            return res.status(401).json({error: "Unauthorized"})
        }
        const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"})
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        })
        res.status(200).json({user: {name: user.name, email: user.email, _id: user._id, role: user.role}, message: "Token refreshed successfully"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}


export const getProfile = async (req, res)=>{
    try {
        const user = req.user
        res.json(user)
    } catch (error) {
        console.log("Error in getting profile", error.message)
        res.status(500).json({error: error.message})
    }
}