// Importing modules
const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();
// Import the adminRecipe Databases
require("../../schemas/AdminRecipe.js");
const Recipe = mongoose.model("adminRecipeInfo");

// POST route to save recipe's cuisines
router.post("/", async (req, res) => {
  try {
    // Destructure recipe Title and diet array from request body
    const { recipeTitle, diets } = req.body;
    // If recipe title is missing, then send a failing message
    if (!recipeTitle) {
      return res.status(400).json({ message: "Missing recipeTitle" });
    }
    // If recipe does not exist, then send a failing message
    const recipe = await Recipe.findOne({ title: recipeTitle });
    if (!recipe) {
      return res.status(400).json({ message: "recipe not found" });
    }
    // If diets is not an array, then send a faililng message
    if (!Array.isArray(diets)) {
      return res.status(400).json({ message: "Diets must be an array of strings" });
    }
    // Save the new diets
    recipe.diets = diets;
    await recipe.save();
    return res.status(200).json({ message: "Diets successfully added" });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;