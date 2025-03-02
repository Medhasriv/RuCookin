const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../dbSetup');
const { default: mongoose } = require('mongoose');
const router = express.Router();

require('../../schemas/User.js');
const User = mongoose.model("UserInfo");

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ username: username });
  if (!user) {
    console.log("❌ User not found in MongoDB!");
    return res.status(400).json({ message: 'Invalid username or password' });
  }
  console.log(`✅ User found: ${user.username}`);
  console.log(`🔑 Stored Hashed Password: ${user.password}`);

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log("❌ Password mismatch!");
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  console.log("✅ Login successful!");
  res.status(200).json({ message: 'Login successful' });
});

module.exports = router;
