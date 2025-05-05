// Importing modules
const express = require('express');
const db = require('../../dbSetup');
const { default: mongoose } = require('mongoose');
const router = express.Router();
// Import the adminRecipe Databases
require('../../schemas/AdminRecipe.js');
const adminRecipe = mongoose.model("adminRecipeInfo");

// Create a new Recipes
router.post('/', async (req, res) => {
  // Destructure title, instructions, ingredients, summary, and readyinMins from request body
  const { title, instructions, ingredients, summary, readyinMins } = req.body;
  // If title, instructions, or ingredients is missing then send a failing message
  if (!title || !instructions || !ingredients) {
    return res.status(400).json({ message: 'Missing a required field' });
  }
  // If title exist in the admin Recipe in the database, then send a failing message
  const titleExist = await adminRecipe.findOne({ title: title });
  if (titleExist) {
    return res.status(400).json({ message: 'This recipe already exists' });
  }
  else {
    // Save the new recipe into the database
    const newRecipe = new adminRecipe({ title: title, instructions: instructions, ingredients: ingredients, summary: summary, readyinMins: readyinMins });
    await newRecipe.save();
    res.status(200).json({ message: 'Create new recipe successful' });
  }

});

module.exports = router;