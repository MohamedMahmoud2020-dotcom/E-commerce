import Product from "../models/product.model.js"
import User from "../models/user.model.js"
import Order from "../models/order.model.js"
export const getAnalytics = async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData()
        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        const dailySalesData = await getDailySalesData(startDate, endDate)
        res.json({analyticsData, dailySalesData})
    } catch (error) {
        console.log("Error in getting analytics", error.message)
        res.status(500).json({error: error.message})    
    }
}


async function getAnalyticsData() {
    const totalUsers = await User.countDocuments()
    const totalProducts = await Product.countDocuments()
    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null, // it groups all documents together
                totalSales: {$sum: 1},
                totalRevenue: {$sum: "$totalPrice"}
            }
        }
    ])

    const {totalSales, totalRevenue} = salesData[0] || {}
    return {users:totalUsers, products:totalProducts, totalSales, totalRevenue}
}


async function getDailySalesData(startDate, endDate) {
    const dailySalesData = await Order.aggregate([
        {
            $match: {
                createdAt: {$gte: startDate, $lte: endDate}
            }
        },
        {
            $group: {
                _id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}}, // it groups all documents together
                totalSales: {$sum: 1},
                totalRevenue: {$sum: "$totalPrice"}
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ]);
    const dataArray = getDatesInRange(startDate, endDate)
    return dataArray.forEach(date => {
        const foundData = dailySalesData.find(data => data._id === date)
        return {
            date,
            totalSales: foundData ? foundData.totalSales : 0,
            totalRevenue: foundData ? foundData.totalRevenue : 0
        }
    })
}


function getDatesInRange(startDate, endDate) {
    const currentDate = new Date(startDate)
    const dates = []
    while (date <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0])
        date.setDate(date.getDate() + 1)
    }
    return dates
}   