const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    stock: { type: Number, default:0 },
    avgPurchasePrice: { type: Number, default: 0 },
   
    images: [{ type: String }]
});

module.exports = mongoose.model("Product", ProductSchema);
