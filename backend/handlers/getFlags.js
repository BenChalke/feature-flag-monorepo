// handlers/getFlags.js (CommonJS)
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports.handler = async (event) => {
  console.log("getFlags invoked, event:", JSON.stringify(event));
  const tableName = process.env.DYNAMODB_FLAGS_TABLE;
  console.log("getFlags → scanning table:", tableName);

  try {
    const result = await ddb.send(
      new ScanCommand({ TableName: tableName })
    );
    const items = result.Items || [];
    console.log(`getFlags → found ${items.length} items`);

    const sorted = items.sort((a, b) => a.id - b.id);
    return {
      statusCode: 200,
      body: JSON.stringify(sorted),
      headers: { "Content-Type": "application/json" },
    };
  } catch (err) {
    console.error("getFlags → DynamoDB scan failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch flags." }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
