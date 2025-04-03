const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  supplier: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });


module.exports = mongoose.model("Purchase", purchaseSchema);
