const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();

require("../../schemas/AdminRecipe.js");
const Recipe = mongoose.model("adminRecipeInfo");

router.post("/", async (req, res) => {
  try {

    console.log("Incoming Request:", req.body);
    const { recipeTitle, cuisines } = req.body;
    console.log("Resolved cuisines array:", cuisines);
    console.log("✅ Extracted recipeTitle:", recipeTitle);
    if (!recipeTitle ) {
      return res.status(400).json({ message: "Missing recipeTitle" });
    }

    const recipe = await Recipe.findOne({title: recipeTitle});
    if (!recipe) {
      return res.status(400).json({ message: "recipe not found" });
    }
    console.log(recipe)
    if (!Array.isArray(cuisines)) {
        return res.status(400).json({ message: "Cuisine must be an array of strings" });
      }
      recipe.cuisines = cuisines;
      await recipe.save();
    console.log("✅ Updated Recipe:", recipe);
    return res.status(200).json({ message: "Cuisine successfully added" });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;