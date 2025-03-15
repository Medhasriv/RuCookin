const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();

require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

require("../../schemas/Preference.js");
const Preferences = mongoose.model("UserPreferences");

router.post("/", async (req, res) => {
  try {
    const { userId, cuisineLike } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const preferencesData = {
      userId,
      cuisineLike: cuisineLike || []
    };

    let existingPreferences = await Preferences.findOne({ userId });

    if (existingPreferences) {
      existingPreferences.cuisineLike = preferencesData.cuisineLike;

      await existingPreferences.save();
    } else {
      const newPreferences = new Preferences(preferencesData);
      await newPreferences.save();
    }

    return res.status(200).json({ message: "Cuisine Like saved successfully" });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
