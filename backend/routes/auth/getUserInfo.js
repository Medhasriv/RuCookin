const express = require('express');
const db = require('../../dbSetup');
const mongoose = require('mongoose');
const router = express.Router();

require('../../schemas/User.js');
const User = mongoose.model("UserInfo");
require('../../schemas/Preference.js');
const Preferences = mongoose.model("UserPreferences");

router.post("/", async (req, res) => {
  const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId not found" });
    }
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(400).json({ message: "User not found" });

      // Fetch user preferences
      const userPreferences = await Preferences.findOne({ userId });

      if (!userPreferences) {
          return res.status(404).json({ message: "Preferences not found" });
      }

      res.status(200).json({
          userId: userPreferences.userId,
          cuisineLike: userPreferences.cuisineLike || [],
          cuisineDislike: userPreferences.cuisineDislike || [],
          diet: userPreferences.diet || [],
          intolerances: userPreferences.intolerances || []
      });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;