const express = require('express');
const axios = require('axios');
const qs = require('qs');
const jwt = require("jsonwebtoken");

const router = express.Router();
const tokenStore = new Map();

router.get('/', async (req, res) => {
  const { code } = req.query;
  const authHeader = req.headers.authorization;
  console.log("💬 Callback req.query:", req.query);
  console.log("🛡️ Callback req.headers.authorization:", authHeader);

  if (!code || !authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ error: "Missing code or token" });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("🔐 Decoded user token:", decoded);
  } catch (err) {
    console.error("❌ JWT decode failed:", err.message);
    return res.status(401).json({ error: "Invalid JWT" });
  }

  const userId = decoded.id;
  if (!userId) {
    console.error("🚨 No userId in decoded token.");
    return res.status(400).json({ error: "Invalid token" });
  }

  try {
    const { KROGER_CLIENT_ID, KROGER_CLIENT_SECRET, KROGER_REDIRECT_URI } = process.env;

    const response = await axios.post("https://api.kroger.com/v1/connect/oauth2/token", qs.stringify({
      grant_type: "authorization_code",
      code,
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
    console.log("✅ Got Kroger access token:", accessToken);

    const userIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip;

    tokenStore.set(userIp, accessToken);
    console.log("🔐 Stored Kroger token under IP:", userIp);


    // You can redirect or send a simple response
    res.redirect("http://localhost:8081/KrogerShoppingCart");
  } catch (err) {
    console.error("❌ Kroger token exchange failed:", err.message);
    res.status(500).json({ error: "Token exchange failed" });
  }
});

module.exports = { router, tokenStore };
