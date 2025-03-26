// ✅ Step 2: Create Invoice.model.js

const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        totalPrice: Number,
        _id: false,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    totalAmountWithGST: {
      type: Number,
    },
    withGST: {
      type: Boolean,
      default: false,
    },
    gstRate: {
      type: Number,
    },
    customerName: String,
    customerAddress: String,
    customerGST: String,
    customerState: String,
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
