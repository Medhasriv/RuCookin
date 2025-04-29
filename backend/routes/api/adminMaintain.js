const express = require("express");
const db = require("../../dbSetup.js");
const mongoose = require("mongoose");
const router = express.Router();

require("../../schemas/User.js");
const User = mongoose.model("UserInfo");
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
    const { username } = req.body;
    const currentUserId = req.user._id;
    try {
        const userToEdit = await User.findById(req.params.id);
        const currentUser = await User.findById(currentUserId);
        if (!userToEdit) return res.status(404).json({ message: 'User not found' });
        const isSelf= userToEdit._id.toString() === currentUserId.toString()
        const isOtherAdmin = userToEdit.AccountType.includes('admin') && !isSelf;

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
    const currentUserId = getUserIdFromToken(req);
  
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
    }
  
    try {
      const userToDelete = await User.findById(userId);
      const currentUser = await User.findById(currentUserId);
  
      if (!userToDelete) return res.status(404).json({ message: 'User not found' });
  
      const isSelf = userToDelete._id.toString() === currentUserId.toString();
      const isAdmin = userToDelete.AccountType.includes('admin');
  
      if (isSelf) {
        return res.status(403).json({ message: 'You cannot delete your own account' });
      }
  
      if (isAdmin) {
        return res.status(403).json({ message: 'You cannot delete another admin account' });
      }
  
      await User.findByIdAndDelete(userToDelete._id);
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
  });
  

module.exports = router;


