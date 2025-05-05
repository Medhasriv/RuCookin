const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../../dbSetup");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");

require("../../schemas/User.js");
const User = mongoose.model("UserInfo");
const SECRET_KEY = process.env.JWT_SECRET_KEY;

// router.get('/', (req, res) => {
//   res.json({ message: "✅ Login route is active!" });
// });

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ username: username });
  if (!user) {
    console.log("❌ User not found in MongoDB!");
    return res.status(400).json({ message: "Invalid username or password" });
  }
  console.log(`✅ User found: ${user.username}`);
  console.log(`🔑 Stored Hashed Password: ${user.password}`);

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log("❌ Password mismatch!");
    return res.status(400).json({ message: "Invalid username or password" });
  }
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      accountType: user.accountType,
    },
    SECRET_KEY,
    { expiresIn: "2h" }
  );

  console.log("✅ Login successful!");
  res.status(200).json({ message: "Login successful", token });
});

module.exports = router;