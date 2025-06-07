// handlers/auth/util.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

function authorize(event) {
  // 1) Extract token from Authorization header or cookie
  let token;
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    const cookie = event.headers.cookie || "";
    const match = cookie.match(/token=([^;]+)/);
    if (match) token = match[1];
  }

  // 2) No token ⇒ unauthorized
  if (!token) {
    const err = new Error("Not authenticated");
    err.statusCode = 401;
    throw err;
  }

  // 3) Verify JWT
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    const err = new Error("Not authenticated");
    err.statusCode = 401;
    throw err;
  }
}

function buildResponse(statusCode, bodyObj) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(bodyObj),
  };
}

module.exports = { authorize, buildResponse };
