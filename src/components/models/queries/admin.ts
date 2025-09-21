import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

export const useAdministrators = ({
  pageNumber,
  sortDirection,
}: {
  pageNumber: number;
  sortDirection: "asc" | "desc";
}) =>
  useQuery({
    queryKey: ["administrators", pageNumber, sortDirection],
    queryFn: async () => {
      const res = await api.get(
        `/super-admin/admins?pageNumber=${pageNumber}&size=10&sortDirection=${sortDirection}`,
      );
      return res.data;
    },

    select: (data: Record<string, any>) => data?.data,
  });

export const useAdminDelete = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/super-admin/admins/${id}`);
      return res.data; // <-- natijani qaytaramiz
    },
  });
};

export const useCreateAdministrator = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post("/super-admin/admins", data);
      return res.data;
    },
  });
};

export const useActivateAccount = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await api.post(`/super-admin/admins/activate`, data);
      return res.data;
    },
  });
};
