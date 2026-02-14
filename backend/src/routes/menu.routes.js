const express = require("express");
const router = express.Router();
const Menu = require("../models/menu.model");

// Get all menu items
router.get("/", async (req, res) => {
  try {
    const menuItems = await Menu.find({ available: true });
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new menu item (admin only)
router.post("/", async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    const menuItem = new Menu({ name, category, price, description });
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update menu item (admin only)
router.put("/:id", async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(menuItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete menu item (admin only)
router.delete("/:id", async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
