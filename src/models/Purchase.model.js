const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  remark: { type: String },
});

const purchaseInvoiceSchema = new mongoose.Schema({
  supplier: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  date: { type: Date, required: true },
  gstType: { type: String, enum: ["with", "without"], default: "without" },
gstRate: { type: Number, default: 0 },

  items: [purchaseItemSchema], // multiple products in one invoice
  totalAmount: { type: Number, default: 0 }, // sum of all item amounts
}, { timestamps: true });

module.exports = mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);
