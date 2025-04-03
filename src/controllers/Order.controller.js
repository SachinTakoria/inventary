const httpStatus = require("http-status");
const CatchAsync = require("../utils/CatchAsync");
const OrderService = require("../services/Orders.service");
const Product = require("../models/Product");
const { UserModel, OrdersModel } = require("../models");

class OrdersController {
  static createOrder = CatchAsync(async (req, res) => {
    try {
      const {
        user,
        consumer,
        items,
        customerName,
        customerAddress,
        customerGST,
        customerState,
        customerPhone,
        withGST,
        gstRate,
        amountPaid,
        oldPendingAdjusted,
        carryForward,
        firm, // ✅ NEW - from frontend
      } = req.body;


      let totalAmount = req.body.totalAmount || 0;
      const formattedItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            message: `❌ Product not found in inventory!`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `❌ Not enough stock for '${product.productName}', available: ${product.stock}`,
          });
        }

        const itemTotal = product.price * item.quantity;
        if (!req.body.totalAmount) {
          totalAmount += itemTotal; // ✅ only calculate if not sent from frontend
        }

        formattedItems.push({
          name: product.productName,
          price: product.price,
          quantity: item.quantity,
          totalPrice: itemTotal,
          hsn: item.hsn || "",
          _id: product._id,
        });

        product.stock -= item.quantity;
        await product.save();
      }

      let totalAmountWithGST = totalAmount;
      if (withGST && gstRate) {
        totalAmountWithGST += (totalAmount * gstRate) / 100;
      }

      // ✅ Firm-wise Invoice Number Logic
      const prefix = firm === "shreesai" ? "SSS" : "DJT";
      const latestOrder = await OrdersModel.findOne({ firm }) // filter by firm
        .sort({ createdAt: -1 });

      let nextNumber = 1;

      if (latestOrder?.invoiceNumber) {
        const last = parseInt(latestOrder.invoiceNumber.split("/")[1]);
        if (!isNaN(last)) nextNumber = last + 1;
      }

      const invoiceNumber = `${prefix}/${String(nextNumber).padStart(4, "0")}`;

      const newOrder = await OrderService.createOrder(req?.user, {
        user,
        consumer,
        items: formattedItems,
        totalAmount,
        totalAmountWithGST,
        withGST,
        gstRate,
        customerName,
        customerPhone,
        customerAddress,
        customerGST,
        customerState,
       
        oldPendingAdjusted,
        amountPaid,
        carryForward,
        invoiceNumber,
        firm, // ✅ pass firm to DB
      });

      return res
        .status(httpStatus.CREATED)
        .json({ success: true, order: newOrder });
    } catch (error) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "❌ Failed to create order" });
    }
  });

  static getAllorders = CatchAsync(async (req, res) => {
    const { page, query, firm } = req.query;
    const res_obj = await OrderService.getAllorders(
      req.user,
      page,
      query,
      firm
    );
    return res.status(httpStatus.OK).json({
      success: true,
      orders: res_obj.data,
      hasMore: res_obj.hasMore,
    });
  });

  //   static getAllOrders = CatchAsync(async (req, res) => {
  //     try {
  //         const orders = await OrdersModel.find().sort({ createdAt: -1 });
  //         return res.status(httpStatus.OK).json({ success: true, orders });
  //     } catch (error) {
  //         console.error("🔥 Error fetching orders:", error);
  //         return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Failed to fetch orders" });
  //     }
  // });

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

      const res_obj = await OrderService.deleteOrder(
        req?.user,
        req?.params?.id
      );
      return res
        .status(httpStatus.OK)
        .json({ message: "Order deleted and stock restored", res_obj });
    } catch (error) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to delete order" });
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

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate >= startOfToday) {
          todaySale += order.totalAmount;
        } else if (
          orderDate >= startOfYesterday &&
          orderDate < endOfYesterday
        ) {
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
      res.status(500).json({ message: "Failed to get sales stats" });
    }
  });

  static getInvoiceById = CatchAsync(async (req, res) => {
    const order = await OrdersModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    return res.status(httpStatus.OK).json({ order });
  });

  static getSaleSummaryByDate = CatchAsync(async (req, res) => {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);

    const orders = await OrdersModel.find({
      createdAt: {
        $gte: selectedDate,
        $lt: nextDay,
      },
    });

    let totalSale = 0;
    orders.forEach((order) => {
      totalSale += order.totalAmount;
    });

    res.status(200).json({
      date: date,
      totalSale,
    });
  });

  static getOrdersByCustomerPhone = CatchAsync(async (req, res) => {
    const { phone } = req.query;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const orders = await OrderService.getOrdersByPhone(phone);

    res.status(200).json({ success: true, orders });
  });

  static getPendingAmountByPhone = CatchAsync(async (req, res) => {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const pendingAmount = await OrderService.calculatePendingByPhone(phone);

    return res.status(httpStatus.OK).json({ pendingAmount });
  });
}

module.exports = OrdersController;
