// backend/src/controllers/Invoice.controller.js

const Invoice = require("../models/Invoice.model");
const httpStatus = require("http-status");
const path = require("path");
const fs = require("fs");

const InvoiceController = {
 
  createInvoice: async (req, res) => {
    try {
      const invoice = new Invoice(req.body); // Invoice number already comes from Order.controller.js
      const savedInvoice = await invoice.save();
  
      // ✅ Generate PDF after saving invoice
      try {
        const pdfUrl = await generateInvoicePDF(savedInvoice.invoiceNumber);
        savedInvoice.pdfUrl = pdfUrl;
        await savedInvoice.save();
      } catch (pdfError) {
       
      }
  
      res.status(httpStatus.CREATED).json({
        success: true,
        invoice: savedInvoice,
      });
    } catch (error) {
     
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
    
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch invoices",
      });
    }
  },

  // ✅ Public PDF download route
  downloadInvoicePDF: async (req, res) => {
    const { invoiceNumber } = req.params;

    const filePath = path.join(__dirname, "..", "public", "invoices", `${invoiceNumber}.pdf`);


    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.download(filePath); // prompts download
  },
};

module.exports = InvoiceController;
