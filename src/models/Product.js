const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    stock: { type: Number, required: true },
    receivedStock: { type: Number, required: false },
    warehouse: { type: String, required: true },
    supplier: { type: String, required: true },
    status: { type: String, required: true },
    images: [{ type: String }]
});

module.exports = mongoose.model("Product", ProductSchema);
