const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { KROGER_CLIENT_ID, KROGER_REDIRECT_URI } = process.env;
  const scope = 'product.compact'; 

  const authURL = `https://api.kroger.com/v1/connect/oauth2/authorize?client_id=${KROGER_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(KROGER_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;

  res.redirect(authURL);
});

module.exports = router;
