// handlers/auth/me.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://featureflag.benchalke.com",
];

function buildResponse(statusCode, bodyObj) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.join(","),  // allow your frontends
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(bodyObj),
  };
}

module.exports.handler = async (event) => {
  try {
    // 1) Try Authorization header first
    let token = null;
    const auth = event.headers.Authorization || event.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
      token = auth.slice(7);
    }

    // 2) Fallback to cookie if no header
    if (!token) {
      const cookie = event.headers.Cookie || event.headers.cookie || "";
      const m = cookie.match(/token=([^;]+)/);
      if (m) token = m[1];
    }

    if (!token) {
      return buildResponse(401, { error: "Not authenticated." });
    }

    // 3) Verify
    const payload = jwt.verify(token, JWT_SECRET);

    // 4) Return user info
    return buildResponse(200, {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
  } catch (err) {
    console.warn("Me error:", err);
    return buildResponse(401, { error: "Not authenticated." });
  }
};
