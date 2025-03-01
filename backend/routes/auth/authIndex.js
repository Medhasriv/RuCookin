const express = require('express');
const router = express.Router();

// Get all routes from auth
const signupRoute = require('./signup');
const loginRoute = require('./login');
const UserInformRoute = require('./getUserInform');
// Use all the routes
router.use('/signup', signupRoute);
router.use('/login', loginRoute);
router.use('/getUserInform', UserInformRoute);
module.exports = router;