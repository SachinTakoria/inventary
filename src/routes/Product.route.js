const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/", upload.single("images"), async (req, res) => {
  try {
    const { productName, category, brand, warehouse,receivedStock, supplier, status } =
      req.body;
    const price = parseFloat(req.body.price);
    const stock = parseInt(req.body.stock, 10);
    const received = parseInt(receivedStock, 10);

    if (
      !productName ||
      !price ||
      !category ||
      !brand ||
      !stock ||
      !warehouse ||
      !supplier ||
      !status ||
      !received
    ) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const imagePath = req.file ? req.file.path : null;

    const newProduct = new Product({
      productName,
      price,
      category,
      brand,
      stock,
      receivedStock: received, 
      warehouse,
      supplier,
      status,
      images: imagePath,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "✅ Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const {
      productName,
      price,
      brand,
      stock,
      receivedStock,
      warehouse,
      supplier,
      status,
      category
    } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        productName,
        price,
        brand,
        stock,
        receivedStock,
        warehouse,
        supplier,
        status,
        category
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "✅ Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "❌ Error updating product",
      error,
    });
  }
});



router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({
        message: "Product deleted successfully",
        product: deletedProduct,
      });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
});

module.exports = router;
