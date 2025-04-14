const Invoice = require("../models/Invoice.model");
const httpStatus = require("http-status");
const {OrdersModel}=require("../models")

// ✅ Helper function: Auto-generate invoice number
const generateNextInvoiceNumber = async (firm) => {
  const prefix = firm === "shreesai" ? "SSS" : "DJT";

// ✅ Only find invoices starting with that prefix
const latestOrder = await OrdersModel
  .find({ invoiceNumber: { $regex: `^${prefix}/` }, firm })
  .sort({ createdAt: -1 })
  .limit(1);

let nextNumber = 1;

if (latestOrder.length > 0 && latestOrder[0].invoiceNumber) {
  const parts = latestOrder[0].invoiceNumber.split("/");
  if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
    nextNumber = parseInt(parts[1]) + 1;
  }
}

let invoiceNumber;
let exists = true;

// ✅ Check until we find a unique invoice number
while (exists) {
  invoiceNumber = `${prefix}/${String(nextNumber).padStart(4, "0")}`;
  const check = await OrdersModel.findOne({ invoiceNumber });
  if (!check) {
    exists = false;
  } else {
    nextNumber++;
  }
}
return invoiceNumber;

};


const InvoiceController = {
  // ✅ Create Invoice with auto invoiceNumber
  createInvoice: async (req, res) => {
    try {
    
      const invoiceNumber = await generateNextInvoiceNumber(req.body.firm);
      // generate new serial
      const invoiceData = { ...req.body, invoiceNumber };

      const invoice = new Invoice(invoiceData);
      const savedInvoice = await invoice.save();

      res.status(httpStatus.CREATED).json({ success: true, invoice: savedInvoice });
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
