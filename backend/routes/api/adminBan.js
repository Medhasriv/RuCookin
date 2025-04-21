const express = require('express');
const router = express.Router();
const BanWord = require('../../models/banWord');
require("../../schemas/User.js");
const User = mongoose.model("UserInfo");

require("../../schemas/banWord.js");
const  banWord = mongoose.model("banWordInfo");

const mongoose = require('mongoose');



router.post('/add', async (req, res) => {
    const { word, addedBy } = req.body;
  
    if (!word) return res.status(400).json({ message: 'Missing word' });
    const wordRegex = /^[A-Za-z]+$/;
    if(!wordRegex.test(word)){
        return res.status(400).json({ message: 'Ban word must contain only alphabets' });
      }
  
    try {
      const newBan = new BanWord({
        word: word.toLowerCase(),
        addedBy: addedBy || null
      });
      await newBan.save();
      res.json({ message: 'Ban word added' });
    } catch (err) {
      res.status(500).json({ message: 'Could not add word', error: err.message });
    }
  });

  router.get('/list', async (req, res) => {
    try {
      const banWords = await BanWord.find({});
      res.json(banWords);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch ban words' });
    }
  });

  router.get('/violations', async (req, res) => {
    try {
      const banWords = await BanWord.find({});
      const bannedWords = banWords.map(b => b.word.toLowerCase());
  
      const users = await User.find({}, 'username firstName lastName'); 
      const flagged = [];
  
      for (const user of users) {
        const matches = [];
  
        for (const banned of bannedWords) {
          if (user.username.toLowerCase().includes(banned)) matches.push(`username: ${user.username}`);
          if (user.firstName.toLowerCase().includes(banned)) matches.push(`firstName: ${user.firstName}`);
          if (user.lastName.toLowerCase().includes(banned)) matches.push(`lastName: ${user.lastName}`);
        }
  
        if (matches.length > 0) {
          flagged.push({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            matchedFields: matches
          });
        }
      }
  
      res.json(flagged);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error checking users for banned words', error: err.message });
    }
  });





