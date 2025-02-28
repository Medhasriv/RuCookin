const express = require('express');
const db = require('../../dbSetup');
const { default: mongoose } = require('mongoose');
const router = express.Router();
require('../../schemas/User.js');
const User = mongoose.model("UserInfo");
require('../../schemas/User.js');
const Preferences = mongoose.model("UserPreferences");


