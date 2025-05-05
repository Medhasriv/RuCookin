const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

require("../../schemas/Preference.js");
const Preference = mongoose.model("UserPreferences");

router.get('/top-favorites', async (req, res) => {
  try {
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

router.get('/user-preferences', async (req, res) => {
  try {
    const [topDiets, topIntolerances, topLikedCuisines, topDislikedCuisines] = await Promise.all([
      Preference.aggregate([
        { $unwind: '$diet' },
        { $group: { _id: '$diet', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]),
      Preference.aggregate([
        { $unwind: '$intolerance' },
        { $group: { _id: '$intolerance', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]),
      Preference.aggregate([
        { $unwind: '$cuisineLike' },
        { $group: { _id: '$cuisineLike', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]),
      Preference.aggregate([
        { $unwind: '$cuisineDislike' },
        { $group: { _id: '$cuisineDislike', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ])
    ]);

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