const express = require("express");
const router = express.Router();
const { getUserIdFromToken } = require("../../utils/TokenDecoder"); // Import token decoder

require("../../schemas/Preference.js");
const User = require("mongoose").model("UserInfo");

router.put("/", async (req, res) => {
  try {
    const id = getUserIdFromToken(req); // Get ID from token
    if (!id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token." });
    }

    const { firstName, lastName, email, location } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, location },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
