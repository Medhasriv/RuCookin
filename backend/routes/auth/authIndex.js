const express = require('express');
const router = express.Router();

// Get all routes from auth
const signupRoute = require('./signup');
//const loginRoute = require('./login'); DOESNT EXIST YET
// Use all the routes
router.use('/signup', signupRoute);
//router.use('/login', loginRoute); DOESNT EXIST YET

module.exports = router;