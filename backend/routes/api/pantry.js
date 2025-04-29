
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { getUserIdFromToken } = require("../../utils/TokenDecoder");

require("../../schemas/Pantry.js");
const Pantry = mongoose.model("PantryInfo");

// GET pantry items
router.get("/", async (req, res) => {
    const user = getUserIdFromToken(req);
    const userId = user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const userPantry = await Pantry.findOne({ userId });
        if (!userPantry) return res.status(200).json([]);
        return res.status(200).json(userPantry.items);
    } catch (err) {
        console.error("❌ Pantry fetch error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST add to pantry
router.post("/", async (req, res) => {
    const user = getUserIdFromToken(req);
    const userId = user?.id;
    const { item } = req.body;

    // console.log("📥 Received POST /pantry");
    // console.log("🧑 userId:", userId);
    // console.log("🧅 item:", item);

    if (!userId || !item) {
        console.log("⚠️ Missing user or item");
        return res.status(400).json({ message: "Missing user or item" });
    }

    try {
        let pantry = await Pantry.findOne({ userId });
        if (!pantry) {
            pantry = new Pantry({ userId, items: [item] });
        } else {
            pantry.items.push(item);
        }
        await pantry.save();
        return res.status(200).json({ message: "Item added", item });
    } catch (err) {
        console.error("❌ Pantry save error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE remove item from pantry
router.delete("/", async (req, res) => {
    const user = getUserIdFromToken(req);
    const userId = user?.id;
    const { itemId } = req.body;

    if (!userId || itemId === undefined) {
        return res.status(400).json({ message: "Missing user or item ID" });
    }

    try {
        const updatedPantry = await Pantry.findOneAndUpdate(
            { userId },
            { $pull: { items: { id: itemId } } },
            { new: true }
        );

        if (!updatedPantry) {
            return res.status(404).json({ message: "Pantry not found" });
        }

        return res.status(200).json({ message: "Item removed", items: updatedPantry.items });
    } catch (err) {
        console.error("❌ Pantry delete error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// PUT update expiration date
router.put("/expiration", async (req, res) => {
    const user = getUserIdFromToken(req);
    const userId = user?.id;
    const { itemId, expirationDate } = req.body;

    if (!userId || !itemId || !expirationDate) {
        return res.status(400).json({ message: "Missing user ID, item ID, or expiration date" });
    }

    try {
        const pantry = await Pantry.findOneAndUpdate(
            { userId, "items.id": itemId },
            { $set: { "items.$.expirationDate": new Date(expirationDate) } },
            { new: true }
        );

        if (!pantry) return res.status(404).json({ message: "Item not found" });

        return res.status(200).json({ message: "Expiration date updated", items: pantry.items });
    } catch (err) {
        console.error("❌ Pantry update error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
