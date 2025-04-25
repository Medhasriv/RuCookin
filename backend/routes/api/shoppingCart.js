const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");

require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

require("../../schemas/Cart.js");
const Cart = mongoose.model("CartInfo");

const { getUserIdFromToken } = require('../../utils/TokenDecoder');

router.get('/', async (req, res) => {
  const userId = getUserIdFromToken(req);
  console.log(userId)
  if (!userId) return res.status(401).json({ message: "Invalid or missing token" });
  try {
    const userCart = await Cart.findOne({ userId });
    if (!userCart) {
      return res.status(200).json([]);
    }
    console.log(userCart.cartItems);
    return res.status(200).json(userCart.cartItems);
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/', async (req, res) => {
  console.log("Incoming Request:", req.body)
  const userId = getUserIdFromToken(req);
  const { cartItems } = req.body;
  if (!cartItems) {
    return res.status(400).json({ message: "Missing cartItems" });
  }
  try {
    let userCart = await Cart.findOne({ userId });
    if (userCart) {
      userCart.cartItems.push(cartItems);
      await userCart.save();
    } else {
      userCart = new Cart({
        userId,
        cartItems: [cartItems],
      });
      await userCart.save();
    }

    return res.status(200).json({ message: "Cart updated", item: cartItems });

  }
  catch (error) {
    console.error("Error saving Cart:", error);
    return res.status(500).json({ message: "Internal server error" });

  }
});

router.delete('/', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Invalid or missing token" });
  const { cartItemId } = req.body;
  if (!cartItemId) return res.status(400).json({ message: "Missing cartItemId" });
  try {
    const userCart = await Cart.findOne({ userId });
    if (!userCart) {
      return res.status(404).json({ message: "Cart not found for user" });
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


