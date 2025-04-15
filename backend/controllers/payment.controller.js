import {stripe} from "../lib/stripe.js"
import Coupone from "../models/coupon.model.js"
import Order from "../models/order.model.js"

export const createCheckoutSession = async (req, res) => {
    try {
        const {products, couponCode} = req.body
        console.log(req.body)
        console.log(couponCode)
        if(!Array.isArray(products) || products.length === 0){
            return res.status(400).json({message: "No products provided"})
        }
        let totalAmount = 0
        const lineItems = products.map(product => {
            const amount = Math.round(product.price) * 100 // stripe accepts amount in cents
            totalAmount += amount * product.quantity
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image]
                    },
                    unit_amount: amount
                },
                quantity: product.quantity
            }
        })
        let coupon = null
        if(couponCode){
            coupon = await Coupone.findOne({code: couponCode, userId: req.user._id, isActive: true})
            if(coupon){
                totalAmount -= Math.round(totalAmount * (coupon.discount / 100))
            }
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/canceled`,
            discounts: coupon ? [{coupon: await createStripeCoupon(coupon.discount)}] : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(products.map(product => ({id: product.id, quantity: product.quantity, price: product.price})))
            }
        })

        if(totalAmount >= 20000){
            await createNewCoupon(req.user._id)
        }
        res.status(200).json({url: session.id, totalAmount: totalAmount / 100})
    } catch (error) {
        console.log("Error in creating checkout session", error.message)
        res.status(500).json({error: error.message})
    }
}



export const checkoutSuccess = async (req, res) => {
    try {
        const {session_id} = req.body
        const session = await stripe.checkout.sessions.retrieve(session_id)
        const userId = session.metadata.userId
        const couponCode = session.metadata.couponCode
        if(session.payment_status === "paid"){
            if(couponCode){
                const coupon = await Coupone.findOne({code: couponCode, userId: userId, isActive: true})
                if(coupon){
                    coupon.isActive = false
                    await coupon.save()
                }
            } 
        }
        const products = Json.parse(session.metadata.products)
        const newOrder = new Order({
            user: session.metadata.userId,
            products: products.map(product => ({
                product: product.id,
                quantity: product.quantity,
                price: product.price
            })),
            totalPrice: session.amount_total / 100,
            stripeSessionId: session.id
        })
        await newOrder.save()
        res.status(200).json({
            success: true,
            message: "Payment successfully, order created and coupon deactivated if used",
            orerId: newOrder._id
        })
    } catch (error) {
        console.log("Error in checkout success", error.message)
        res.status(500).json({error: error.message})
    }
}

async function createStripeCoupon(discount) {
    const stripeCoupon = await stripe.coupons.create({
      percent_off: discount,
      duration: "once",
    });
    return stripeCoupon.id;
  }


async function createNewCoupon(userId) {
    const newCoupon = new Coupone({
        code: "GIFT" +  Math.random().toString(36).substring(2, 8).toUpperCase(),
        discount: 10,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: userId
    })

    await newCoupon.save()
    return newCoupon
}