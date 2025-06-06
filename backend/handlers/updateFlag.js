// handlers/updateFlag.js (CommonJS)

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  ScanCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} = require("@aws-sdk/client-apigatewaymanagementapi");

const REGION = process.env.AWS_REGION || "us-east-1";
const WS_ENDPOINT = process.env.WEBSOCKET_ENDPOINT; // from serverless.yml
const ddbClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports.handler = async (event) => {
  console.log("[updateFlag] event.requestContext:", JSON.stringify(event.requestContext));
  console.log("[updateFlag] event.pathParameters.id:", event.pathParameters?.id);
  console.log("[updateFlag] event.body:", event.body);
  console.log("[updateFlag] Using WebSocket endpoint from ENV:", WS_ENDPOINT);

  try {
    // 1) Extract flagId and new enabled state
    const flagId = parseInt(event.pathParameters.id, 10);
    const parsed = JSON.parse(event.body || "{}");
    const { enabled } = parsed;
    console.log(`[updateFlag] Parsed body → enabled:`, enabled);

    if (typeof enabled !== "boolean") {
      console.warn("[updateFlag] Invalid `enabled` value:", enabled);
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing or invalid `enabled` boolean." }),
      };
    }

    // 2) Update the flag in DynamoDB
    console.log(`[updateFlag] Updating FlagsTable id=${flagId}, set enabled=${enabled}`);
    await ddb.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_FLAGS_TABLE,
        Key: { id: flagId },
        UpdateExpression: "SET enabled = :e",
        ExpressionAttributeValues: { ":e": enabled },
      })
    );
    console.log("[updateFlag] DynamoDB update successful");

    // 3) Scan the ConnectionsTable
    const scanResult = await ddb.send(
      new ScanCommand({
        TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
        ProjectionExpression: "connectionId",
      })
    );
    const connectionItems = scanResult.Items || [];
    console.log(`[updateFlag] Retrieved ${connectionItems.length} connection(s)`);

    // 4) Use the WebSocket endpoint from environment
    const apigwClient = new ApiGatewayManagementApiClient({
      region: REGION,
      endpoint: WS_ENDPOINT,
    });

    // 5) Broadcast to each connection
    const payloadBuffer = Buffer.from(JSON.stringify({ event: "flag-updated", id: flagId }));
    const postCalls = connectionItems.map(({ connectionId }) =>
      apigwClient
        .send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: payloadBuffer,
          })
        )
        .then(() => {
          console.log(`[updateFlag] Successfully posted to ${connectionId}`);
        })
        .catch(async (err) => {
          const status = err.$metadata?.httpStatusCode;
          console.error(
            `[updateFlag] postToConnection error for ${connectionId}:`,
            status,
            err.name || err.message
          );

          if (status === 404 || status === 410) {
            console.log(`[updateFlag] Deleting stale connection ${connectionId}`);
            try {
              await ddb.send(
                new DeleteCommand({
                  TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
                  Key: { connectionId },
                })
              );
              console.log(`[updateFlag] Deleted stale connection ${connectionId}`);
            } catch (deleteErr) {
              console.error(
                `[updateFlag] Failed to delete stale connection ${connectionId}:`,
                deleteErr
              );
            }
          }
        })
    );

    await Promise.all(postCalls);
    console.log("[updateFlag] Broadcast complete");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("[updateFlag] Unexpected error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to update flag." }),
    };
  }
};
