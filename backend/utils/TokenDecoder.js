const jwt = require("jsonwebtoken");

const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;
  console.log("🛡️ authHeader:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  console.log("🔐 extracted token:", token);
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("🔐 decoded token:", decoded);
    console.log("🔐 id token:", decoded.id);
    console.log("THE USERID TOKEN IS: ", decoded.id)
    console.log("THE ACCOUNTTYPE TOKEN IS: ", decoded.accountType);
    return {
      id: decoded.id,
      accountType: decoded.accountType,
    };
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return null;
  }
};
module.exports = { getUserIdFromToken };