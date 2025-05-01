// Import necessary modules and utilities
const express = require("express");
const db = require("../../dbSetup.js"); // Initializes database connection
const mongoose = require("mongoose");
const router = express.Router();

// Load Mongoose schemas
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

require("../../schemas/Preference.js");
const Preferences = mongoose.model("UserPreferences");

// Utility function to decode token if needed (not used in this file yet)
const { getUserIdFromToken } = require('../../utils/TokenDecoder');

// POST route to save or update user's disliked cuisines
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Request:", req.body);

    // Extract data from request body
    const { username, cuisineDislike } = req.body;
    console.log("✅ Extracted Username:", username);

    // Validate presence of username
    if (!username) {
      return res.status(400).json({ message: "Missing username" });
    }

    // Look up the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user._id;

    // Construct preferences object
    const preferencesData = {
      userId,
      cuisineDislike: cuisineDislike || [] // Defaults to empty array if none provided
    };

    // Check if preferences already exist for this user
    let existingPreferences = await Preferences.findOne({ userId });

    if (existingPreferences) {
      // Update existing preference document
      existingPreferences.cuisineDislike = preferencesData.cuisineDislike;
      console.log("✅ Updated Preferences:", existingPreferences);
      await existingPreferences.save();
    } else {
      // Create a new preferences document
      const newPreferences = new Preferences(preferencesData);
      await newPreferences.save();
      console.log("✅ New Preferences Saved:", newPreferences);
    }

    // Respond with success message
    return res.status(200).json({ message: "Cuisine Dislike saved successfully" });

  } catch (error) {
    // Handle unexpected errors
    console.error("Error saving preferences:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET route to fetch user's disliked cuisines
router.get('/', async (req, res) => {
  // Extract username from request headers
  const username = req.headers['username'];

  // Look up the user in the database
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const userId = user._id;

  // Ensure a valid user ID exists
  if (!userId) return res.status(401).json({ message: "Invalid or missing token" });

  try {
    // Retrieve the preferences for the user
    let existingPreferences = await Preferences.findOne({ userId });

    // If no preferences found, return an empty array
    if (!existingPreferences) {
      return res.status(200).json([]);
    }

    // Return the disliked cuisines array
    console.log(existingPreferences.cuisineDislike);
    return res.status(200).json(existingPreferences.cuisineDislike);

  } catch (error) {
    // Handle errors during retrieval
    console.error("❌ Error fetching preferences", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Export the router to be used in the main application
module.exports = router;
