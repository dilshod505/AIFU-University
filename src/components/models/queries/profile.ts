import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/admin/profile");
      return res.data;
    },
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      surname: string;
      image: string;
    }) => {
      const res = await api.patch("/admin/profile", data);
      return res.data;
    },
    onSuccess: () => {
      // profile qayta fetch qilinadi
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useAdmin = () =>
  useQuery({
    queryKey: ["admin"],
    queryFn: async () => {
      const res = await api.get("/admin/admin-statistics/top");
      return res.data;
    },
  });

export const useAdminReturnBooks = () =>
  useQuery({
    queryKey: ["admin-return-books"],
    queryFn: async () => {
      const res = await api.get("/admin/admin-statistics/return-books");
      return res.data;
    },
  });

export const useAdminIssuedBooks = () =>
  useQuery({
    queryKey: ["admin-issued-books"],
    queryFn: async () => {
      const res = await api.get("/admin/admin-statistics/issued-books");
      return res.data;
    },
  });

export const useAdminExtendedBooks = () =>
  useQuery({
    queryKey: ["admin-extended-books"],
    queryFn: async () => {
      const res = await api.get("/admin/admin-statistics/extended-books");
      return res.data.data; // ✅
    },
  });

export const useAdminActivity = () =>
  useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const res = await api.get("/admin/admin-statistics/activity");
      return res.data;
    },
  });

export const useAdminActivityToday = () =>
  useQuery({
    queryKey: ["admin-activity-today"],
    queryFn: async () => {
      const res = await api.get("/admin/admin-statistics/activity/today");
      return res.data;
    },
  });

// models/queries/profile.ts ichida
export const useAdminActivityAnalytics = (
  period: "current-month" | "last-month" = "current-month",
) =>
  useQuery({
    queryKey: ["admin-activity-analytics", period],
    queryFn: async () => {
      const res = await api.get("/admin/admin-statistics/activity/analytics", {
        params: { period },
      });
      return res.data;
    },
  });
