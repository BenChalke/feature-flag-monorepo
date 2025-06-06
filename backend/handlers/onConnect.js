// handlers/onConnect.js  (CommonJS)

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const CONNECTIONS_TABLE = process.env.DYNAMODB_CONNECTIONS_TABLE;

const ddbClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  console.log("[onConnect] invoked with connectionId =", connectionId);

  try {
    await ddb.send(
      new PutCommand({
        TableName: CONNECTIONS_TABLE,
        Item: { connectionId },
      })
    );
    console.log("[onConnect] Stored connectionId in", CONNECTIONS_TABLE);
  } catch (err) {
    console.error("[onConnect] Error writing to ConnectionsTable:", err);
    // Still return 200 so the WebSocket remains open
  }

  return {
    statusCode: 200,
    body: "Connected.",
  };
};
