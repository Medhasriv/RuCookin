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
    console.log("Incoming Request:", req.body)
    const { username, diet } = req.body;
    console.log("✅ Extracted Username:", username);
    if (!username) {
      return res.status(400).json({ message: "Missing username" });
    }
    const user = await User.findOne({username});
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const userId = user._id;
    const preferencesData = {
      userId,
      diet: diet || []
    };

    let existingPreferences = await Preferences.findOne({ userId });

    if (existingPreferences) {
      existingPreferences.diet = preferencesData.diet;
      await existingPreferences.save();
      console.log("✅ Updated Preferences:", existingPreferences);
    } else {
      const newPreferences = new Preferences(preferencesData);
      await newPreferences.save();
      console.log("✅ New Preferences Saved:", newPreferences);
    }

    return res.status(200).json({ message: "Diet saved successfully" });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/', async (req, res) => {
  const username = req.headers['username'];
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const userId = user._id;

  if (!userId) return res.status(401).json({ message: "Invalid or missing token" });

    try {
    let existingPreferences = await Preferences.findOne({ userId });

    if (!existingPreferences) {
      return res.status(200).json([]);
    }

    console.log(existingPreferences.diet);
    return res.status(200).json(existingPreferences.diet);
  
    } catch (error) {
      console.error("❌ Error fetching cart", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports = router;
