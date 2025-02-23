const express = require('express');
//const bcrypt = require('bcrypt');
const db = require('../../dbSetup');
const { default: mongoose } = require('mongoose');
const router = express.Router();

require('../../schemas/User.js')
const User = mongoose.model("UserInfo");

router.post('/', async (req,res) => {
  const {username, password, email} = req.body;
  const userExist = await User.findOne({username : username});
  const emailExist = await User.findOne({email : email});
  if (userExist) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  else if (emailExist) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  else {
    const newUser = new User ({ username: username, password: password, email:email});
    await newUser.save();
    res.status(200).json({message: 'Successfully created user'})
  }
  
});

module.exports = router;