// handlers/auth/util.js

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Extracts and verifies the Bearer token from Authorization header.
 * Throws Error("Not authenticated") on missing or invalid token.
 */
function authorize(event) {
  const auth = event.headers?.authorization || event.headers?.Authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error("Not authenticated");
  return jwt.verify(match[1], JWT_SECRET);
}

module.exports = { authorize };
