const express = require('express');
const router = express.Router();

const cors = require('cors');
router.use(cors());

// Get all routes from api and auth
const authRoutes = require('./auth/authIndex');
//const apiRoutes = require('./api/apiIndex');  WHEN WE MAKE APIS UNCOMMENT THIS OUT

// Use all routes from api and auth
//router.use('/api', apiRoutes); WHEN WE MAKE APIS UNCOMMENT THIS OUT
router.use('/auth', authRoutes);

module.exports = router;