// Importing modules
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
// Import the User Databases
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");
// Import the Preference Databases
require("../../schemas/Preference.js");
const Preference = mongoose.model("UserPreferences");

// GET aggregate Favorite Recipe ID
router.get('/top-favorites', async (req, res) => {
  try {
    // Result contains the top 10 Favorite Recipe ID
    const results = await Preference.aggregate([
      { $unwind: '$favoriteRecipes' },
      { $group: { _id: '$favoriteRecipes', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching top favorite recipes' });
  }
});
// GET aggregate User Preferences (diets, intolerances, liked cuisines and dislike cuisines)
router.get('/user-preferences', async (req, res) => {
  try {
    // Result contains the top 3 of Preference
    const [topDiets, topIntolerances, topLikedCuisines, topDislikedCuisines] = await Promise.all([
      // Top 3 for Diet
      Preference.aggregate([
        { $unwind: '$diet' },
        { $group: { _id: '$diet', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]),
      // Top 3 for Intolerance
      Preference.aggregate([
        { $unwind: '$intolerance' },
        { $group: { _id: '$intolerance', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]),
      // Top 3 for Cuisine Like
      Preference.aggregate([
        { $unwind: '$cuisineLike' },
        { $group: { _id: '$cuisineLike', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]),
      // Top 3 for Cuisine Dislike
      Preference.aggregate([
        { $unwind: '$cuisineDislike' },
        { $group: { _id: '$cuisineDislike', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ])
    ]);
    // Send final top information
    res.json({
      topDiets,
      topIntolerances,
      topLikedCuisines,
      topDislikedCuisines
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user preference stats' });
  }
});

module.exports = router;