const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
// Load models
require("../../schemas/User.js");
require("../../schemas/Cart.js");
const User = mongoose.model("UserInfo");
const Cart = mongoose.model("CartInfo");

const { tokenStore } = require("../auth/krogerCallback");
const getUserIdFromToken = require("../../utils/getUserIdFromToken"); 

router.get("/", async (req, res) => {
  try {
    const { zipcode } = req.query;
    const userId = getUserIdFromToken(req);

    if (!userId || !zipcode) {
      return res.status(400).json({ error: "Missing token or zip code" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userCart = await Cart.findOne({ userId: user._id });
    if (!userCart || userCart.cartItems.length === 0) {
      return res.status(404).json({ error: "Cart is empty" });
    }

    const krogerToken = tokenStore.get(req.ip);
    if (!krogerToken) {
      return res.status(401).json({ error: "User not authenticated with Kroger" });
    }


    const storeResp = await axios.get("https://api.kroger.com/v1/locations", {
      headers: { Authorization: `Bearer ${krogerToken}` },
      params: {
        "filter.zipCode.near": zipcode,
        "filter.radiusInMiles": 20,
        "filter.chain": "Kroger"
      }
    });

    const stores = storeResp.data.data;
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
        const productResp = await axios.get("https://api.kroger.com/v1/products", {
          headers: { Authorization: `Bearer ${krogerToken}` },
          params: {
            "filter.term": itemName,
            "filter.locationId": storeId,
            "filter.limit": 1
          }
        });

        const raw = productResp.data?.data?.[0];
        const krogerItem = raw?.items?.[0];
        const price = krogerItem?.price?.regular ?? 0;

        if (raw?.productId && price > 0) {
          matchedItems.push({
            name: itemName,
            productId: raw.productId,
            price: parseFloat(price)
          });
        } else {
          unmatchedItems.push(itemName);
        }
      } catch (err) {
        unmatchedItems.push(itemName);
        console.error(`❌ Failed to fetch "${itemName}":`, err.response?.data || err.message);
      }
    }

    if (matchedItems.length === 0) {
      return res.status(404).json({ error: "No items matched in Kroger store" });
    }


    const totalCost = matchedItems.reduce((sum, item) => sum + item.price, 0);

    res.json({
      store: {
        name: closestStore.name,
        id: storeId,
        address: closestStore.address,
        within_20_miles: stores.map(s => ({
          name: s.name,
          id: s.locationId,
          distance: s.distance?.distanceInMiles ?? "?"
        }))
      },
      total_cost: totalCost.toFixed(2),
      matched: matchedItems,
      not_found: unmatchedItems
    });
  } catch (err) {
    console.error("🔥 krogerCart error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
