const httpStatus = require("http-status"); 
const CatchAsync = require("../utils/CatchAsync"); 
const OrderService = require("../services/Orders.service");
const Product = require("../models/Product"); 
const { UserModel, OrdersModel } = require("../models");

class OrdersController {
    static createOrder = CatchAsync(async (req, res) => {
        try {
            const { user, consumer, items } = req.body;
    
            let totalAmount = 0;
            const formattedItems = [];

            for (const item of items) {
                const product = await Product.findOne({ productName: item.name });

                if (!product) {
                    return res.status(404).json({ message: `Product '${item.name}' not found in inventory!` });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({ message: `Not enough stock for '${item.name}', available: ${product.stock}` });
                }

                const itemTotal = item.price * item.quantity;
                totalAmount += itemTotal;

                formattedItems.push({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    totalPrice: itemTotal
                });
            }

            const newOrder = await OrderService.createOrder(req?.user, {
                user,
                consumer,
                items: formattedItems,
                totalAmount
            });

            for (const item of items) {
                const product = await Product.findOne({ productName: item.name });

                if (product) {
                    product.stock -= item.quantity;
                    await product.save();
                }
            }

            return res.status(httpStatus.CREATED).json(newOrder);
        } catch (error) {
            console.error("Error creating order:", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to create order" });
        }
    });

    static getAllorders = CatchAsync(async (req, res) => {
        const res_obj = await OrderService.getAllorders(req?.user, req.query?.page, req.query?.query);
        return res.status(httpStatus.OK).json(res_obj);
    });

    static deleteOrder = CatchAsync(async (req, res) => {
        try {
            const order = await OrderService.getOrderById(req?.user, req?.params?.id);

            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            for (const item of order.items) {
                const product = await Product.findOne({ name: item.name });

                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }

            const res_obj = await OrderService.deleteOrder(req?.user, req?.params?.id);
            return res.status(httpStatus.OK).json({ message: "Order deleted and stock restored", res_obj });

        } catch (error) {
            console.error("Error deleting order:", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete order" });
        }
    });

    static getSalesStats = CatchAsync(async (req, res) => {
        try {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfToday.getDate() - 1);

            const endOfYesterday = new Date(startOfToday);

            const orders = await OrderService.getAllOrdersForStats();

            let todaySale = 0;
            let yesterdaySale = 0;

            orders.forEach(order => {
                const orderDate = new Date(order.createdAt);
                if (orderDate >= startOfToday) {
                    todaySale += order.totalAmount;
                } else if (orderDate >= startOfYesterday && orderDate < endOfYesterday) {
                    yesterdaySale += order.totalAmount;
                }
            });

            const totalUsers = await UserModel.countDocuments();
            const totalOrders = await OrdersModel.countDocuments();

            res.status(200).json({
                todaySale,
                yesterdaySale,
                totalUsers,
                totalOrders,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Failed to get sales stats" });
        }
    });

    static getInvoiceById = CatchAsync(async (req, res) => {
        const res_obj = await OrderService.getInvoiceById(req?.user, req?.params?.id);
        return res.status(httpStatus.OK).json(res_obj);
    });
}

module.exports = OrdersController;
