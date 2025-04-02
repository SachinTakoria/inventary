const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// ✅ Create Category
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    const category = new Category({ name });
    await category.save();
    res.status(201).json({ message: "Category added successfully", category });
  } catch (err) {
    res.status(500).json({ message: "Error creating category", error: err });
  }
});

// ✅ Get All Categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err });
  }
});

// ✅ Delete Category
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted", category: deleted });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", error: err });
  }
});

module.exports = router;
