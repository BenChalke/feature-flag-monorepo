// handlers/bulkUpdateFlags.js
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
    authorize(event);

    const { ids, enabled } = JSON.parse(event.body || "{}");
    if (!Array.isArray(ids) || ids.some((i) => typeof i !== "number") || typeof enabled !== "boolean") {
      return buildResponse(400, { error: "Invalid payload." });
    }

    // 1) Update each flag
    await Promise.all(
      ids.map((id) =>
        ddb.send(
          new UpdateCommand({
            TableName: process.env.DYNAMODB_FLAGS_TABLE,
            Key: { id },
            UpdateExpression: "SET enabled = :e",
            ExpressionAttributeValues: { ":e": enabled },
          })
        )
      )
    );

    // 2) Broadcast bulk-updated event
    const connections = (
      (await ddb.send(
        new ScanCommand({
          TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
          ProjectionExpression: "connectionId",
        })
      )).Items || []
    );
    const apigw = new ApiGatewayManagementApiClient({
      region: REGION,
      endpoint: WS_ENDPOINT,
    });
    const payload = Buffer.from(JSON.stringify({ event: "flags-updated", ids, enabled }));

    await Promise.all(
      connections.map(({ connectionId }) =>
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

    return buildResponse(200, { success: true });
  } catch (err) {
    console.error("bulkUpdateFlags error:", err);
    const unauthorized = err.message === "Not authenticated";
    return buildResponse(unauthorized ? 401 : 500, {
      error: unauthorized ? "Not authenticated." : "Failed to bulk update flags.",
    });
  }
};
