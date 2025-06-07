// handlers/getFlags.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { authorize, buildResponse } = require("./auth/util");

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports.handler = async (event) => {
  try {
    // ─── AUTH ─────────────────────────────────────────────────────
    authorize(event);

    console.log("getFlags invoked, event:", JSON.stringify(event));
    const tableName = process.env.DYNAMODB_FLAGS_TABLE;

    const result = await ddb.send(new ScanCommand({ TableName: tableName }));
    const items = result.Items || [];
    const sorted = items.sort((a, b) => a.id - b.id);

    return buildResponse(200, sorted);
  } catch (err) {
    console.error("getFlags error:", err);
    const unauthorized = err.message === "Not authenticated";
    return buildResponse(unauthorized ? 401 : 500, {
      error: unauthorized ? "Not authenticated." : "Failed to fetch flags.",
    });
  }
};
