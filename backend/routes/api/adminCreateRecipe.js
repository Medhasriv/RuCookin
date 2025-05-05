const express = require('express');
const db = require('../../dbSetup');
const { default: mongoose } = require('mongoose');
const router = express.Router();
require('../../schemas/AdminRecipe.js');
const adminRecipe = mongoose.model("adminRecipeInfo");


router.post('/', async (req, res) => {
  const { title, instructions, ingredients, summary, readyinMins } = req.body;
  if (!title || !instructions || !ingredients) {
    return res.status(400).json({ message: 'Missing a required field' });
  }
  const titleExist = await adminRecipe.findOne({ title: title });
  if (titleExist) {
    return res.status(400).json({ message: 'This recipe already exists' });
  }
  else {
    const newRecipe = new adminRecipe({ title: title, instructions: instructions, ingredients: ingredients, summary: summary, readyinMins: readyinMins });
    await newRecipe.save();
    res.status(200).json({ message: 'Create new recipe successful' });
  }

});

module.exports = router;