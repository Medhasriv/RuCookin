const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

require("../../schemas/User.js");
require("../../schemas/Pantry.js");
const Pantry = mongoose.model("PantryInfo");

const { getUserIdFromToken } = require('../../utils/TokenDecoder');

router.get('/', async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    try {
        const userPantry = await Pantry.findOne({ userId });
        if (!userPantry) return res.status(200).json([]);
        return res.status(200).json(userPantry.pantryItems);
    } catch (err) {
        console.error("Error fetching pantry:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post('/', async (req, res) => {
    const userId = getUserIdFromToken(req);
    const { pantryItem } = req.body;
    if (!pantryItem) return res.status(400).json({ message: "Missing pantryItem" });

    try {
        let userPantry = await Pantry.findOne({ userId });
        if (userPantry) {
            userPantry.pantryItems.push(pantryItem);
            await userPantry.save();
        } else {
            userPantry = new Pantry({ userId, pantryItems: [pantryItem] });
            await userPantry.save();
        }
        return res.status(200).json({ message: "Pantry updated", item: pantryItem });
    } catch (err) {
        console.error("Error saving pantry:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.delete('/', async (req, res) => {
    const userId = getUserIdFromToken(req);
    const { pantryItemId } = req.body;
    if (!pantryItemId) return res.status(400).json({ message: "Missing pantryItemId" });

    try {
        const userPantry = await Pantry.findOne({ userId });
        if (!userPantry) return res.status(404).json({ message: "Pantry not found" });

        const index = userPantry.pantryItems.findIndex(item => item._id === pantryItemId);
        if (index === -1) return res.status(404).json({ message: "Item not found" });

        userPantry.pantryItems.splice(index, 1);
        await userPantry.save();
        return res.status(200).json({ message: "Item removed" });
    } catch (err) {
        console.error("Error deleting item:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
