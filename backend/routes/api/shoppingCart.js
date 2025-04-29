const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Import User schema and model
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

// Import Cart schema and model
require("../../schemas/Cart.js");
const Cart = mongoose.model("CartInfo");

// Utility function to extract user ID from JWT
const { getUserIdFromToken } = require('../../utils/TokenDecoder');

// GET route to fetch cart items for the logged-in user
router.get('/', async (req, res) => {
  const user = getUserIdFromToken(req);                // Decode token to get user info
  const userId = user?.id;                             // Extract userId from token
  console.log(userId);

  // If user ID is missing or invalid, return 401
  if (!userId) return res.status(401).json({ message: "Invalid or missing token" });

  try {
    const userCart = await Cart.findOne({ userId });   // Find cart for the user
    if (!userCart) {
      // If no cart exists, return empty array
      return res.status(200).json([]);
    }

    // Return the user's cart items
    console.log(userCart.cartItems);
    return res.status(200).json(userCart.cartItems);
  } catch (error) {
    // Handle unexpected server errors
    console.error("❌ Error fetching cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST route to add items to the user's cart
router.post('/', async (req, res) => {
  console.log("Incoming Request:", req.body);

  const user = getUserIdFromToken(req);               // Decode token to get user info
  const userId = user?.id;                            // Extract userId from token
  const { cartItems } = req.body;                     // Destructure cartItems from request body

  // Return 400 if cartItems is not provided
  if (!cartItems) {
    return res.status(400).json({ message: "Missing cartItems" });
  }

  try {
    let userCart = await Cart.findOne({ userId });    // Check if user already has a cart

    if (userCart) {
      // If cart exists, push new item(s) and save
      userCart.cartItems.push(cartItems);
      await userCart.save();
    } else {
      // If no cart exists, create a new one with the item
      userCart = new Cart({
        userId,
        cartItems: [cartItems],
      });
      await userCart.save();
    }

    // Send success response
    return res.status(200).json({ message: "Cart updated", item: cartItems });

  } catch (error) {
    // Handle unexpected server errors
    console.error("Error saving Cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE route to remove a specific item from the user's cart
router.delete('/', async (req, res) => {
  const user = getUserIdFromToken(req);               // Decode token to get user info
  const userId = user?.id;                            // Extract userId from token

  // Return 401 if user is not authenticated
  if (!userId) return res.status(401).json({ message: "Invalid or missing token" });

  const { cartItemId } = req.body;                    // Get the ID of the item to remove

  // Return 400 if cartItemId is not provided
  if (!cartItemId) return res.status(400).json({ message: "Missing cartItemId" });

  try {
    const userCart = await Cart.findOne({ userId });  // Find the user's cart

    // If no cart found, return 404
    if (!userCart) {
      return res.status(404).json({ message: "Cart not found for user" });
    }

    // Use MongoDB $pull operator to remove item by ID
    await Cart.updateOne(
      { userId },
      { $pull: { cartItems: { _id: cartItemId } } }
    );

    // Send success response
    return res.status(200).json({ message: "Cart item deleted successfully" });

  } catch (error) {
    // Handle unexpected server errors
    console.error("❌ Error deleting cart item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Export the router to be used in other parts of the app
module.exports = router;
