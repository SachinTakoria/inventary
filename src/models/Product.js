const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    stock: { type: Number, default:0 },
    avgPurchasePrice: { type: Number, default: 0 },
    warehouse: { type: String, required: true },
    supplier: { type: String, required: true },
    status: { type: String, required: true },
    images: [{ type: String }]
});

module.exports = mongoose.model("Product", ProductSchema);
