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
const { authorize, buildResponse } = require("./auth/util");

// Region + clients
const REGION = process.env.AWS_REGION || "us-east-1";
const ddbClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports.handler = async (event) => {
  try {
    // ─── AUTH ─────────────────────────────────────────────────────
    authorize(event);

    // ─── BODY VALIDATION ─────────────────────────────────────────
    const { name, environment } = JSON.parse(event.body || "{}");
    if (
      typeof name !== "string" ||
      !name.trim() ||
      !["Production", "Staging", "Development"].includes(environment)
    ) {
      return buildResponse(400, { error: "Invalid `name` or `environment`." });
    }

    // ─── NEW FLAG ID ──────────────────────────────────────────────
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

    // ─── PUT NEW FLAG ────────────────────────────────────────────
    const newFlag = {
      id: newId,
      name: name.trim(),
      environment,
      enabled: false,
      created_at: new Date().toISOString(),
    };
    await ddb.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_FLAGS_TABLE,
        Item: newFlag,
      })
    );

    // ─── BROADCAST ────────────────────────────────────────────────
    const connectionItems = (
      (await ddb.send(
        new ScanCommand({
          TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
          ProjectionExpression: "connectionId",
        })
      )).Items || []
    );
    const wsEndpoint = process.env.WEBSOCKET_ENDPOINT;
    const apigw = new ApiGatewayManagementApiClient({
      region: REGION,
      endpoint: wsEndpoint,
    });
    const payload = Buffer.from(JSON.stringify({ event: "flag-created", flag: newFlag }));

    await Promise.all(
      connectionItems.map(({ connectionId }) =>
        apigw
          .send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: payload }))
          .catch(async (err) => {
            const status = err.$metadata?.httpStatusCode;
            if (status === 404 || status === 410) {
              await ddb.send(
                new DeleteCommand({
                  TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
                  Key: { connectionId },
                })
              );
            }
          })
      )
    );

    return buildResponse(201, newFlag);
  } catch (err) {
    console.error("createFlag error:", err);
    const unauthorized = err.message === "Not authenticated";
    return buildResponse(unauthorized ? 401 : 500, {
      error: unauthorized ? "Not authenticated." : "Failed to create flag.",
    });
  }
};
