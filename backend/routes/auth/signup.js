const express = require('express');
//const bcrypt = require('bcrypt');
const db = require('../../dbSetup');
const { default: mongoose } = require('mongoose');

const router = express.Router();

//CREATING SCHEMAS 
const userSchema = new mongoose.Schema ({
  username: {type: String, unique:true},
  password: String,
  email: {type: String, unique:true}, 
});
const foodSchema= new mongoose.Schema ({
  diet: {
    type:String, 
    enum: ['vegetarian', 'vegan', 'kosher', 'halal', 'lactose-free', 'pescetarian', 'keto', 'gluten-free']
  },
  allergies: {
    type: [String],
    default: []
  },
  preferenceIngredients: {
    type: [String],
    default: []
  },
  likeCuisine: {
    type: [String],
    default: []
  },
  dislikeCuisine: {
    type: [String],
    default: []
  },
  savedRecipes: {
    type: [String],
    default: []
  }

});

const User = mongoose.model('User', userSchema);
const Food = mongoose.model('Food', foodSchema);

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