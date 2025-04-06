const express = require("express");
const router = express.Router();

require("../../schemas/User.js");
const User = require("mongoose").model("UserInfo");

router.put("/", async (req, res) => {
  try {
    const { id, firstName, lastName, email, location } = req.body;
    if (!id || !email) {
      return res.status(400).json({ message: "User ID and Email are required." });
    }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, location },
      { new: true } // return the updated document
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
