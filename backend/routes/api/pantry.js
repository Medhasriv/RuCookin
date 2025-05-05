const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { getUserIdFromToken } = require("../../utils/TokenDecoder");

// Load the Pantry schema and model
require("../../schemas/Pantry.js");
const Pantry = mongoose.model("PantryInfo");

// GET /pantry - Fetch all pantry items for the authenticated user
router.get("/", async (req, res) => {
  const user = getUserIdFromToken(req); // Extract user from token
  const userId = user?.id; // Extract user ID

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const userPantry = await Pantry.findOne({ userId }); // Look up the pantry by user ID
    if (!userPantry) return res.status(200).json([]); // Return empty list if no pantry found
    return res.status(200).json(userPantry.items); // Return the pantry items
  } catch (err) {
    console.error("❌ Pantry fetch error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /pantry - Add an item to the user's pantry
router.post("/", async (req, res) => {
  const user = getUserIdFromToken(req); // Extract user from token
  const userId = user?.id;
  const { item } = req.body; // Extract the item from request body

  if (!userId || !item) {
    console.log("⚠️ Missing user or item");
    return res.status(400).json({ message: "Missing user or item" });
  }

  try {
    let pantry = await Pantry.findOne({ userId }); // Check if pantry exists

    if (!pantry) {
      // Create a new pantry if none exists
      pantry = new Pantry({ userId, items: [item] });
    } else {
      // Check if item with same `id` already exists
      const duplicate = pantry.items.find((p) => p.id === item.id);
      if (duplicate) {
        return res
          .status(409)
          .json({ message: "Item already exists in pantry" });
      }

      // Otherwise, add the item
      pantry.items.push(item);
    }

    await pantry.save(); // Save pantry changes
    return res.status(200).json({ message: "Item added", item }); // Success response
  } catch (err) {
    console.error("❌ Pantry save error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /pantry - Remove an item from the pantry
router.delete("/", async (req, res) => {
  const user = getUserIdFromToken(req); // Extract user from token
  const userId = user?.id;
  const { itemId } = req.body; // ID of item to remove

  if (!userId || itemId === undefined) {
    return res.status(400).json({ message: "Missing user or item ID" });
  }

  try {
    const pantry = await Pantry.findOne({ userId });

    if (!pantry) {
      return res.status(404).json({ message: "Pantry not found" });
    }

    // Check if the item actually exists
    const itemExists = pantry.items.some((item) => item.id === itemId);
    if (!itemExists) {
      return res.status(404).json({ message: "Item not found in pantry" });
    }

    // Perform the deletion
    // Use MongoDB $pull to remove item with matching ID from the items array
    const updatedPantry = await Pantry.findOneAndUpdate(
      { userId },
      { $pull: { items: { id: itemId } } },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Item removed", items: updatedPantry.items });
  } catch (err) {
    console.error("❌ Pantry delete error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /pantry/expiration - Update the expiration date of a pantry item
router.put("/expiration", async (req, res) => {
  const user = getUserIdFromToken(req); // Extract user from token
  const userId = user?.id;
  const { itemId, expirationDate } = req.body; // Get item ID and new expiration date

  if (!userId || !itemId || !expirationDate) {
    return res
      .status(400)
      .json({ message: "Missing user ID, item ID, or expiration date" });
  }

  try {
    // Update the expiration date of the specific item using positional operator $
    const pantry = await Pantry.findOneAndUpdate(
      { userId, "items.id": itemId },
      { $set: { "items.$.expirationDate": new Date(expirationDate) } },
      { new: true }
    );

    if (!pantry) return res.status(404).json({ message: "Item not found" });

    return res
      .status(200)
      .json({ message: "Expiration date updated", items: pantry.items });
  } catch (err) {
    console.error("❌ Pantry update error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Export the router for use in your Express app
module.exports = router;