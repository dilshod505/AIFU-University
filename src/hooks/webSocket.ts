import { useEffect } from "react";

const useNotificationSocket = (onNewNotification: (data: any) => void) => {
  useEffect(() => {
    const ws = new WebSocket("wss://api/ws/notifications");

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🔔 New notification:", data);
        onNewNotification(data);
      } catch (e) {
        console.error("Invalid WS message", e);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected");
    };

    return () => ws.close();
  }, [onNewNotification]);
};
