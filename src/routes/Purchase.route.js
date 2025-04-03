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
  const { product, supplier, quantity, price, date } = req.body;

  // 1. Pehle purchase save karo
  const newPurchase = await Purchase.create({ product, supplier, quantity, price, date });

  // 2. Phir us product ke saare purchases nikalo
  const allPurchases = await Purchase.find({ product });

  // 3. Total quantity aur total amount nikaalo
  const totalQty = allPurchases.reduce((sum, p) => sum + p.quantity, 0);
  const totalAmount = allPurchases.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const avgPrice = totalAmount / totalQty;

  // 4. Product ka stock update karo
  await Product.findByIdAndUpdate(product, {
    $inc: { stock: quantity }, // increase stock
    avgPurchasePrice: avgPrice.toFixed(2), // set avg price
  });

  res.status(201).json({ message: "✅ Purchase Added", purchase: newPurchase });
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


// DELETE /purchases/:id
router.delete("/:id", async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) return res.status(404).json({ message: "Purchase not found" });

  // Get quantity & product ID
  const { product, quantity } = purchase;

  // Delete purchase
  await Purchase.findByIdAndDelete(req.params.id);

  // Decrease stock
  await Product.findByIdAndUpdate(product, { $inc: { stock: -quantity } });

  res.status(200).json({ message: "Purchase deleted and stock updated" });
});


module.exports = router;
