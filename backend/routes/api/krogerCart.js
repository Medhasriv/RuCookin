const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
// Load models
require("../../schemas/User.js");
require("../../schemas/Cart.js");
const User = mongoose.model("UserInfo");
const Cart = mongoose.model("CartInfo");




