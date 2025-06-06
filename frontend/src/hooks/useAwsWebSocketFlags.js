// src/hooks/useAwsWebSocketFlags.js
import { useEffect } from "react";

export default function useAwsWebSocketFlags(onEvent) {
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl || wsUrl.includes("<")) {
      console.warn(
        "[useAwsWebSocketFlags] Skipping WebSocket subscription: " +
          "VITE_WEBSOCKET_URL is not set or still a placeholder."
      );
      return;
    }

    console.log("[useAwsWebSocketFlags] attempting connect to", wsUrl);
    const ws = new WebSocket(wsUrl);
    let didOpen = false;

    ws.onopen = () => {
      didOpen = true;
      console.log("[useAwsWebSocketFlags] WebSocket connected to", wsUrl);
    };

    ws.onmessage = (evt) => {
      try {
        console.log("[useAwsWebSocketFlags] Received raw message:", evt.data);
        const msg = JSON.parse(evt.data);

        if (
          msg.event === "flag-created" ||
          msg.event === "flag-updated" ||
          msg.event === "flag-deleted"
        ) {
          console.log(
            "[useAwsWebSocketFlags] Parsed message:",
            msg,
            "→ invoking onEvent()"
          );
          onEvent();
        }
      } catch (err) {
        console.error("[useAwsWebSocketFlags] WebSocket parse error:", err);
      }
    };

    ws.onclose = (closeEvent) =>
      console.log(`[useAwsWebSocketFlags] WebSocket closed (code ${closeEvent.code})`);

    ws.onerror = (err) => {
      // Only log if the socket had previously opened
      if (didOpen) {
        console.error("[useAwsWebSocketFlags] Encountered error:", err);
      }
    };

    return () => {
      console.log("[useAwsWebSocketFlags] Cleaning up WebSocket");
      // Always attempt to close if still open/connecting
      if (
        ws.readyState === WebSocket.CONNECTING ||
        ws.readyState === WebSocket.OPEN
      ) {
        ws.close();
      }
    };
  }, [onEvent]);
}
