// Importing modules
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
// Import for all the Databases used
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");
require("../../schemas/banWord.js");
const banWord = mongoose.model("banWordInfo");
// Decode the UserId from Token
const { getUserIdFromToken } = require('../../utils/TokenDecoder');

// Add Ban Word
router.post('/add', async (req, res) => {
<<<<<<< Updated upstream
  const { word } = req.body;
  const currentUser = getUserIdFromToken(req);
  console.log(word)
  console.log(currentUser)
  const user = await User.findById(currentUser.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const addedBy = user?.username || null;

  if (!word) return res.status(400).json({ message: 'Missing word' });
  const wordRegex = /^[A-Za-z]+$/;
  if (!wordRegex.test(word)) {
    return res.status(400).json({ message: 'Ban word must contain only alphabets' });
  }

  try {
    const newBan = new banWord({
      word: word.toLowerCase(),
      addedBy: addedBy
    });
    await newBan.save();
    res.json({ message: 'Ban word added' });
  } catch (err) {
    res.status(500).json({ message: 'Could not add word', error: err.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const banWords = await banWord.find({});
    res.json(banWords);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ban words' });
  }
});

router.get('/violations', async (req, res) => {
  try {
    const banWords = await banWord.find({});
    const bannedWords = banWords.map(b => b.word.toLowerCase());

    const users = await User.find({}, 'username firstName lastName');
    const flagged = [];

    for (const user of users) {
      const matches = [];

      for (const banned of bannedWords) {
        if (user.username.toLowerCase().includes(banned)) matches.push(`username: ${user.username}`);
        if (user.firstName && user.firstName.toLowerCase().includes(banned)) matches.push(`firstName: ${user.firstName}`);
        if (user.lastName && user.lastName.toLowerCase().includes(banned)) matches.push(`lastName: ${user.lastName}`);
      }

      if (matches.length > 0) {
        flagged.push({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          matchedFields: matches
        });
=======
    // Word trying to be added to Ban List
    const { word } = req.body;
  //Getting the UserId of the person adding the word
    const currentUser = getUserIdFromToken(req);
  //Find User based on ID
    const user = await User.findById(currentUser.id);
  //If User doesn't exist, send a failing message
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    //Get username of User or set as NULL
    const addedBy = user?.username || null; 
    //If Word doesn't exist, send a failing message
    if (!word) return res.status(400).json({ message: 'Missing word' });
  //Word contains anything but letters, send a failing message
    const wordRegex = /^[A-Za-z]+$/;
    if(!wordRegex.test(word)){
        return res.status(400).json({ message: 'Ban word must contain only alphabets' });
      }
  
    try {
      //Adding Word to Ban Word Database
      const newBan = new banWord({
        word: word.toLowerCase(),
        addedBy: addedBy
      });
      await newBan.save();
      res.json({ message: 'Ban word added' });
    } catch (err) {
      res.status(500).json({ message: 'Could not add word', error: err.message });
    }
  });
//Get List of Ban Word Database
  router.get('/list', async (req, res) => {
    try {
      //Contains all the Ban Word Database
      const banWords = await banWord.find({});
      res.json(banWords);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch ban words' });
    }
  });
//Get List of Violators
  router.get('/violations', async (req, res) => {
    try {
      //Get all the ban Words
      const banWords = await banWord.find({});
      //Set all the ban Words to lowercase
      const bannedWords = banWords.map(b => b.word.toLowerCase());
      //Get all user's username, first name and/or last name
      const users = await User.find({}, 'username firstName lastName'); 
      const flagged = [];
  
      for (const user of users) {
        const matches = [];
        //Find users who might have violated in their username, first name and/or last name
        for (const banned of bannedWords) {
          if (user.username.toLowerCase().includes(banned)) matches.push(`username: ${user.username}`);
          if (user.firstName && user.firstName.toLowerCase().includes(banned)) matches.push(`firstName: ${user.firstName}`);
          if (user.lastName && user.lastName.toLowerCase().includes(banned)) matches.push(`lastName: ${user.lastName}`);
        }
        //Send all the User that violated the ban word 
        if (matches.length > 0) {
          flagged.push({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            matchedFields: matches
          });
        }
>>>>>>> Stashed changes
      }
    }
<<<<<<< Updated upstream

    res.json(flagged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error checking users for banned words', error: err.message });
  }
});
router.post('/remove', async (req, res) => {
  const { word } = req.body
  if (!word) {
    return res.status(400).json({ message: "Missing ban word" });
  }

  try {
    const deletedBanWord = await banWord.findOneAndDelete({ word });
    if (!deletedBanWord) {
      return res.status(404).json({ message: "Ban word not found" });
    }
    return res.status(200).json({ message: "Ban word deleted successfully" });
=======
  });

//Remove Ban Word
  router.post('/remove', async (req, res) => {
    // Word trying to be removed to Ban List
    const { word  } = req.body
    //If Word doesn't exist, send a failing message
    if (!word ) {
      return res.status(400).json({ message: "Missing ban word" });
    }
  
    try {
      //Find deleted word in the Database and delete it
      const deletedBanWord  = await banWord.findOneAndDelete({ word });
      //If Word is not found, send a failing message
      if (!deletedBanWord) {
        return res.status(404).json({ message: "Ban word not found" });
      }
      //Successfully deleted word
      return res.status(200).json({ message: "Ban word deleted successfully" });
  
    } catch (error) {
      console.error("❌ Error deleting ban word:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports = router;


>>>>>>> Stashed changes

  } catch (error) {
    console.error("❌ Error deleting ban word:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;