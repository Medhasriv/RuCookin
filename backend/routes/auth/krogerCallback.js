const express = require('express');
const axios = require('axios');
const qs = require('qs');
const router = express.Router();


const tokenStore = new Map(); 

router.get('/', async (req, res) => {
  const code = req.query.code;
  const { KROGER_CLIENT_ID, KROGER_CLIENT_SECRET, KROGER_REDIRECT_URI } = process.env;

  const basicAuth = Buffer.from(`${KROGER_CLIENT_ID}:${KROGER_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post(
      'https://api.kroger.com/v1/connect/oauth2/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: KROGER_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    const accessToken = response.data.access_token;

    tokenStore.set(req.ip, accessToken);

    res.json({ message: 'Authenticated! Please exit the page'});
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Token exchange failed');
  }
});

module.exports = router;
