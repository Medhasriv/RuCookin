// Import required modules and dependencies
const express = require("express");
const db = require("../../dbSetup.js"); // Database setup (likely initializes connection)
const mongoose = require("mongoose");
const router = express.Router();

// Import Mongoose schemas/models
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

require("../../schemas/Preference.js");
const Preferences = mongoose.model("UserPreferences");

// Route to save or update user dietary preferences
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Request:", req.body);

    // Destructure username and diet from request body
    const { username, diet } = req.body;
    console.log("✅ Extracted Username:", username);

    // Check if username is provided
    if (!username) {
      return res.status(400).json({ message: "Missing username" });
    }

    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user._id; // Extract user ID from the found user
    const preferencesData = {
      userId,
      diet: diet || [] // Default to empty array if diet is not provided
    };

    // Check if preferences already exist for this user
    let existingPreferences = await Preferences.findOne({ userId });

    if (existingPreferences) {
      // Update existing preferences
      existingPreferences.diet = preferencesData.diet;
      await existingPreferences.save();
      console.log("✅ Updated Preferences:", existingPreferences);
    } else {
      // Create new preferences document
      const newPreferences = new Preferences(preferencesData);
      await newPreferences.save();
      console.log("✅ New Preferences Saved:", newPreferences);
    }

    // Send success response
    return res.status(200).json({ message: "Diet saved successfully" });
  } catch (error) {
    // Catch and log any errors
    console.error("Error saving preferences:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Route to retrieve user dietary preferences
router.get('/', async (req, res) => {
  // Extract username from request headers
  const username = req.headers['username'];

  // Find the user by username
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const userId = user._id;

  // If user ID is missing, return unauthorized
  if (!userId) return res.status(401).json({ message: "Invalid or missing token" });

  try {
    // Find preferences for the given user ID
    let existingPreferences = await Preferences.findOne({ userId });

    // If no preferences found, return empty array
    if (!existingPreferences) {
      return res.status(200).json([]);
    }

    // Log and return the user's diet preferences
    console.log(existingPreferences.diet);
    return res.status(200).json(existingPreferences.diet);

  } catch (error) {
    // Handle any errors during fetch
    console.error("❌ Error fetching cart", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Export the router to be used in other parts of the application
module.exports = router;