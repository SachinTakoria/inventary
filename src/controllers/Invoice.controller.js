const Invoice = require("../models/Invoice.model");
const httpStatus = require("http-status");

// ✅ Helper function: Auto-generate invoice number
const generateNextInvoiceNumber = async () => {
  const prefix = "DJT"; // Change as per firm if needed later

  const latestInvoice = await Invoice.findOne({})
    .sort({ createdAt: -1 })
    .limit(1);

  let nextNumber = 1;

  if (latestInvoice && latestInvoice.invoiceNumber) {
    const lastNumber = parseInt(latestInvoice.invoiceNumber.split("/")[1]);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const invoiceNumber = `${prefix}/${String(nextNumber).padStart(4, "0")}`;
  return invoiceNumber;
};

const InvoiceController = {
  // ✅ Create Invoice with auto invoiceNumber
  createInvoice: async (req, res) => {
    try {
      const invoiceNumber = await generateNextInvoiceNumber(); // generate new serial
      const invoiceData = { ...req.body, invoiceNumber };

      const invoice = new Invoice(invoiceData);
      await invoice.save();

      res.status(httpStatus.CREATED).json({ success: true, invoice });
    } catch (error) {
     
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
     
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Failed to fetch invoices" });
    }
  },
};

module.exports = InvoiceController;
