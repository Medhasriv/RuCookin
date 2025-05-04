const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Import User and Cart models
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

require("../../schemas/Cart.js");
const Cart = mongoose.model("CartInfo");

// Utility to extract user ID from JWT
const { getUserIdFromToken } = require("../../utils/TokenDecoder");

// GET cart items
router.get("/", async (req, res) => {
  const user = getUserIdFromToken(req);
  const userId = user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    const userCart = await Cart.findOne({ userId });
    return res.status(200).json(userCart ? userCart.cartItems : []);
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST add items to cart
router.post("/", async (req, res) => {
  const user = getUserIdFromToken(req);
  const userId = user?.id;
  const { cartItems } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (!cartItems || (Array.isArray(cartItems) && cartItems.length === 0)) {
    return res.status(400).json({ message: "Missing cartItems" });
  }

  const items = Array.isArray(cartItems) ? cartItems : [cartItems];

  for (const item of items) {
    if (!item._id || !item.itemName || !item.quantity) {
      return res.status(400).json({
        message: "Each item must include _id, itemName, and quantity",
      });
    }
  }

  try {
    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      // Create new cart if it doesn't exist
      userCart = new Cart({ userId, cartItems: items });
    } else {
      // Filter out duplicates before pushing
      const existingIds = new Set(userCart.cartItems.map((i) => i._id));
      const newItems = items.filter((i) => !existingIds.has(i._id));
      userCart.cartItems.push(...newItems);
    }

    await userCart.save();
    return res.status(200).json({ message: "Cart updated", item: items });
  } catch (error) {
    console.error("❌ Error saving Cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE item from cart
router.delete("/", async (req, res) => {
  const user = getUserIdFromToken(req);
  const userId = user?.id;
  const { cartItemId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (!cartItemId) {
    return res.status(400).json({ message: "Missing cartItemId" });
  }

  try {
    const userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found for user" });
    }

    const itemExists = userCart.cartItems.some(
      (item) => item._id === cartItemId
    );
    if (!itemExists) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await Cart.updateOne(
      { userId },
      { $pull: { cartItems: { _id: cartItemId } } }
    );
    return res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting cart item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
