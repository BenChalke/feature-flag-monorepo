// handlers/deleteFlag.js

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  DeleteCommand,
  ScanCommand,
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
  console.log("[deleteFlag] event.requestContext:", JSON.stringify(event.requestContext));
  console.log("[deleteFlag] event.pathParameters.id:", event.pathParameters?.id);

  try {
    // 1) Extract the numeric flag ID
    const flagId = parseInt(event.pathParameters.id, 10);
    if (isNaN(flagId)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid flag ID." }),
      };
    }

    // 2) Delete the flag from the FlagsTable
    console.log(`[deleteFlag] Deleting FlagsTable id=${flagId}`);
    await ddb.send(
      new DeleteCommand({
        TableName: process.env.DYNAMODB_FLAGS_TABLE,
        Key: { id: flagId },
      })
    );
    console.log("[deleteFlag] DynamoDB delete successful");

    // 3) Scan the ConnectionsTable for all connection IDs
    const scanResult = await ddb.send(
      new ScanCommand({
        TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
        ProjectionExpression: "connectionId",
      })
    );
    const connectionItems = scanResult.Items || [];
    console.log(`[deleteFlag] Retrieved ${connectionItems.length} connection(s)`);

    // 4) Broadcast { event: "flag-deleted", id: <flagId> } to each client
    console.log("[deleteFlag] WebSocket endpoint:", WS_ENDPOINT);
    const apigwClient = new ApiGatewayManagementApiClient({
      region: REGION,
      endpoint: WS_ENDPOINT,
    });

    const payloadBuffer = Buffer.from(
      JSON.stringify({ event: "flag-deleted", id: flagId })
    );

    // 5) For each connectionId, attempt to post. On 404/410, delete stale entry
    const postCalls = connectionItems.map(({ connectionId }) =>
      apigwClient
        .send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: payloadBuffer,
          })
        )
        .then(() => {
          console.log(`[deleteFlag] Successfully posted to ${connectionId}`);
        })
        .catch(async (err) => {
          const status = err.$metadata?.httpStatusCode;
          console.error(
            `[deleteFlag] postToConnection error for ${connectionId}:`,
            status,
            err.name || err.message
          );
          if (status === 404 || status === 410) {
            console.log(`[deleteFlag] Deleting stale connection ${connectionId}`);
            try {
              await ddb.send(
                new DeleteCommand({
                  TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
                  Key: { connectionId },
                })
              );
              console.log(`[deleteFlag] Deleted stale connection ${connectionId}`);
            } catch (deleteErr) {
              console.error(
                `[deleteFlag] Failed to delete stale connection ${connectionId}:`,
                deleteErr
              );
            }
          }
        })
    );

    await Promise.all(postCalls);
    console.log("[deleteFlag] Broadcast complete");

    // 6) Return success
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("[deleteFlag] Unexpected error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to delete flag." }),
    };
  }
};
