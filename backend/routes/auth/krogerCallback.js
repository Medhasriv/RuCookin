const express = require('express');
const axios = require('axios');
const qs = require('qs');
const router = express.Router();


const tokenStore = new Map(); 

router.get('/', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const { KROGER_CLIENT_ID, KROGER_CLIENT_SECRET, KROGER_REDIRECT_URI } = process.env;

    const response = await axios.post("https://api.kroger.com/v1/connect/oauth2/token", qs.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: KROGER_REDIRECT_URI,
    }), {
      auth: {
        username: KROGER_CLIENT_ID,
        password: KROGER_CLIENT_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;
    tokenStore.set(req.ip, accessToken); // ✅ Store access token by IP

    // Optional: redirect or confirm success
    res.redirect("http://localhost:8081/KrogerShoppingCart"); // Or your React Native screen URL

  } catch (err) {
    console.error("❌ Kroger OAuth callback error:", err.message);
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
});

module.exports = { router, tokenStore };