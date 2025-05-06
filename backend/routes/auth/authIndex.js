const express = require('express');
const router = express.Router();

// Get all routes from auth
const signupRoute = require('./signup');
const loginRoute = require('./login');
const adminCreateAccountRoute = require('./adminCreateAccount');
const profileRoute = require('./profile');

// Use all the routes
router.use('/signup', signupRoute);
router.use('/login', loginRoute);
router.use('/adminCreateAccount', adminCreateAccountRoute)
router.use('/profile', profileRoute);

module.exports = router;