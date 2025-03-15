const express = require('express');
const router = express.Router();

// Get all routes from api
const cuisineLikeRoute = require('./cuisineLike');
const cuisineDisikeRoute = require('./cuisineDisike');
const dietRoute = require('./diet');
const intoleranceRoute = require('./intolerance');
// Use all the routes
router.use('/cuisineLike', cuisineLikeRoute);
router.use('/cuisineDisike', cuisineDisikeRoute);
router.use('/diet', dietRoute);
router.use('/intolerance', intoleranceRoute);
module.exports = router;