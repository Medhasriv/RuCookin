// Check if all fields are provided
const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();
// Import for all the Databases used
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");
require("../../schemas/User.js");
require("../../schemas/Preference.js");
const Preferences = mongoose.model("UserPreferences");
require("../../schemas/Cart.js");
const Cart = mongoose.model("CartInfo");
require("../../schemas/Pantry.js");
const Pantry = mongoose.model("PantryInfo");
const { getUserIdFromToken } = require('../../utils/TokenDecoder');

// Grab all usernames
router.get('/', async (req, res) => {
  try {
    //Contains all the usernames
    const users = await User.find({}, { username: 1 });
    res.json(users);
  }
  catch (err) {
    res.status(500).json({ error: 'Failed to ferch user' });
  }
});
// Changes the usernames of selected user
router.put('/', async (req, res) => {
  const { userId, username } = req.body;
  // Checks if there is another account with the same username
  const userExist = await User.findOne({ username: username });
  if (userExist) {
    console.log('Username already exists')
    return res.status(400).json({ message: 'Username already exists' });
  }
  // Get the ID of the User who is currently login and status of account
  const currentUser = getUserIdFromToken(req);
  try {
    // Get the ID of the User who username is going to get edit
    const userToEdit = await User.findById(userId);
    // Get the ID of the User who is currently login 
    const currentUserId = await User.findById(currentUser.id);
    if (!userToEdit) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Check if admin is editing themselves
    const isSelf = userToEdit._id.toString() == currentUserId._id.toString();
    // Check to see if Admin is trying to edit another admin
    const isOtherAdmin = userToEdit.accountType.includes('admin') && !isSelf;
    if (isOtherAdmin) {
      return res.status(404).json({ message: 'You cannot edit another admin account' });
    }
    // Change username to new username
    userToEdit.username = username;
    await userToEdit.save();
    res.json({ message: 'Username updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// Delete user account
router.delete('/', async (req, res) => {
  // Contains the id of the user being deleted
  const { userId } = req.body;
  // Get the User who is currently login and status of account
  const currentUser = getUserIdFromToken(req);
  // Get the ID of the User who is currently login and status of account
  const userIdObj = new mongoose.Types.ObjectId(currentUser.id);
  // Find User based on ID
  const currentUserId = await User.findOne({ _id: userIdObj });
  // If Token is missing return error message
  if (!currentUser) {
    return res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
  }

  try {
    // Find user who needs to be deleted based on ID
    const userToDelete = await User.findById(userId);
    if (!userToDelete) return res.status(404).json({ message: 'User not found' });
    // Check if admin is trying to delete their own account
    const isSelf = userToDelete._id.toString() === currentUserId._id.toString();
    // Check if admin is trying to delete another admin account
    const isAdmin = userToDelete.accountType.includes('admin');
    // Admin is trying to delete their own account, send a failing message
    if (isSelf) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    // Admin is trying to delete another admin account, send a failing message
    if (isAdmin) {
      return res.status(400).json({ message: 'You cannot delete another admin account' });
    }
    // Delete User from User, Cart, Preference, and Pantry DB
    await User.findByIdAndDelete(userToDelete._id);
    await Cart.deleteOne({ userId: userId });
    await Preferences.deleteOne({ userId: userId });
    await Pantry.deleteOne({ userId: userId });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

module.exports = router;