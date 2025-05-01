// Import required modules and initialize Express router
const express = require("express");
const db = require("../../dbSetup.js"); // DB initialization
const mongoose = require("mongoose");
const router = express.Router();

// Load Mongoose models
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

require("../../schemas/Preference.js");
const Preferences = mongoose.model("UserPreferences");

// POST route to save or update user's intolerance preferences
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Request:", req.body);

    // Destructure username and intolerance list from request body
    const { username, intolerance } = req.body;
    console.log("✅ Extracted Username:", username);
    console.log("✅ Extracted intolerance:", intolerance);

    // Ensure username is provided
    if (!username) {
      return res.status(400).json({ message: "Missing username" });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User does not exist");
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user._id;

    // Prepare preferences data (default to empty array if none provided)
    const preferencesData = {
      userId,
      intolerance: intolerance || []
    };

    // Check if preferences already exist for the user
    let existingPreferences = await Preferences.findOne({ userId });

    if (existingPreferences) {
      // Update intolerance field in existing preferences
      existingPreferences.intolerance = preferencesData.intolerance;
      await existingPreferences.save();
      console.log("✅ Updated Preferences:", existingPreferences);
    } else {
      // Create a new preferences document with intolerance data
      const newPreferences = new Preferences(preferencesData);
      await newPreferences.save();
      console.log("✅ New Preferences Saved:", newPreferences);
    }

    // Respond with success
    return res.status(200).json({ message: "Intolerance saved successfully" });

  } catch (error) {
    // Log and return internal server error
    console.error("Error saving preferences:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET route to retrieve user's intolerance preferences
router.get('/', async (req, res) => {
  // Extract username from request headers
  const username = req.headers['username'];

  // Look up user in database
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const userId = user._id;

  // Check for valid user ID (redundant if user found, but included for safety)
  if (!userId) return res.status(401).json({ message: "Invalid or missing token" });

  try {
    // Find user's preferences document
    let existingPreferences = await Preferences.findOne({ userId });

    // Return empty array if no preferences found
    if (!existingPreferences) {
      return res.status(200).json([]);
    }

    // Return intolerance preferences
    console.log(existingPreferences.intolerance);
    return res.status(200).json(existingPreferences.intolerance);

  } catch (error) {
    // Handle any server-side errors
    console.error("❌ Error fetching preferences", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Export router for use in main app
module.exports = router;
