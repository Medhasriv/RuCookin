const express = require('express');
const router = express.Router();

// Get all routes from auth
const signupRoute = require('./signup');
const loginRoute = require('./login');
//const UserInfoRoute = require('./getUserInfo');
// Use all the routes
router.use('/signup', signupRoute);
router.use('/login', loginRoute);
//router.use('/getUserInfo', UserInfoRoute);
module.exports = router;