import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/notification/${id}`);
      return res.data;
    },
    onSuccess: async () => {
      // O'chirilgandan keyin bildirishnomalar ro'yxatini yangilaydi
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
