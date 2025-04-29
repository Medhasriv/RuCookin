const express = require('express');
const router = express.Router();

// Get all routes from api
const cuisineLikeRoute = require('./cuisineLike');
const cuisineDisikeRoute = require('./cuisineDislike');
const dietRoute = require('./diet');
const intoleranceRoute = require('./intolerance');
const shoppingCartRoute = require('./shoppingCart');
const KrogerCartRoute = require('./krogerCart');
const favoriteRecipeRoute = require('./favoriteRecipe');
const pantryRoute = require('./pantry');
const adminBanRoute = require('./adminBan');
const adminRecipeRoute = require('./adminCreateRecipe');
const adminTopRoute = require('./adminTop');
const adminMaintainRoute = require ('./adminMaintain')
// Use all the routes
router.use('/cuisineLike', cuisineLikeRoute);
router.use('/cuisineDislike', cuisineDisikeRoute);
router.use('/diet', dietRoute);
router.use('/intolerance', intoleranceRoute);
router.use('/shoppingCart', shoppingCartRoute);
router.use('/favoriteRecipe', favoriteRecipeRoute);
router.use('/pantry', pantryRoute);
router.use('/krogerCart', KrogerCartRoute);
router.use('/adminBan', adminBanRoute);
router.use('/adminCreateRecipe', adminRecipeRoute);
router.use('/adminTop', adminTopRoute);
router.use('/adminMaintain', adminMaintainRoute);
module.exports = router;

