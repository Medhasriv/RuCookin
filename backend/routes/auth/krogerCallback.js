const express = require('express');
const axios = require('axios');
const qs = require('qs');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/', async (req, res) => {
  console.log("INSIDE CALLBACK");
  const { code, state } = req.query;
  console.log("💬 Callback req.query:", req.query);

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const { KROGER_CLIENT_ID, KROGER_CLIENT_SECRET, KROGER_REDIRECT_URI } = process.env;

    const response = await axios.post(
      "https://api.kroger.com/v1/connect/oauth2/token",
      qs.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: KROGER_REDIRECT_URI,
      }),
      {
        auth: {
          username: KROGER_CLIENT_ID,
          password: KROGER_CLIENT_SECRET,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = response.data.access_token;
    console.log("✅ Got Kroger access token:", accessToken);

    // ✅ Store token in session
    req.session.krogerToken = accessToken;

    // ✅ Redirect back to frontend
    res.redirect("http://localhost:8081/KrogerShoppingCart");

    res.redirect(redirectTo);
  } catch (err) {
    console.error("❌ Kroger token exchange failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Token exchange failed" });
  }
});

module.exports = router;