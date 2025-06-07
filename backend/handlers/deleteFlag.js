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
const { authorize } = require("./auth/util");

const REGION = process.env.AWS_REGION || "us-east-1";
const WS_ENDPOINT = process.env.WEBSOCKET_ENDPOINT;
const ddbClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports.handler = async (event) => {
  try {
    // 0) Auth
    authorize(event);

    // 1) Parse
    const flagId = parseInt(event.pathParameters.id, 10);
    if (isNaN(flagId)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid flag ID." }),
      };
    }

    // 2) Delete item
    await ddb.send(
      new DeleteCommand({
        TableName: process.env.DYNAMODB_FLAGS_TABLE,
        Key: { id: flagId },
      })
    );

    // 3) Broadcast
    const connectionItems = (
      (await ddb.send(
        new ScanCommand({
          TableName: process.env.DYNAMODB_CONNECTIONS_TABLE,
          ProjectionExpression: "connectionId",
        })
      )).Items || []
    );
    const apigwClient = new ApiGatewayManagementApiClient({
      region: REGION,
      endpoint: WS_ENDPOINT,
    });
    const payload = Buffer.from(
      JSON.stringify({ event: "flag-deleted", id: flagId })
    );

    await Promise.all(
      connectionItems.map(({ connectionId }) =>
        apigwClient.send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: payload,
          })
        ).catch(async (err) => {
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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("deleteFlag error:", err);
    const unauthorized = err.message === "Not authenticated";
    return {
      statusCode: unauthorized ? 401 : 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: unauthorized ? "Not authenticated." : "Failed to delete flag.",
      }),
    };
  }
};
