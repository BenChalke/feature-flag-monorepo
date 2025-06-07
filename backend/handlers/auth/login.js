// handlers/auth/login.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Create DynamoDB client
const REGION = process.env.AWS_REGION || "us-east-1";
const USERS_TABLE = process.env.USERS_TABLE;
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

// Lambda handler
module.exports.handler = async (event) => {
  try {
    // 1) Parse body
    const { email, password } = JSON.parse(event.body || "{}");
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and password are required." }),
      };
    }

    // 2) Fetch user record
    const { Item: user } = await ddb.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { email },
      })
    );
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid email or password." }),
      };
    }

    // 3) Compare password
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid email or password." }),
      };
    }

    // 4) Sign JWT
    const token = jwt.sign(
      { email, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || "1h" }
    );

    // 5) Return it
    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
      headers: { "Content-Type": "application/json" },
    };
  } catch (err) {
    console.error("[login] error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error during login." }),
    };
  }
};
