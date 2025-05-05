// Import required modules
const express = require("express");
const db = require("../../dbSetup.js"); // Initialize DB connection
const mongoose = require("mongoose");
const router = express.Router(); // Create a router instance for defining routes

// Load Mongoose models
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

require("../../schemas/Preference.js");
const Preferences = mongoose.model("UserPreferences");

// POST route to save or update user's liked cuisines
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Request:", req.body);

    // Destructure username and cuisineLike array from request body
    const { username, cuisineLike } = req.body;
    console.log("✅ Extracted Username:", username);

    // Ensure username is provided
    if (!username) {
      return res.status(400).json({ message: "Missing username" });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user._id;

    // Create preferences object (defaults to empty array if not provided)
    const preferencesData = {
      userId,
      cuisineLike: cuisineLike || []
    };

    // Check if preferences already exist for the user
    let existingPreferences = await Preferences.findOne({ userId });

    if (existingPreferences) {
      // Update existing preferences
      existingPreferences.cuisineLike = preferencesData.cuisineLike;
      await existingPreferences.save();
      console.log("✅ Updated Preferences:", existingPreferences);
    } else {
      // Create and save new preferences
      const newPreferences = new Preferences(preferencesData);
      await newPreferences.save();
      console.log("✅ New Preferences Saved:", newPreferences);
    }

    // Respond with success message
    return res.status(200).json({ message: "Cuisine Like saved successfully" });
  } catch (error) {
    // Log and return server error
    console.error("Error saving preferences:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET route to retrieve user's liked cuisines
router.get('/', async (req, res) => {
  // Get username from request headers
  const username = req.headers['username'];

  // Find user by username
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const userId = user._id;

  // If no user ID found, return unauthorized error
  if (!userId) return res.status(401).json({ message: "Invalid or missing token" });

  try {
    // Find preferences by user ID
    let existingPreferences = await Preferences.findOne({ userId });

    // If no preferences exist, return an empty array
    if (!existingPreferences) {
      return res.status(200).json([]);
    }

    // Log and return user's liked cuisines
    console.log(existingPreferences.cuisineLike);
    return res.status(200).json(existingPreferences.cuisineLike);

  } catch (error) {
    // Handle any server-side errors
    console.error("❌ Error fetching cart", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Export the router to be used in the main app
module.exports = router;