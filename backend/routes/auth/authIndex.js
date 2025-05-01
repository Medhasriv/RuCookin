const express = require('express');
const router = express.Router();

// Get all routes from auth
const signupRoute = require('./signup');
const loginRoute = require('./login');
const krogerLoginRoute = require('./krogerLogin');
const krogerCallbackRoute = require('./krogerCallback');
const adminCreateAccountRoute = require('./adminCreateAccount');
const profileRoute = require('./profile');

// Use all the routes
router.use('/signup', signupRoute);
router.use('/login', loginRoute);
router.use('/krogerLogin', krogerLoginRoute);
router.use('/adminCreateAccount', adminCreateAccountRoute)
router.use('/krogerCallback', krogerCallbackRoute);
router.use('/profile', profileRoute);

module.exports = router;