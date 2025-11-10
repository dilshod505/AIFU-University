// src/hooks/useNotificationSocket.ts
import { useEffect, useRef } from "react";

export const useNotificationSocket = (
  onNewNotification: (data: any) => void,
) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/^http/, "ws") +
      "/ws-notification";

    console.log("🔗 Connecting to WebSocket:", wsUrl);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🔔 New notification:", data);
        onNewNotification(data);
      } catch (e) {
        console.error("❌ Invalid WebSocket message:", e);
      }
    };

    socket.onerror = (error) => {
      console.error("⚠️ WebSocket error:", error);
    };

    socket.onclose = (e) => {
      console.warn("🔌 WebSocket closed:", e.reason);
      // avtomatik qayta ulanadi
      setTimeout(() => {
        console.log("♻️ Reconnecting WebSocket...");
        useNotificationSocket(onNewNotification);
      }, 5000);
    };

    return () => {
      socket.close();
    };
  }, [onNewNotification]);
};
