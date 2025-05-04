// backend/routes/api/favoriteRecipe.js
const express = require("express");
const router  = express.Router();

// Adjust these paths to match your project structure:
const User      = require("../../schemas/User");         // or UserInfo schema
const UserPref  = require("../../schemas/Preference"); // or UserPreferences.js

// GET all favourite IDs for the current user, requires username and authorization
router.get("/", async (req, res) => {
  try {
    const username = req.headers.username;            // sent by the client
    if (!username) return res.status(400).json({ message: "Username header missing" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const pref = await UserPref.findOne({ userId: user._id });
    console.log("👾 [GET favoriteRecipe] pref doc:", pref);
    return res.json(pref?.favoriteRecipes || []);
  } catch (err) {
    console.error("GET favoriteRecipe error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// POST – add a recipe ID, requires username and recipeId
router.post("/", async (req, res) => {
  try {
    const { username, recipeId } = req.body;
    if (!username || !recipeId) {
      return res.status(400).json({ message: "username and recipeId required" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

   const updateResult = await UserPref.updateOne(
      { userId: user._id },
      { $addToSet: { favoriteRecipes: recipeId } },
      { upsert: true }
    );
    
    console.log("👾 favoriteRecipes updateResult:", updateResult);
    return res.sendStatus(200);
  } catch (err) {
    console.error("POST favoriteRecipe error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// DELETE – remove a recipe ID, requires username and recipeId
router.delete("/", async (req, res) => {
  try {
    const { username, recipeId } = req.body;
    if (!username || !recipeId) {
      return res.status(400).json({ message: "username and recipeId required" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    await UserPref.updateOne(
      { userId: user._id },
      { $pull: { favoriteRecipes: recipeId } }
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error("DELETE favoriteRecipe error:", err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
