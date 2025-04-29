const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();

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


router.get('/', async(req,res) => {
    try {
        const users = await User.find({}, { username: 1 });
        res.json(users);
    }
    catch(err) {
        res.status(500).json({error: 'Failed to ferch user'});
    }
});

router.put('/', async(req,res) => {
    const { userId, username } = req.body; 
    const userExist = await User.findOne({ username: username });
    if (userExist) {
      console.log('Username already exists')
      return res.status(400).json({ message: 'Username already exists' });
    }
    const currentUser = getUserIdFromToken(req);
    console.log(currentUser)
    console.log(username)
    try {
        const userToEdit = await User.findById(userId);
        console.log(userToEdit)
        const currentUserId = await User.findById(currentUser.id);
        console.log(currentUserId)
        if (!userToEdit) {
          return res.status(404).json({ message: 'User not found' });
        }
        console.log("userToEdit._id:", userToEdit._id.toString());
        console.log("currentUser._id:", currentUserId._id.toString());
        console.log("BeforeSelf")
        const isSelf = userToEdit._id.toString() == currentUserId._id.toString();
        console.log("isSelf")
        console.log(isSelf)
        console.log("isSelf")
        const isOtherAdmin = userToEdit.accountType.includes('admin') && !isSelf;
        console.log("isOtherAdmin")
        console.log(isOtherAdmin)
        console.log("isOtherAdmin")
    if (isOtherAdmin) {
      return res.status(403).json({ message: 'You cannot edit another admin account' });
    }
    userToEdit.username = username;
    await userToEdit.save();
    res.json({ message: 'Username updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});


router.delete('/', async (req, res) => {
    const { userId } = req.body;
    console.log("userId")
    console.log(userId)
    console.log("userId")
    const currentUser = getUserIdFromToken(req);
    const currentUserId = await User.findById(currentUser.id);
    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
    }
  
    try {
      const userToDelete = await User.findById(userId);
  
      if (!userToDelete) return res.status(404).json({ message: 'User not found' });
  
      const isSelf = userToDelete._id.toString() === currentUserId.toString();
      const isAdmin = userToDelete.accountType.includes('admin');
  
      if (isSelf) {
        return res.status(403).json({ message: 'You cannot delete your own account' });
      }
  
      if (isAdmin) {
        return res.status(403).json({ message: 'You cannot delete another admin account' });
      }
  
      await User.findByIdAndDelete(userToDelete._id);
      await Cart.deleteOne({ userId: userId });
      await Preference.deleteOne({ userId: userId });
      await Pantry.deleteOne({ userId: userId });

      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
  });
  

module.exports = router;


