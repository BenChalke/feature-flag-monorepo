// handlers/onDisconnect.js (CommonJS)

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const CONNECTIONS_TABLE = process.env.DYNAMODB_CONNECTIONS_TABLE;

const dbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

module.exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId },
      })
    );
    return {
      statusCode: 200,
      body: "Disconnected.",
    };
  } catch (err) {
    console.error("onDisconnect error:", err);
    return {
      statusCode: 500,
      body: "Failed to disconnect.",
    };
  }
};
