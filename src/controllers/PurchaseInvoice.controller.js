const PurchaseInvoice = require("../models/Purchase.model");
const Product = require("../models/Product");

const createInvoice = async (req, res) => {
  try {
    const { supplier, invoiceNumber, date, items, gstType, gstRate } = req.body;

    if (!supplier || !invoiceNumber || !date || !items || items.length === 0) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    let totalAmount = 0;

    // Loop through all items to calculate totals and update stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      const previousStock = Number(product.stock) || 0;
      const purchaseQuantity = parseInt(item.quantity) || 0;

      if (purchaseQuantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity for product: ${product.productName}` });
      }

      const newTotalStock = previousStock + purchaseQuantity;

      // ✅ Just update the stock
      product.stock = newTotalStock;

      await product.save();

     

      // Total amount add karo invoice ke liye
      totalAmount += Number(item.price) * purchaseQuantity;
    }

    // Final: Invoice Save karo
    const newInvoice = new PurchaseInvoice({
      supplier,
      invoiceNumber,
      date,
      items,
      totalAmount,
      gstType,
      gstRate,
    });

    await newInvoice.save();

    res.status(201).json({ message: "Invoice created successfully", invoice: newInvoice });

  } catch (error) {
  
    res.status(500).json({ message: "Server error while creating invoice" });
  }
};





const getAllInvoices = async (req, res) => {
    try {
      const invoices = await PurchaseInvoice.find().populate("items.product").sort({ createdAt: -1 });
      res.json(invoices);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch invoices", error: err });
    }
  };


  const getInvoiceById = async (req, res) => {
    try {
      const invoice = await PurchaseInvoice.findById(req.params.id).populate("items.product");
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      res.json(invoice);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch invoice", error: err });
    }
  };



  const getInvoicesBySupplier = async (req, res) => {
    try {
      const invoices = await PurchaseInvoice.find({ supplier: req.params.name }).populate("items.product");
      res.json(invoices);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch supplier invoices", error: err });
    }
  };

  const getInvoicesByDate = async (req, res) => {
    try {
      const targetDate = new Date(req.params.date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);
  
      const invoices = await PurchaseInvoice.find({
        date: { $gte: targetDate, $lt: nextDay }
      }).populate("items.product");
  
      res.json(invoices);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch invoices by date", error: err });
    }
  };

  const deleteInvoice = async (req, res) => {
    try {
      const invoice = await PurchaseInvoice.findByIdAndDelete(req.params.id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      res.json({ message: "Invoice deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete invoice", error: err });
    }
  };
  
  
  
  

module.exports = {
  createInvoice, getAllInvoices,
  getInvoiceById,
  getInvoicesBySupplier,
  getInvoicesByDate,
  deleteInvoice
};
