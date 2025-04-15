import mongoose from "mongoose";


const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Code is required"]
    },
    discount: {
        type: Number,
        required: [true, "Discount is required"],
        min:0,
        max:100
    },
    expiryDate: {
        type: Date,
        required: true
    }, 
    isActive: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    }

}, {
    timestamps: true
})

export default mongoose.model("Coupon", couponSchema)