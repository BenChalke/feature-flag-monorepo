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

const VALID_ENVS = ["Production", "Staging", "Development"];

module.exports.handler = async (event) => {
  try {
    // ─── AUTH ─────────────────────────────────────────────────────
    authorize(event);

    // ─── BODY VALIDATION ─────────────────────────────────────────
    const body = JSON.parse(event.body || "{}");
    const {
      name,
      environment,
      enabled,
      created_at,
      tags,
      description,
      modified_at,
    } = body;

    // required: name & environment
    if (typeof name !== "string" || !name.trim()) {
      return buildResponse(400, { error: "Invalid or missing `name`." });
    }
    if (typeof environment !== "string" || !VALID_ENVS.includes(environment)) {
      return buildResponse(400, {
        error: "Invalid or missing `environment`.",
      });
    }

    // optional fields with defaults
    const flagEnabled = typeof enabled === "boolean" ? enabled : false;
    const flagCreatedAt =
      typeof created_at === "string" && created_at.trim()
        ? created_at
        : new Date().toISOString();
    const flagModifiedAt =
      typeof modified_at === "string" && modified_at.trim()
        ? modified_at
        : "";
    const flagTags = Array.isArray(tags)
      ? tags.filter((t) => typeof t === "string")
      : [];
    const flagDescription =
      typeof description === "string" ? description : "";

    // ─── NEW FLAG ID ─────────────────────────────────────────────
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
      enabled: flagEnabled,
      created_at: flagCreatedAt,
      modified_at: flagModifiedAt,
      tags: flagTags,
      description: flagDescription,
    };

    await ddb.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_FLAGS_TABLE,
        Item: newFlag,
      })
    );

    // ─── BROADCAST ────────────────────────────────────────────────
    const connections = (
      (
        await ddb.send(
          new ScanCommand({
            TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
            ProjectionExpression: "connectionId",
          })
        )
      ).Items || []
    );
    const wsEndpoint = process.env.WEBSOCKET_ENDPOINT;
    const apigw = new ApiGatewayManagementApiClient({
      region: REGION,
      endpoint: wsEndpoint,
    });
    const payload = Buffer.from(
      JSON.stringify({ event: "flag-created", flag: newFlag })
    );

    await Promise.all(
      connections.map(({ connectionId }) =>
        apigw
          .send(
            new PostToConnectionCommand({
              ConnectionId: connectionId,
              Data: payload,
            })
          )
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
