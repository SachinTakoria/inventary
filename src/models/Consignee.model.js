const mongoose = require("mongoose");

const ConsigneeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: String,
    gstin: String,
    pan: String,
    state: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Consignee", ConsigneeSchema);
