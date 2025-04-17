// backend/src/controllers/Invoice.controller.js

const Invoice = require("../models/Invoice.model");
const httpStatus = require("http-status");

const InvoiceController = {
  // ✅ Create Invoice (no invoice number generation here)
  createInvoice: async (req, res) => {
    try {
      const invoice = new Invoice(req.body); // Invoice number already comes from Order.controller.js
      const savedInvoice = await invoice.save();

      res.status(httpStatus.CREATED).json({
        success: true,
        invoice: savedInvoice,
      });
    } catch (error) {
      console.error("❌ Error in createInvoice:", error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to create invoice",
      });
    }
  },

  // ✅ Get all invoices
  getInvoices: async (req, res) => {
    try {
      const invoices = await Invoice.find().sort({ createdAt: -1 });
      res.status(httpStatus.OK).json({
        success: true,
        invoices,
      });
    } catch (error) {
      console.error("❌ Error in getInvoices:", error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch invoices",
      });
    }
  },

  // ✅ Add more methods if needed...
};

module.exports = InvoiceController;
