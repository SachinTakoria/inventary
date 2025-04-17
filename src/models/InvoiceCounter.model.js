const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  firm: { type: String, required: true, unique: true },
  lastNumber: { type: Number, default: 0 },
});

module.exports = mongoose.model("InvoiceCounter", counterSchema);
