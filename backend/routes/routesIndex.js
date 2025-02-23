const express = require('express');
const router = express.Router();

// Get all routes from api and auth
const authRoutes = require('./auth/authIndex');
//const apiRoutes = require('./api/apiIndex');  WHEN WE MAKE APIS UNCOMMENT THIS OUT

// Use all routes from api and auth
//router.use('/api', apiRoutes); WHEN WE MAKE APIS UNCOMMENT THIS OUT
router.use('/auth', authRoutes);

module.exports = router;