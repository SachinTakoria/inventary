const Consignee = require("../models/Consignee.model");
const httpStatus = require("http-status");
const mongoose = require("mongoose");

const ConsigneeController = {
  // ✅ Add new consignee
  createConsignee: async (req, res) => {
    try {
      const { name, address, gstin, pan, state } = req.body;
      const userId = req.user._id;

      const newConsignee = await Consignee.create({
        name,
        address,
        gstin,
        pan,
        state,
        user: userId,
      });

      return res
        .status(httpStatus.CREATED)
        .json({ success: true, consignee: newConsignee });
    } catch (error) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "❌ Failed to add consignee" });
    }
  },

  // ✅ Get all consignees of user
  getUserConsignees: async (req, res) => {
    try {
      const userId = req.user._id;
      const consignees = await Consignee.find({ user: userId }).sort({
        createdAt: -1,
      });

      return res
        .status(httpStatus.OK)
        .json({ success: true, consignees });
    } catch (error) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "❌ Failed to fetch consignees" });
    }
  },

  // ✅ Delete consignee by ID
  deleteConsignee: async (req, res) => {
    try {
      const { id } = req.params;
  
      // console.log("🗑️ Deleting consignee ID:", id);
  
      // Check valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "❌ Invalid Consignee ID",
        });
      }
  
      const deleted = await Consignee.findByIdAndDelete(id);
  
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "❌ Consignee not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "✅ Consignee deleted",
      });
    } catch (error) {
      // console.error("❌ Delete Error:", error);
      return res.status(500).json({
        success: false,
        message: "❌ Failed to delete consignee",
      });
    }
  },

  // ✅ Update consignee
  
updateConsignee: async (req, res) => {
  try {
    const { id } = req.params;

    // console.log("🛠️ Consignee ID to update:", id);
    // console.log("🧪 Body:", req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid Consignee ID",
      });
    }

    const consignee = await Consignee.findById(id);
    if (!consignee) {
      // console.log("❌ Not found in DB");
      return res.status(404).json({
        success: false,
        message: "❌ Consignee not found",
      });
    }

    // console.log("✅ Consignee found, updating...");

    Object.assign(consignee, req.body);

    try {
      await consignee.save();
    } catch (saveErr) {
      // console.log("❌ Save Error:", saveErr);
      return res.status(500).json({
        success: false,
        message: "❌ Failed to save consignee",
      });
    }

    return res.status(200).json({
      success: true,
      consignee,
    });
  } catch (error) {
    // console.log("❌ Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "❌ Failed to update consignee",
    });
  }
}
  
};

module.exports = ConsigneeController;
