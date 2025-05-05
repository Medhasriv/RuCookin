const mongoose = require("mongoose");

require("../../schemas/User.js");
const User = mongoose.model("UserInfo");
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET_KEY;

router.post('/', async (req, res) => {
  const { firstName, lastName, username, password, email } = req.body;

  // Check if all fields are provided
  if (!firstName || !lastName || !username || !password || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Username validation
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
  }

  // Password validation (minimum length 8 characters)
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  // First name validation
  if (firstName.length < 2 || firstName.length > 50) {
    return res.status(400).json({ message: 'First Name must be between 2 and 50 characters' });
  }

  // Last name validation
  if (lastName.length < 2 || lastName.length > 50) {
    return res.status(400).json({ message: 'Last Name must be between 2 and 50 characters' });
  }

  // Email validation (under 50 characters)
  if (email.length > 50) {
    return res.status(400).json({ message: 'Email must be under 50 characters' });
  }

  // Regex for first name (only alphabets)
  const nameRegex = /^[A-Za-z]+$/;
  if (!nameRegex.test(firstName)) {
    return res.status(400).json({ message: 'First name must contain only alphabets' });
  }

  // Regex for last name (only alphabets)
  if (!nameRegex.test(lastName)) {
    return res.status(400).json({ message: 'Last name must contain only alphabets' });
  }

  // Email regex validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email is not valid' });
  }

  // Password regex: At least 1 lowercase, 1 uppercase, 1 digit, and 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must contain at least: 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character'
    });
  }

  // Check if username or email already exists in the database
  const userExist = await User.findOne({ username: username });
  const emailExist = await User.findOne({ email: email });
  if (userExist) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  else if (emailExist) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  else {
    // Hash password before storing it
    const saltRounds = 11;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user and sets accountType as admin
    const newAdmin = new User({
      username: username,
      password: hashedPassword,
      email: email,
      firstName: firstName,
      lastName: lastName,
      accountType: 'admin'
    });

    // Save new user to the database
    await newAdmin.save();
    res.status(200).json({ message: 'Sign up successful' });
  }
});

module.exports = router;