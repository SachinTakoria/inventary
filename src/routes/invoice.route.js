// ✅ Step 5: Create Invoice.route.js

const express = require("express");
const router = express.Router();
const InvoiceController = require("../controllers/Invoice.controller");

// POST /api/v1/invoices - Create Invoice
router.post("/", InvoiceController.createInvoice);

// GET /api/v1/invoices - Get All Invoices
router.get("/", InvoiceController.getInvoices);

// ✅ NEW: Get invoice by ID
// router.get("/get/:id", InvoiceController.getInvoiceById);

// 📁 routes/invoice.routes.js
// router.get("/public-download/:invoiceNumber", InvoiceController.downloadInvoicePDF);


router.get('/download/:invoiceNumber', InvoiceController.downloadInvoicePDF);



module.exports = router;
