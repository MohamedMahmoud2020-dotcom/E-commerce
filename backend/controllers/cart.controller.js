import User from "../models/user.model.js"
import Product from "../models/product.model.js"

export const getCartProducts = async (req, res) => {
    try {
        const user = req.user
        const products = await Product.find({_id: {$in: req.user.cartItems}})
        const cartItems = products.map((product) => {
            const item = user.cartItems.find(item => item.id == product._id)
            return {...product.toJSON(), quantity: item.quantity}
        })
        res.status(200).json({cartItems})
    } catch (error) {
        console.log("Error in getting cart products", error.message)
        res.status(500).json({error: error.message})
    }
}


export const addProductToCart = async (req, res) => {
    try {
        const user = req.user
        const {productId} = req.body
        const existingItem = user.cartItems.find(item => item.id === productId)
        if(existingItem){
            existingItem.quantity += 1
            await user.save()
            res.status(200).json({message: "Product quantity updated in cart successfully"})
        }else{
            user.cartItems.push({_id: productId, quantity: 1})
            await user.save()
            res.status(200).json({message: "Product added to cart successfully"}) 
        }
    } catch (error) {
        console.log("Error in adding product to cart", error.message)
        res.status(500).json({error: error.message})
    }
}


export const removeProductFromCart = async (req, res) => {
    try {
        const user = req.user
        const {id: productId} = req.params
        if(productId){
            user.cartItems = user.cartItems.filter(item => item.id !== productId)
            await user.save()
            res.status(200).json({message: "Product removed from cart successfully"})    
        }
        
    } catch (error) {
        console.log("Error in removing all products from cart", error.message)
        res.status(500).json({error: error.message})
    }
}


export const updateProductQuantity = async (req, res) => {
    try {
        const {id: productId} = req.params
        const user = req.user
        const cart = user.cartItems.find(item => item.id === productId)
        if(!cart){
            return res.status(404).json({error: "Product not found in cart"})
        }else{
            if(cart.quantity === 0){
                user.cartItems = user.cartItems.filter(item => item.id !== productId)
                await user.save()
                res.status(200).json({message: "Product removed from cart successfully"})
            }else{
                cart.quantity = req.body.quantity
                await user.save()
                res.status(200).json({message: "Product quantity updated in cart successfully"})
            }
        }
    } catch (error) {
        console.log("Error in updating product quantity", error.message)
        res.status(500).json({error: error.message})
    }
}