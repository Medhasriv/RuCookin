const express = require('express');
const router = express.Router();

// Get all routes from api
const cuisineLikeRoute = require('./cuisineLike');
const cuisineDisikeRoute = require('./cuisineDislike');
const dietRoute = require('./diet');
const intoleranceRoute = require('./intolerance');
const shoppingCartRoute = require('./shoppingCart');
const KrogerCartRoute = require('./krogerCart');
const KrogerTestRoute = require('./KrogerTest');
const favoriteRecipeRoute = require('./favoriteRecipe');
const pantryRoute = require('./pantry');
// Use all the routes
router.use('/cuisineLike', cuisineLikeRoute);
router.use('/cuisineDislike', cuisineDisikeRoute);
router.use('/diet', dietRoute);
router.use('/intolerance', intoleranceRoute);
router.use('/shoppingCart', shoppingCartRoute);
router.use('/KrogerTest', KrogerTestRoute);
router.use('/favoriteRecipe', favoriteRecipeRoute);
router.use('/pantry', pantryRoute);
router.use('/krogerCart', KrogerCartRoute);
module.exports = router;
