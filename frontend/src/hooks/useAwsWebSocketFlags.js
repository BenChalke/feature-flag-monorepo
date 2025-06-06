// src/hooks/useAwsWebSocketFlags.js
import { useEffect } from "react";

export default function useAwsWebSocketFlags(onEvent) {
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl || wsUrl.includes("<")) {
      console.warn(
        "Skipping WebSocket subscription: " +
          "VITE_WEBSOCKET_URL is not set or still a placeholder."
      );
      return;
    }

    console.log("attempting connect to", wsUrl);
    const ws = new WebSocket(wsUrl);
    let didOpen = false;

    ws.onopen = () => {
      didOpen = true;
      console.log("WebSocket connected to", wsUrl);
    };

    ws.onmessage = (evt) => {
      try {
        console.log("Received raw message:", evt.data);
        const msg = JSON.parse(evt.data);

        if (
          msg.event === "flag-created" ||
          msg.event === "flag-updated" ||
          msg.event === "flag-deleted"
        ) {
          console.log(
            "Parsed message:",
            msg,
            "→ invoking onEvent()"
          );
          onEvent();
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onclose = (closeEvent) =>
      console.log(`WebSocket closed (code ${closeEvent.code})`);

    ws.onerror = (err) => {
      // Only log if the socket had previously opened
      if (didOpen) {
        console.error("Encountered error:", err);
      }
    };

    return () => {
      console.log("Cleaning up WebSocket");
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
