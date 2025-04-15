import Coupon from "../models/coupon.model.js"


export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({userId: req.user._id, isActive: true})
        console.log(coupon)
        res.status(200).json({coupon} || null)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}


export const validateCoupon = async (req, res) => {
    try {
        const {code} = req.body
        const coupon = await Coupon.findOne({code, userId: req.user._id, isActive: true})
        if(!coupon){
            return res.status(400).json({error: "Invalid coupon code"})
        }

        if(coupon.expiryDate < Date.now()){
            coupon.isActive = false
            await coupon.save()
            return res.status(400).json({error: "Coupon has expired"})            
        }
        res.status(200).json({message: "Coupon is valid", code: code, discountPercentage: coupon.discount})
    } catch (error) {
        console.log("Error in validating coupon", error.message)
        res.status(500).json({error: error.message})
    }
}