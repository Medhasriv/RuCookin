const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");

require("../../schemas/User.js");
require("../../schemas/Cart.js");

const User = mongoose.model("UserInfo");
const Cart = mongoose.model("CartInfo");

const { getUserIdFromToken } = require("../../utils/TokenDecoder");


router.post('/prices', async (req, res) => {
  try {
    const { zipcode } = req.body;
    console.log(zipcode)
    const user = getUserIdFromToken(req);
    const userId = await User.findById(user.id);
    console.log(userId)

    if (!user || !zipcode) {
      return res.status(400).json({ error: "Missing token or zip code" });
    }
    if (!userId) return res.status(404).json({ error: "User not found" });

    const userCart = await Cart.findOne({ userId: userId });
    if (!userCart || userCart.cartItems.length === 0) {
      return res.status(404).json({ error: "Cart is empty" });
    }
    const token = await axios.post(
      "https://api.kroger.com/v1/connect/oauth2/token",
      "grant_type=client_credentials&scope=product.compact",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: {
          username: process.env.KROGER_CLIENT_ID,
          password: process.env.KROGER_CLIENT_SECRET,
        },
      }
    );
    const krogerToken = token.data.access_token;


    const store = await axios.get("https://api.kroger.com/v1/locations", {
      headers: { Authorization: `Bearer ${krogerToken}` },
      params: {
        "filter.zipCode.near": zipcode,
        "filter.limit": 1,
      },
    });

    const stores = store.data.data;
    const closestStore = stores[0];
    const storeId = closestStore?.locationId;

    if (!storeId) {
      return res.status(404).json({ error: "No Kroger store found nearby" });
    }

    const cartItems = userCart.cartItems;
    const matchedItems = [];
    const unmatchedItems = [];

    for (const item of cartItems) {
      const itemName = item.itemName;

      try {
        const product = await axios.get("https://api.kroger.com/v1/products", {
          headers: { Authorization: `Bearer ${krogerToken}` },
          params: {
            "filter.term": itemName,
            "filter.locationId": storeId,
            "filter.limit": 1,
          },
        });

        const raw = product.data?.data?.[0];
        const productId = raw?.productId;
        const krogerItem = raw?.items?.[0];
        const price = krogerItem?.price?.regular;

        if (productId && typeof price === "number" && price > 0) {
          matchedItems.push({
            name: itemName,
            productId,
            price: parseFloat(price),
          });
        } else {
          unmatchedItems.push(itemName);
        }
      } catch (err) {
        unmatchedItems.push(itemName);
        console.error(`❌ Failed to fetch "${itemName}":`, err.message);
      }
    }

    const totalCost = matchedItems.reduce((sum, item) => sum + item.price, 0);
    res.json({
      total_cost: totalCost.toFixed(2),
      matched: matchedItems,
      not_found: unmatchedItems,
    });
  } catch (err) {
    console.error("🔥 GET /krogerCart error:", err.message);
    console.error("📦 Full error:", err.response?.data || err);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/clear", async (req, res) => {
  try {
    console.log("🔥 Start the clear");
    const user = getUserIdFromToken(req);
    const userId = await User.findById(user.id);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });

    const userCart = await Cart.findOne({ userId: userId });
    if (!userCart || userCart.cartItems.length === 0) {
      return res.status(404).json({ error: "Cart is empty" });
    }
    await Cart.updateOne(
      { userId: userId },
      { $set: { cartItems: [] } }
    );

    res.json({
      message: "🧹 Cart successfully cleared"
    });


  } catch (err) {
    console.error("🔥 POST /krogerCart error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to add items to Kroger shopping list" });
  }
});

module.exports = router;