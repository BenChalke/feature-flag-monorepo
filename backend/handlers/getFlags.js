// handlers/getFlags.js

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { authorize } = require("./auth/util");

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports.handler = async (event) => {
  try {
    authorize(event);

    console.log("getFlags invoked, event:", JSON.stringify(event));
    const tableName = process.env.DYNAMODB_FLAGS_TABLE;
    console.log("getFlags → scanning table:", tableName);

    const result = await ddb.send(new ScanCommand({ TableName: tableName }));
    const items = result.Items || [];
    console.log(`getFlags → found ${items.length} items`);

    const sorted = items.sort((a, b) => a.id - b.id);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sorted),
    };
  } catch (err) {
    console.error("getFlags error:", err);
    const unauthorized = err.message === "Not authenticated";
    return {
      statusCode: unauthorized ? 401 : 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: unauthorized ? "Not authenticated." : "Failed to fetch flags.",
      }),
    };
  }
};
