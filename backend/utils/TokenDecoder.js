//import jwt for token
const jwt = require("jsonwebtoken");

//gets user ID from Token
const getUserIdFromToken = (req) => {
  //Grab token from header
  const authHeader = req.headers.authorization;
  //If not found, return fail
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  //contains token from splitting the header
  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    //get all the information from token
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    //return id and account tyep
    return {
      id: decoded.id,
      accountType: decoded.accountType,
    };
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return null;
  }
};
module.exports = { getUserIdFromToken };