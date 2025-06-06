// handlers/createFlag.js

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} = require("@aws-sdk/client-apigatewaymanagementapi");

// 1) Region and Dynamo clients
const REGION = process.env.AWS_REGION || "us-east-1";
const ddbClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports.handler = async (event) => {
  try {
    // 2) Parse request body
    const { name, environment } = JSON.parse(event.body || "{}");
    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      !["Production", "Staging", "Development"].includes(environment)
    ) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid `name` or `environment`." }),
      };
    }

    // 3) Atomically increment a counter for a new numeric ID
    const counterRes = await ddb.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_COUNTERS_TABLE,
        Key: { counterName: "flagId" },
        UpdateExpression: "ADD #v :inc",
        ExpressionAttributeNames: { "#v": "currentValue" },
        ExpressionAttributeValues: { ":inc": 1 },
        ReturnValues: "UPDATED_NEW",
      })
    );
    const newId = counterRes.Attributes.currentValue;

    // 4) Build the new flag object
    const newFlag = {
      id: newId,
      name: name.trim(),
      environment,
      enabled: false,
      created_at: new Date().toISOString(),
    };

    // 5) Write the new flag into the Flags table
    await ddb.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_FLAGS_TABLE,
        Item: newFlag,
      })
    );

    // 6) Scan the Connections table for all connectionIds
    const scanResult = await ddb.send(
      new ScanCommand({
        TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
        ProjectionExpression: "connectionId",
      })
    );
    const connectionItems = scanResult.Items || [];
    console.log(`[createFlag] Found ${connectionItems.length} connection(s) to notify.`);

    // 7) Build the correct WebSocket endpoint
    const domainName = event.requestContext.domainName; // e.g. "rr0pwgb4w9.execute-api.ap-southeast-2.amazonaws.com"
    const stage = event.requestContext.stage;           // e.g. "$default"
    const wsEndpoint = process.env.WEBSOCKET_ENDPOINT;   // from serverless.yml
    // (You could also reconstruct from domainName + stage if both HTTP+WS share the same URL,
    // but using WEBSOCKET_ENDPOINT is more reliable.)

    console.log("[createFlag] Broadcasting to WS endpoint:", wsEndpoint);

    // 8) Create the API Gateway Management client
    const apigwClient = new ApiGatewayManagementApiClient({
      region: REGION,
      endpoint: wsEndpoint,
    });

    // 9) Build payload once (as a Buffer) for efficiency
    const payloadBuffer = Buffer.from(JSON.stringify({ event: "flag-created", flag: newFlag }));

    // 10) Post to every connectionId; delete stale ones on 404/410
    const postCalls = connectionItems.map(({ connectionId }) =>
      apigwClient
        .send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: payloadBuffer,
          })
        )
        .then(() => {
          console.log(`[createFlag] Successfully posted to ${connectionId}`);
        })
        .catch(async (err) => {
          const status = err.$metadata?.httpStatusCode;
          console.error(
            `[createFlag] postToConnection error for ${connectionId}:`,
            status,
            err.name || err.message
          );
          if (status === 404 || status === 410) {
            console.log(`[createFlag] Deleting stale connection ${connectionId}`);
            try {
              await ddb.send(
                new DeleteCommand({
                  TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
                  Key: { connectionId },
                })
              );
              console.log(`[createFlag] Deleted stale connection ${connectionId}`);
            } catch (deleteErr) {
              console.error(
                `[createFlag] Failed to delete stale connection ${connectionId}:`,
                deleteErr
              );
            }
          }
        })
    );

    // 11) Wait for all broadcast attempts (and stale‐deletions) to finish
    await Promise.all(postCalls);
    console.log("[createFlag] Broadcast complete");

    // 12) Return the newly created flag back to the caller
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFlag),
    };
  } catch (err) {
    console.error("[createFlag] Unexpected error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to create flag." }),
    };
  }
};
