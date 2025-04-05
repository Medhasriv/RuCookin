const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
// Load models
require("../../schemas/User.js");
require("../../schemas/Cart.js");
const User = mongoose.model("UserInfo");
const Cart = mongoose.model("CartInfo");


// Kroger price fetcher
async function getPriceFromKroger(itemName, zipcode, token) {
    try {
      const url = "https://api.kroger.com/v1/products";
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          "filter.term": itemName,
          "filter.locationId": "70300072", // Optional but preferred
          "filter.zipCode": zipcode,
          "filter.limit": 1
        }
      });
  
      const raw = response.data?.data?.[0];
      const product = raw?.items?.[0];
      const price =
        product?.price?.regular ??
        product?.price?.promo ??
        product?.price?.currentRetail ??
        0;
  
      console.log(`✅ ${itemName} → $${price}`);
      return price;
    } catch (err) {
      console.error(`❌ Kroger error for "${itemName}":`, err.response?.data || err.message);
      return 0;
    }
  }
  

// Route to get average cost of cart items
router.get("/", async (req, res) => {
    try {
      const { username } = req.query;
      if (!username) return res.status(400).json({ error: "Missing username" });
  
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const zipcode = "90210"; // Hardcoded for now
  
      // Get the user's cart
      const userCart = await Cart.findOne({ userId: user._id });
      if (!userCart || userCart.cartItems.length === 0) {
        return res.status(404).json({ error: "Cart is empty" });
      }
  
      const cartItems = userCart.cartItems.slice(0, 20); // Max 20 items
  
      // Get Kroger access token
      const tokenResp = await axios.post(
        "https://api.kroger.com/v1/connect/oauth2/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          scope: "product.compact"
        }),
        {
          auth: {
            username: process.env.KROGER_CLIENT_ID,
            password: process.env.KROGER_CLIENT_SECRET
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }
      );
      const krogerToken = tokenResp.data.access_token;
  
      // Get prices for each item
      const itemPrices = [];
      for (const item of cartItems) {
        const name = item.itemName;
        const price = await getPriceFromKroger(name, zipcode, krogerToken);
        itemPrices.push({ name, price });
        console.log(`🛒 ${name} → $${price.toFixed(2)}`);
      }
  
      const validPrices = itemPrices.filter(item => item.price > 0);
      const avgCost =
        validPrices.reduce((sum, item) => sum + item.price, 0) /
        (validPrices.length || 1);
  
      res.json({
        average_cost: avgCost.toFixed(2),
        items_priced: validPrices.length,
        breakdown: validPrices
      });
    } catch (err) {
      console.error("avgCartCost error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  });
  

module.exports = router;
