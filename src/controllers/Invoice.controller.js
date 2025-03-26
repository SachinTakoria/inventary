// ✅ Step 1: Create Invoice.controller.js

const Invoice = require("../models/Invoice.model");
const httpStatus = require("http-status");

const InvoiceController = {
  // ✅ Create Invoice
  createInvoice: async (req, res) => {
    try {
      const invoice = new Invoice(req.body);
      await invoice.save();
      res.status(httpStatus.CREATED).json({ success: true, invoice });
    } catch (error) {
      console.error("🔥 Error creating invoice:", error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Failed to create invoice" });
    }
  },

  // ✅ Get All Invoices
  getInvoices: async (req, res) => {
    try {
      const invoices = await Invoice.find().sort({ createdAt: -1 });
      res.status(httpStatus.OK).json({ success: true, invoices });
    } catch (error) {
      console.error("🔥 Error fetching invoices:", error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Failed to fetch invoices" });
    }
  },
};

module.exports = InvoiceController;
