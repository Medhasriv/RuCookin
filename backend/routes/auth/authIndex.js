const express = require('express');
const router = express.Router();

// Get all routes from auth
const signupRoute = require('./signup');
const loginRoute = require('./login');
const UserInfoRoute = require('./getUserInfo');
const updateProfileRoute = require('./updateProfile');
const krogerLoginRoute = require('./krogerLogin');
const { router: krogerCallbackRouter } = require('./krogerCallback'); 
// Use all the routes
router.use('/signup', signupRoute);
router.use('/login', loginRoute);
router.use('/getUserInfo', UserInfoRoute);
router.use('/updateProfile', updateProfileRoute);
router.use('/krogerLogin', krogerLoginRoute);

router.use('/krogerCallback', krogerCallbackRouter);
module.exports = router;