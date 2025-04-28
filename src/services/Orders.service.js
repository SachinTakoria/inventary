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
        consignee,
        createdAt,
        oldPendingAdjusted,
        amountPaid,
        carryForward,
        invoiceNumber,
        firm,
        discountPercent = 0,         // ✅ new
        discountAmount = 0,          // ✅ new
      } = body;
  
      // ✅ Subtotal calculation
      let totalAmount = items.reduce((sum, item) => {
        const discount = item.discount || 0;
        const discountedPrice = item.price - (item.price * discount) / 100;
        return sum + discountedPrice * item.quantity;
      }, 0);
      
  
      // ✅ Apply discount (if any)
      if (discountPercent > 0) {
        const calculatedDiscount = (totalAmount * discountPercent) / 100;
        totalAmount -= calculatedDiscount;
      } else if (discountAmount > 0) {
        totalAmount -= discountAmount;
      }
  
      // ✅ GST Amount Calculation
      let totalAmountWithGST = totalAmount;
      if (withGST) {
        const gst = (totalAmount * gstRate) / 100;
        totalAmountWithGST += gst;
      }
  
      // ✅ Order Create
      const newOrder = await OrdersModel.create({
        user,
        consumer,
        items,
        withGST,
        gstRate,
        discountPercent,
        discountAmount,
        totalAmount,
        totalAmountWithGST,
        customerName,
        customerAddress,
        customerGST,
        customerPhone,
        customerState,
        consignee,
        invoiceNumber,
        firm,
        amountPaid,
        oldPendingAdjusted,
        carryForward,
        createdAt,
      });
  
      return newOrder;
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
      return await OrdersModel.find({}, "totalAmount totalAmountWithGST withGST createdAt");
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

  // ✅ Update Payment By Invoice Number
static async updatePaymentByInvoice(invoiceId, amountPaid) {
  const order = await OrdersModel.findOne({ invoiceNumber: invoiceId });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  order.amountPaid = (order.amountPaid || 0) + Number(amountPaid);  // ✅ Payment add ho rahi hai
  order.carryForward = order.carryForward - Number(amountPaid);     // ✅ Only carryForward ko adjust karo
  

  await order.save();
  return order;
}

}

module.exports = OrderService;
