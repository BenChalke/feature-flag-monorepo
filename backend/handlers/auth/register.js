// handlers/auth/register.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");

const REGION = process.env.AWS_REGION || "us-east-1";
const USERS_TABLE = process.env.USERS_TABLE;
const ddbClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports.handler = async (event) => {
  try {
    const { firstName, lastName, email, password } = JSON.parse(event.body || "{}");
    if (!firstName || !lastName || !email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: "All fields are required." }) };
    }

    // 1) Check for existing user
    const existing = await ddb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { email }
    }));
    if (existing.Item) {
      return { statusCode: 409, body: JSON.stringify({ error: "Email already registered." }) };
    }

    // 2) Hash password
    const hash = await bcrypt.hash(password, 10);

    // 3) Store user
    const userItem = {
      email,
      firstName,
      lastName,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };
    await ddb.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: userItem
    }));

    // 4) Return public profile
    const { passwordHash, ...publicUser } = userItem;
    return {
      statusCode: 201,
      body: JSON.stringify(publicUser),
    };

  } catch (err) {
    console.error("Register error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Registration failed." }) };
  }
};
