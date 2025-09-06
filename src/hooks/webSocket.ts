import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useNotificationsSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000/ws/notifications");

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🔔 New notification:", data);

        // react-query cache ni yangilash
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } catch (err) {
        console.error("❌ WS parse error:", err);
      }
    };

    socket.onclose = () => {
      console.log("⚠️ WebSocket closed. Reconnecting...");
      // reconnect qilish uchun timeout qo‘yish mumkin
      setTimeout(() => useNotificationsSocket(), 3000);
    };

    return () => {
      socket.close();
    };
  }, [queryClient]);
}
