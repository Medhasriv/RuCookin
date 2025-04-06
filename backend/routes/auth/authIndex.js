const express = require('express');
const router = express.Router();

// Get all routes from auth
const signupRoute = require('./signup');
const loginRoute = require('./login');
const UserInfoRoute = require('./getUserInfo');
const updateProfileRoute = require('./updateProfile');
// Use all the routes
router.use('/signup', signupRoute);
router.use('/login', loginRoute);
router.use('/getUserInfo', UserInfoRoute);
router.use('/updateProfile', updateProfileRoute);

module.exports = router;