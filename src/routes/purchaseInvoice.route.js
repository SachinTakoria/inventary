const router = require("express").Router();
const { createInvoice ,getAllInvoices,
    getInvoiceById,
    getInvoicesBySupplier,
    getInvoicesByDate,
    deleteInvoice} = require("../controllers/PurchaseInvoice.controller");

// ✅ Route to Create a New Multi-Product Invoice
router.post("/create", createInvoice); // ✅ Only /create
router.get("/all", getAllInvoices);
router.get("/:id", getInvoiceById);
router.get("/by-supplier/:name", getInvoicesBySupplier);
router.get("/by-date/:date", getInvoicesByDate);
router.delete("/:id", deleteInvoice);


module.exports = router;
