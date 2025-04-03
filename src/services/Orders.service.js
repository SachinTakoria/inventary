const httpStatus = require("http-status");
const { OrdersModel } = require("../models");
const ApiError = require("../utils/ApiError");

class OrderService {
  // ✅ Create Order (With GST Calculation)
  static async createOrder(user, body) {
    try {
      const {
        consumer,
        items,
        withGST,
        gstRate,
        customerName,
        customerAddress,
        customerGST,
        customerPhone,
        customerState,
        
        oldPendingAdjusted,
        amountPaid,
        carryForward,
        invoiceNumber,
        firm,
      } = body;

      // ✅ Total Amount Calculation
      let totalAmount = items.reduce((sum, item) => sum + item.price, 0);

      // ✅ GST Amount Calculation
      let totalAmountWithGST = totalAmount;
      if (withGST) {
        const gstAmount = (totalAmount * gstRate) / 100;
        totalAmountWithGST += gstAmount;
      }

      // ✅ Order Create with GST
      const newOrder = await OrdersModel.create({
        user,
        consumer,
        items,
        withGST,
        gstRate,
        totalAmount,
        totalAmountWithGST,
        customerName,
        customerAddress,
        customerGST,
        customerPhone,
        customerState,
        invoiceNumber, // ✅
        firm, // ✅
        amountPaid,
        oldPendingAdjusted,
        carryForward,
      });

      return newOrder; // ✅ return full order instead of just msg
    } catch (error) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  // ✅ Get All Orders
  static async getAllorders(user, page = 1, query, firm) {
    const limit = 10;
    const perPage = (Number(page) - 1) * limit;

    const queryies = {
      ...(firm ? { firm } : {}),
      ...(query
        ? {
            items: {
              $elemMatch: {
                name: { $regex: query, $options: "i" },
              },
            },
          }
        : {}),
      ...(user?._id ? { user: user._id } : {}), // ✅ Fix here
    };

    const data = await OrdersModel.find(queryies)
      .populate("consumer", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(perPage);

    const documents = await OrdersModel.countDocuments(queryies);
    const hasMore = perPage + limit < documents;

    return {
      data,
      hasMore,
    };
  }

  // ✅ Delete Order
  static async deleteOrder(user, id) {
    const existOrder = await OrdersModel.findOne({ user, _id: id });

    if (!existOrder) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order Not Found");
      return;
    }

    await OrdersModel.findByIdAndDelete(existOrder._id);

    return {
      msg: "Order Deleted Successfully",
    };
  }

  // ✅ Get Invoice By ID (With GST Details)
  static async getInvoiceById(user, id) {
    const order = await OrdersModel.findOne({ user, _id: id })
      .select(
        "consumer user items totalAmount totalAmountWithGST withGST gstRate createdAt"
      )
      .populate("consumer", "name email address -_id")
      .populate("user", "name -_id");

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order Not Found");
      return;
    }

    return order;
  }

  // ✅ Get all orders for stats (today, yesterday sales)
  static async getAllOrdersForStats() {
    try {
      // No filtering, get all orders with totalAmount & createdAt
      return await OrdersModel.find({}, "totalAmount createdAt");
    } catch (error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to get orders for stats"
      );
    }
  }

  static async getOrdersByPhone(phone) {
    return await OrdersModel.find({ customerPhone: phone }).sort({
      createdAt: -1,
    });
  }

  static async calculatePendingByPhone(phone) {
    const orders = await OrdersModel.find({ customerPhone: phone });

    let totalPending = 0;
    for (const order of orders) {
      totalPending += order.carryForward || 0;
    }

    return totalPending;
  }
}

module.exports = OrderService;
