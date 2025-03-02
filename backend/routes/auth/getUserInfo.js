const express = require('express');
const db = require('../../dbSetup');
const { default: mongoose } = require('mongoose');
const router = express.Router();
require('../../schemas/User.js');
const User = mongoose.model("UserInfo");
require('../../schemas/Preference.js');
const Preferences = mongoose.model("UserPreferences");

router.post("/", async (req, res) => {
    const { userId, cuisineLike, cuisineDislike, diet, intolerances } = req.body;
  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const preferencesData = {
        userId: userId,
        cuisineLike: cuisineLike || [],
        cuisineDislike: cuisineDislike || [],
        diet: diet || [],
        intolerances: intolerances || [],
      };
      const existingPreferences = await UserPreferences.findOne({ userId });

      if (existingPreferences) {
        existingPreferences.cuisineLike = preferencesData.cuisineLike;
        existingPreferences.cuisineDislike = preferencesData.cuisineDislike;
        existingPreferences.diet = preferencesData.diet;
        existingPreferences.intolerances = preferencesData.intolerances;
        await existingPreferences.save();
        return res.status(200).json({ message: "Updated preferences saved successfully" });
      } else {
        const newPreferences = new UserPreferences(preferencesData);
        await newPreferences.save();
        return res.status(200).json({ message: "New preferences saved successfully" });
      }
    });
    module.exports = router;

    

