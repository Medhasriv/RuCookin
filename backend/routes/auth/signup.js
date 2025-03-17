const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../dbSetup');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET_KEY;
require('../../schemas/User.js');
const User = mongoose.model("UserInfo");

router.post('/', async (req,res) => {
  const {firstName, lastName, username, password, email} = req.body;
  if (!firstName || !lastName || !username || !password || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
  }

  if (password.length < 5) {
    return res.status(400).json({ message: 'Password must be at least 5 characters long' });
  }
  if (firstName.length < 2 || firstName.length > 50) {
    return res.status(400).json({ message: 'First Name must be between 2 and 50 characters' });
  }
  if (lastName.length < 2 || lastName.length > 50) {
    return res.status(400).json({ message: 'Last Name must be between 2 and 50 characters' });
  }
  if (email.length > 50) {
    return res.status(400).json({ message: 'Email must be under 50 characters' });
  }
  const nameRegex = /^[A-Za-z]+$/;
  if(!nameRegex.test(firstName)){
    return res.status(400).json({ message: 'First name must contain only alphabets' });
  }
  if(!nameRegex.test(lastName)){
    return res.status(400).json({ message: 'Last name must contain only alphabets' });
  }


  const userExist = await User.findOne({username : username});
  const emailExist = await User.findOne({email : email});
  if (userExist) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  else if (emailExist) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  else {
    const encrpyVal = 11;
    const hashedPassword = await bcrypt.hash(password, encrpyVal);
    const newUser = new User ({ username: username, password: hashedPassword, email:email, firstName: firstName, lastName:lastName});
    await newUser.save();
     const token = jwt.sign(
    
        { username: newUser.username, firstName: newUser.firstName,lastName: newUser.lastName, email: newUser.email, picturePath: newUser.picturePath},
        SECRET_KEY, 
        { expiresIn: '2h' }
      );
      res.status(200).json({ message: 'Sign up successful' , token});
  }
  
});

module.exports = router;