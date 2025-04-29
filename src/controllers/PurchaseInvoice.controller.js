const PurchaseInvoice = require("../models/Purchase.model");
const Product = require("../models/Product");

const createInvoice = async (req, res) => {
  try {
    const { supplier, invoiceNumber, date, items, gstType, gstRate } = req.body;

    if (!supplier || !invoiceNumber || !date || !items || items.length === 0) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    let totalAmount = 0;

    // Loop through all items
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
      product.stock = newTotalStock;
      await product.save();

      totalAmount += Number(item.price) * purchaseQuantity;
    }

    // ✅ Calculate GST if required
    let totalAmountWithGST = totalAmount;
    let withGST = false;

    if (gstType === "with" && gstRate > 0) {
      withGST = true;
      totalAmountWithGST = totalAmount + (totalAmount * gstRate) / 100;
    }

    // Save Invoice
    const newInvoice = new PurchaseInvoice({
      supplier,
      invoiceNumber,
      date,
      items,
      totalAmount,
      totalAmountWithGST,
      withGST,   // ✅ Also save this
      gstType,
      gstRate,
    });

    await newInvoice.save();

    res.status(201).json({ message: "Invoice created successfully", invoice: newInvoice });

  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Server error while creating invoice" });
  }
};






const getPurchaseSummary = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 3;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));

    const invoices = await PurchaseInvoice.find({
      date: { $gte: startDate, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    const result = [];

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);

      const nextDate = new Date(targetDate);
      nextDate.setDate(targetDate.getDate() + 1);

      const dayInvoices = invoices.filter(
        (inv) => inv.date >= targetDate && inv.date < nextDate
      );

      const total = dayInvoices.reduce((sum, inv) => {
        const withGST = inv.gstType === "with";
        const gstRate = inv.gstRate || 0;
        return sum + (withGST ? inv.totalAmount * (1 + gstRate / 100) : inv.totalAmount);
      }, 0);

      result.push({
        date: targetDate.toISOString().split("T")[0],
        total,
      });
    }

    res.status(200).json(result.reverse());
  } catch (err) {
    console.error("❌ Failed to generate purchase summary", err);
    res.status(500).json({ message: "Server error" });
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


  const getSummaryByDates = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
  
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required." });
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the full end date till 11:59PM
  
      const result = await PurchaseInvoice.aggregate([
        {
          $match: {
            date: { $gte: start, $lte: end },
          },
        },
        {
          $project: {
            total: {
              $cond: {
                if: { $eq: ["$gstType", "with"] },
                then: { $add: ["$totalAmount", { $multiply: ["$totalAmount", { $divide: ["$gstRate", 100] }] }] },
                else: "$totalAmount",
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalPurchase: { $sum: "$total" },
          },
        },
      ]);
  
      res.status(200).json({
        totalPurchase: result[0]?.totalPurchase || 0,
      });
    } catch (error) {
      console.error("Error fetching purchase summary:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };
  
  
  
  
  

module.exports = {
  createInvoice, getAllInvoices,
  getInvoiceById,
  getInvoicesBySupplier,
  getInvoicesByDate,
  deleteInvoice,
  getPurchaseSummary,
  getSummaryByDates
};
