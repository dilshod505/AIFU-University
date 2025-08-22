import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useGetNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get(`/admin/notification`);
      return res.data;
    },
  });

export const useGetNotificationById = (id?: number) =>
  useQuery({
    queryKey: ["notification-id", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get(`/admin/notification/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useDeleteNotification = () =>
  useQuery({
    queryKey: ["delete-notification"],
    queryFn: async (id: number | any) => {
      const res = await api.delete(`/admin/notification/${id}`);
      return res.data;
    },
  });
