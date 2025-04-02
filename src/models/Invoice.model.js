const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        totalPrice: Number,
        hsn: String, // ✅ HSN Code added
        _id: false,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    totalAmountWithGST: Number,
    withGST: {
      type: Boolean,
      default: false,
    },
    gstRate: Number,
    customerName: String,
    customerAddress: String,
    customerGST: String,
    customerState: String,
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
