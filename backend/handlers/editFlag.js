// handlers/editFlag.js
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
const { authorize, buildResponse } = require("./auth/util");

const REGION = process.env.AWS_REGION || "us-east-1";
const WS_ENDPOINT = process.env.WEBSOCKET_ENDPOINT;
const ddbClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports.handler = async (event) => {
  try {
    // ─── AUTH ─────────────────────────────────────────────────────
    authorize(event);

    // ─── PARSE & VALIDATE ────────────────────────────────────────
    const flagId = parseInt(event.pathParameters.id, 10);
    const body = JSON.parse(event.body || "{}");
    const { name, description, tags, modified_at } = body;

    if (typeof name !== "string" || !name.trim()) {
      return buildResponse(400, { error: "Invalid or missing `name`." });
    }
    if (description !== undefined && typeof description !== "string") {
      return buildResponse(400, { error: "Invalid `description`." });
    }
    if (modified_at !== undefined && typeof modified_at !== "string") {
      return buildResponse(400, { error: "Invalid `modified_at`." });
    }
    if (tags !== undefined) {
      if (
        !Array.isArray(tags) ||
        !tags.every((t) => typeof t === "string")
      ) {
        return buildResponse(400, { error: "Invalid `tags` array." });
      }
    }

    // ─── BUILD UPDATE EXPRESSION ─────────────────────────────────
    let UpdateExpression = "SET #n = :n";
    const ExpressionAttributeNames = { "#n": "name" };
    const ExpressionAttributeValues = { ":n": name.trim() };

    if (description !== undefined) {
      UpdateExpression += ", #d = :d";
      ExpressionAttributeNames["#d"] = "description";
      ExpressionAttributeValues[":d"] = description;
    }
    if (modified_at !== undefined) {
      UpdateExpression += ", #m = :m";
      ExpressionAttributeNames["#m"] = "modified_at";
      ExpressionAttributeValues[":m"] = modified_at;
    }
    if (tags !== undefined) {
      UpdateExpression += ", #t = :t";
      ExpressionAttributeNames["#t"] = "tags";
      ExpressionAttributeValues[":t"] = tags;
    }

    // ─── UPDATE DDB ──────────────────────────────────────────────
    await ddb.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_FLAGS_TABLE,
        Key: { id: flagId },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      })
    );

    // ─── BROADCAST ───────────────────────────────────────────────
    const connectionItems = (
      (
        await ddb.send(
          new ScanCommand({
            TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
            ProjectionExpression: "connectionId",
          })
        )
      ).Items || []
    );
    const apigw = new ApiGatewayManagementApiClient({
      region: REGION,
      endpoint: WS_ENDPOINT,
    });
    const payload = Buffer.from(
      JSON.stringify({ event: "flag-updated", id: flagId })
    );

    await Promise.all(
      connectionItems.map(({ connectionId }) =>
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

    return buildResponse(200, { success: true });
  } catch (err) {
    console.error("editFlag error:", err);
    const unauthorized = err.message === "Not authenticated";
    return buildResponse(unauthorized ? 401 : 500, {
      error: unauthorized
        ? "Not authenticated."
        : "Failed to edit flag.",
    });
  }
};
