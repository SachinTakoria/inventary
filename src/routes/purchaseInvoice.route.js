const router = require("express").Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoicesBySupplier,
  getInvoicesByDate,
  deleteInvoice,
  getPurchaseSummary, getSummaryByDates// ✅ Daily summary controller import bhi
} = require("../controllers/PurchaseInvoice.controller");

// ✅ Route to Create a New Multi-Product Invoice
router.post("/create", createInvoice);

// ✅ Route to Get All Invoices
router.get("/all", getAllInvoices);

// ✅ Specific filter routes pehle likho (important for avoiding route conflicts)
router.get("/by-supplier/:name", getInvoicesBySupplier);
router.get("/by-date/:date", getInvoicesByDate);
router.get("/purchase-summary", getPurchaseSummary);
router.get("/summary-by-dates", getSummaryByDates);
 // ✅ Daily purchase amount summary

// ✅ Dynamic routes sabse last me
router.get("/:id", getInvoiceById);
router.delete("/:id", deleteInvoice);



module.exports = router;
