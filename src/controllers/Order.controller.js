const httpStatus = require("http-status"); 
const CatchAsync = require("../utils/CatchAsync"); 
const OrderService = require("../services/Orders.service");
const Product = require("../models/Product"); 
const { UserModel, OrdersModel } = require("../models");


class OrdersController {
    static createOrder = CatchAsync(async (req, res) => {
        try {
          const { user, consumer, items, customerName, customerAddress, customerGST, customerState, withGST, gstRate } = req.body;
      
          console.log("📥 Received Items:", items);
      
          let totalAmount = 0;
          const formattedItems = [];
      
          for (const item of items) {
            const product = await Product.findById(item.productId);
      
            if (!product) {
              return res.status(404).json({ message: `❌ Product not found in inventory!` });
            }
      
            if (product.stock < item.quantity) {
              return res.status(400).json({ message: `❌ Not enough stock for '${product.productName}', available: ${product.stock}` });
            }
      
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;
      
            formattedItems.push({
              name: product.productName,
              price: product.price,
              quantity: item.quantity,
              totalPrice: itemTotal,
              _id: product._id
            });
      
            // ✅ Reduce stock
            product.stock -= item.quantity;
            await product.save();
          }
      
          // ✅ Calculate GST if needed
          let totalAmountWithGST = totalAmount;
          if (withGST && gstRate) {
            totalAmountWithGST += (totalAmount * gstRate) / 100;
          }
      
          // ✅ Save Order
          const newOrder = await OrderService.createOrder(req?.user, {
            user,
            consumer,
            items: formattedItems,
            totalAmount,
            totalAmountWithGST,
            withGST,
            gstRate,
            customerName,
            customerAddress,
            customerGST,
            customerState
          });
      
          return res.status(httpStatus.CREATED).json({ success: true, order: newOrder });
      
        } catch (error) {
          console.error("🔥 Error creating order:", error);
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "❌ Failed to create order" });
        }
      });
      

      static getAllorders = CatchAsync(async (req, res) => {
        const res_obj = await OrderService.getAllorders(req?.user, req.query?.page, req.query?.query);
        return res.status(httpStatus.OK).json(res_obj);
    });
    

    static getAllOrders = CatchAsync(async (req, res) => {
      try {
          const orders = await OrdersModel.find().sort({ createdAt: -1 });
          return res.status(httpStatus.OK).json({ success: true, orders });
      } catch (error) {
          console.error("🔥 Error fetching orders:", error);
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Failed to fetch orders" });
      }
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
