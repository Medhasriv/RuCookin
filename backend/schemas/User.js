const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    location: {
      type: String,
      required: false,
      max: 200,
    },
    accountType: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true
    },
  }, {
  collection: 'UserInfo'
});

module.exports = mongoose.model("UserInfo", userSchema);