const router = require("express").Router();
const Purchase = require("../models/Purchase.model");
const Product = require("../models/Product");


// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch products", error: err });
  }
});




// ✅ Add Purchase (and auto-update product)
router.post("/", async (req, res) => {
  try {
    const { product, supplier, quantity, price, date } = req.body;

    const newPurchase = await Purchase.create({ product, supplier, quantity, price, date });

    // ✅ Auto-update product total stock + avg purchase price
    const allPurchases = await Purchase.find({ product });

    const totalQty = allPurchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalAmount = allPurchases.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    const avgPrice = totalAmount / totalQty;

    await Product.findByIdAndUpdate(product, {
      $inc: { stock: quantity },
      avgPurchasePrice: avgPrice.toFixed(2)
    });

    res.status(201).json({ message: "✅ Purchase Added", purchase: newPurchase });
  } catch (err) {
    console.error("Error adding purchase:", err);
    res.status(500).json({ message: "❌ Failed to add purchase", error: err });
  }
});

// ✅ Get All Purchases for a Product
router.get("/product/:id", async (req, res) => {
  try {
    const data = await Purchase.find({ product: req.params.id }).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch purchase history", error: err });
  }
});

module.exports = router;
