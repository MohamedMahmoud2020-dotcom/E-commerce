import Product from "../models/product.model.js"
import cloudinary from "../lib/cloudinary.js"
import { redis } from "../lib/redis.js"

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({})
        res.status(200).json({products})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}


export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({isFeatured: true})
        res.status(200).json({products})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}


export const createProduct = async (req, res) => {
    try {
        const {name, description, price, category, image} = req.body
        let cloudinaryResponse = null;
        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"})
        }

        const product = await Product.create({name, description, price, category, image: cloudinaryResponse?.secure_url ? cloudinaryResponse?.secure_url : ""})
        res.status(201).json({product})
    } catch (error) {
        console.log("Error in creating product", error.message)
        res.status(500).json({error: error.message})
    }
}


export const deleteProduct = async (req, res) => {
    try {
        const {id} = req.params
        const product = await Product.findById(id)
        if(!product){
            return res.status(404).json({error: "Product not found"})
        }
        if(product.image){
            const imageId = product.image.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imageId)
        }else{
            return res.status(404).json({error: "Image not found"})
        }

        await Product.findByIdAndDelete(id)
        res.status(200).json({product})
    } catch (error) {
        console.log("Error in deleting product", error.message)
        res.status(500).json({error: error.message})
    }
}


export const getRecommendations = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {$sample: {size: 3}},
            {$project: {_id: 1, name: 1, description: 1, price: 1, image: 1}}
        ])
        res.status(200).json({products})
    } catch (error) {
        console.log("Error in getting recommendations", error.message)
        res.status(500).json({error: error.message})
    }
}


export const getProductByCategory = async (req, res) => {
    try {
        const {category} = req.params
        const products = await Product.find({category})
        res.status(200).json({products})
    } catch (error) {
        console.log("Error in getting products by category", error.message)
        res.status(500).json({error: error.message})
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const {id} = req.params
        const product = await Product.findById(id)
        if(!product){
            return res.status(404).json({error: "Product not found"})
        }
        product.isFeatured = !product.isFeatured
        updateFeaturedProductsCache()
        await product.save()
        res.status(200).json({product})
    } catch (error) {
        console.log("Error in toggling featured product", error.message)
        res.status(500).json({error: error.message})
    }
}


async function updateFeaturedProductsCache() {
    try {
        const products = await Product.find({isFeatured: true}).lean()
        await redis.set("featuredProducts", JSON.stringify(products))
    } catch (error) {
        console.log("Error in updating featured products cache", error.message)
    }
}